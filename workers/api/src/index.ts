import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Anthropic from '@anthropic-ai/sdk';
import type {
    Document,
    DocumentUploadRequest,
    DocumentUploadResponse,
    PMCOARecord,
    PMCOACheckResponse,
    DocumentListQuery,
    DocumentListResponse,
    DocumentChunk,
    BatchChunkRequest,
    BatchChunkResponse
} from './rag-types';

type Bindings = {
    DB: D1Database;
    AI: Ai;
    ANTHROPIC_API_KEY: string;
    DOCUMENTS: R2Bucket;
    VECTORIZE: VectorizeIndex;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

app.get('/api/search', async (c) => {
    const {
        q,
        mutation,
        disease,
        tag,
        treatment,
        year_start,
        year_end,
        complex_karyotype,
        limit = '50',
        offset = '0'
    } = c.req.query();

    let query = `
    SELECT DISTINCT s.* 
    FROM studies s
  `;
    const params: any[] = [];
    const constraints: string[] = [];

    // Joins if filtering by related tables
    if (mutation) {
        query += ` JOIN mutations m ON s.id = m.study_id`;
        // If multiple mutations, we might need GROUP BY and HAVING count, but let's assume ANY mutation for now or do "IN".
        // Or if filtered by comma separated list "FLT3,NPM1" -> IN ('FLT3', 'NPM1')
        const mutations = mutation.split(',').map(m => m.trim());
        constraints.push(`m.gene_symbol IN (${mutations.map(() => '?').join(',')})`);
        params.push(...mutations);
    }

    if (tag) {
        query += ` JOIN study_topics t ON s.id = t.study_id`;
        const tags = tag.split(',').map(t => t.trim());
        constraints.push(`t.topic_name IN (${tags.map(() => '?').join(',')})`);
        params.push(...tags);
    }

    if (treatment) {
        query += ` JOIN treatments tr ON s.id = tr.study_id JOIN ref_treatments rt ON tr.treatment_id = rt.id`;
        const treatments = treatment.split(',').map(t => t.trim());
        constraints.push(`rt.code IN (${treatments.map(() => '?').join(',')})`);
        params.push(...treatments);
    }

    // Text Search
    if (q) {
        constraints.push(`(s.title LIKE ? OR s.abstract LIKE ?)`);
        params.push(`%${q}%`, `%${q}%`);
    }

    // Disease Subtype
    if (disease) {
        const diseases = disease.split(',').map(d => d.trim());
        // Assuming disease_subtype col is comma-separated or similar, but usage seems to be single or list.
        // If we store it as "AML,MDS", we use LIKE.
        const diseaseConditions = diseases.map(() => `s.disease_subtype LIKE ?`).join(' OR ');
        constraints.push(`(${diseaseConditions})`);
        diseases.forEach(d => params.push(`%${d}%`));
    }

    // Complex Karyotype
    if (complex_karyotype === 'true') {
        constraints.push(`s.has_complex_karyotype = 1`);
    }

    // Advanced Filters
    const { author, journal, institution } = c.req.query();

    if (author) {
        constraints.push(`s.authors LIKE ?`);
        params.push(`%${author}%`);
    }
    if (journal) {
        constraints.push(`s.journal LIKE ?`);
        params.push(`%${journal}%`);
    }
    if (institution) {
        constraints.push(`s.affiliations LIKE ?`);
        params.push(`%${institution}%`);
    }

    // Date Range
    if (year_start) {
        constraints.push(`s.pub_date >= ?`);
        // If it's just a year (4 digits), append start of year. Otherwise assume full date.
        params.push(/^\d{4}$/.test(year_start) ? `${year_start}-01-01` : year_start);
    }
    if (year_end) {
        constraints.push(`s.pub_date <= ?`);
        // If it's just a year, append end of year.
        params.push(/^\d{4}$/.test(year_end) ? `${year_end}-12-31` : year_end);
    }

    if (constraints.length > 0) {
        query += ` WHERE ` + constraints.join(' AND ');
    }

    query += ` ORDER BY s.pub_date DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    try {
        const { results } = await c.env.DB.prepare(query).bind(...params).run();

        // Create list of IDs to fetch their mutations efficiently
        if (results.length === 0) return c.json([]);

        const studyIds = results.map((r: any) => r.id);

        // D1 has a hard limit of 100 parameters per query (not SQLite's 999!)
        // https://developers.cloudflare.com/d1/platform/limits/
        // Using batch size of 50 to stay well below this limit
        const batchSize = 50;
        const mutationsMap: Record<number, string[]> = {};
        const treatmentsMap: Record<number, any[]> = {};

        // Process study IDs in batches
        for (let i = 0; i < studyIds.length; i += batchSize) {
            const batchIds = studyIds.slice(i, i + batchSize);
            const idsPlaceholder = batchIds.map(() => '?').join(',');

            try {
                const [mutationsRes, treatmentsRes] = await Promise.all([
                    c.env.DB.prepare(`
                        SELECT study_id, gene_symbol FROM mutations WHERE study_id IN (${idsPlaceholder})
                    `).bind(...batchIds).run(),
                    c.env.DB.prepare(`
                        SELECT tr.study_id, rt.code, rt.name, rt.type 
                        FROM treatments tr 
                        JOIN ref_treatments rt ON tr.treatment_id = rt.id 
                        WHERE tr.study_id IN (${idsPlaceholder})
                    `).bind(...batchIds).run()
                ]);

                // Merge batch results into maps
                if (mutationsRes.results) {
                    mutationsRes.results.forEach((m: any) => {
                        if (!mutationsMap[m.study_id]) mutationsMap[m.study_id] = [];
                        mutationsMap[m.study_id].push(m.gene_symbol);
                    });
                }

                if (treatmentsRes.results) {
                    treatmentsRes.results.forEach((t: any) => {
                        if (!treatmentsMap[t.study_id]) treatmentsMap[t.study_id] = [];
                        treatmentsMap[t.study_id].push({ code: t.code, name: t.name, type: t.type });
                    });
                }
            } catch (batchError: any) {
                console.error(`Batch query error for batch starting at ${i}, batchSize: ${batchIds.length}`, batchError);
                throw new Error(`Batch query failed: ${batchError.message} (batch size: ${batchIds.length})`);
            }
        }

        const enhancedResults = results.map((r: any) => ({
            ...r,
            mutations: mutationsMap[r.id] || [],
            treatments: treatmentsMap[r.id] || []
        }));

        return c.json(enhancedResults);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// NLP-powered query parsing using Workers AI
app.post('/api/parse-query', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { query } = body;

    if (!query || typeof query !== 'string') {
        return c.json({ error: 'Query is required' }, 400);
    }

    const systemPrompt = `You are a search filter extractor for a leukemia research database.
Given a natural language query, extract structured filters as JSON.

Available filters:
- q: ONLY for keywords that do NOT match any other filter category below. Do not put gene names, disease names, treatments, or other recognized terms here.
- mutations: gene symbols like FLT3, NPM1, IDH1, IDH2, TP53, DNMT3A, TET2, ASXL1, RUNX1, CEBPA, KRAS, NRAS, WT1, SF3B1, GATA2, BCR-ABL1, PML-RARA, KIT
- diseases: AML (Acute Myeloid Leukemia), ALL (Acute Lymphoblastic Leukemia), CML (Chronic Myeloid Leukemia), CLL (Chronic Lymphocytic Leukemia), MDS (Myelodysplastic Syndromes), MPN (Myeloproliferative Neoplasms), DLBCL, MM
- treatments: chemotherapy drugs and protocols like "7+3", azacitidine (AZA), venetoclax (VEN), decitabine, cytarabine, daunorubicin, idarubicin
- tags: study topics like Prognosis, Biomarkers, MRD (Minimal Residual Disease), Clinical Trial, Transplant, Pediatric, Relapsed, Refractory
- yearStart: publication start year (YYYY format)
- yearEnd: publication end year (YYYY format)
- author: author name
- journal: journal name like Blood, Leukemia, JCO, NEJM

Rules:
1. Only include fields that are clearly indicated in the query
2. Use uppercase for gene symbols and disease codes
3. Recognize synonyms: "venetoclax" = "VEN", "azacitidine" = "AZA", "aza" = "AZA"
4. For date ranges like "from 2020" use yearStart, "until 2023" use yearEnd, "in 2024" use both
5. "recent" or "latest" means yearStart should be current year minus 2
6. NEVER put terms in "q" that belong in another filter category - only unrecognized keywords go in "q"
7. Respond ONLY with valid JSON object, no explanation or markdown`;

    try {
        const response = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ]
        });

        // Check if we got a valid response
        if (!response || !response.response) {
            throw new Error('No response from AI model');
        }

        // Extract JSON from response (handle potential markdown wrapping)
        let jsonStr = response.response.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
        }

        const parsed = JSON.parse(jsonStr);

        return c.json({
            success: true,
            filters: parsed,
            originalQuery: query
        });
    } catch (e: any) {
        console.error('Parse query error:', e);
        return c.json({
            success: false,
            error: 'Failed to parse query. Try being more specific.',
            originalQuery: query
        }, 500);
    }
});

// AI-powered research insights summarization using Claude
app.post('/api/summarize', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { articles, query } = body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        return c.json({ error: 'No articles provided' }, 400);
    }

    // Rate Limiting Logic (IP-based, 25 requests per hour)
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const now = Math.floor(Date.now() / 1000);
    const oneHourAgo = now - 3600;

    try {
        const usage = await c.env.DB.prepare(
            'SELECT count, last_reset FROM api_usage WHERE ip = ?'
        ).bind(ip).first<{ count: number, last_reset: number }>();

        if (usage) {
            if (usage.last_reset < oneHourAgo) {
                // Reset limit
                await c.env.DB.prepare(
                    'UPDATE api_usage SET count = 1, last_reset = ? WHERE ip = ?'
                ).bind(now, ip).run();
            } else if (usage.count >= 25) {
                const waitMinutes = Math.ceil((usage.last_reset + 3600 - now) / 60);
                return c.json({
                    error: `Rate limit exceeded. Please try again in ${waitMinutes} minutes.`,
                    retryAfter: waitMinutes * 60
                }, 429);
            } else {
                // Increment count
                await c.env.DB.prepare(
                    'UPDATE api_usage SET count = count + 1 WHERE ip = ?'
                ).bind(ip).run();
            }
        } else {
            // First time user
            await c.env.DB.prepare(
                'INSERT INTO api_usage (ip, count, last_reset) VALUES (?, 1, ?)'
            ).bind(ip, now).run();
        }
    } catch (dbError) {
        console.error('Rate limit DB error:', dbError);
        // Continue if DB fails (don't block user)
    }

    // With Claude's 200k context, we can analyze many more articles
    const maxArticles = 50;
    const maxAbstractLength = 3000;

    // Check for available full-text documents in D1
    const pmids = articles.slice(0, maxArticles).map((a: any) => a.pubmed_id || a.pmid || '').filter(Boolean);
    const pmidHolders = pmids.map(() => '?').join(',');

    let fullTextDocs: any[] = [];
    if (pmids.length > 0) {
        try {
            const { results } = await c.env.DB.prepare(`
                SELECT id, pmcid, pmid, filename 
                FROM documents 
                WHERE (pmid IN (${pmidHolders}) OR pmcid IN (${pmidHolders})) 
                AND status = 'ready'
            `).bind(...pmids, ...pmids).run();
            fullTextDocs = results || [];
        } catch (e) {
            console.error('Error checking full-text docs:', e);
        }
    }

    // Fetch chunks for available full-text docs (up to 5 per doc to avoid blowing context)
    let fullTextContext = '';
    const docsWithFullText = fullTextDocs.length;

    if (fullTextDocs.length > 0) {
        const docIds = fullTextDocs.map(d => d.id);
        const docIdHolders = docIds.map(() => '?').join(',');

        try {
            const { results: chunks } = await c.env.DB.prepare(`
                SELECT document_id, content 
                FROM chunks 
                WHERE document_id IN (${docIdHolders})
                AND chunk_index < 5
                ORDER BY document_id, chunk_index
            `).bind(...docIds).run();

            if (chunks && chunks.length > 0) {
                fullTextContext = "\n\n### FULL-TEXT RESEARCH DATA\n" +
                    "The following excerpts are from the full-text of available articles. Use these for deeper scientific insights than provided in abstracts alone:\n\n";

                fullTextDocs.forEach(doc => {
                    const docChunks = chunks.filter((ch: any) => ch.document_id === doc.id);
                    if (docChunks.length > 0) {
                        fullTextContext += `[Article Ref: ${pmids.indexOf(doc.pmid || doc.pmcid) + 1}] Title: ${doc.filename}\n`;
                        docChunks.forEach((ch: any) => {
                            fullTextContext += `${ch.content}\n`;
                        });
                        fullTextContext += "---\n";
                    }
                });
            }
        } catch (e) {
            console.error('Error fetching RAG chunks for summary:', e);
        }
    }

    const truncatedArticles = articles.slice(0, maxArticles).map((a: any, idx: number) => ({
        num: idx + 1,
        title: a.title || 'Untitled',
        abstract: a.abstract ? a.abstract.substring(0, maxAbstractLength) + (a.abstract.length > maxAbstractLength ? '...' : '') : 'No abstract',
        mutations: Array.isArray(a.mutations) ? a.mutations.join(', ') : '',
        diseases: Array.isArray(a.diseases) ? a.diseases.join(', ') : '',
        treatments: Array.isArray(a.treatments) ? a.treatments.map((t: any) => t.name).join(', ') : '',
        year: a.pub_date?.substring(0, 4) || 'Unknown'
    }));

    const systemPrompt = `You are a medical research synthesis expert specializing in leukemia and hematological malignancies. Your goal is to provide a high-level scientific synthesis that extracts specific metrics, identifies shared findings across studies, and distinguishes the quality of evidence.

Please provide a synthesis with these specific sections:

## Key Findings & Comparative Efficacy
- Extract specific metrics/stats (e.g., ORR, OS, HR, CI, p-values) whenever available in the abstracts.
- Identify common themes or conflicting results across multiple articles.
- Explicitly distinguish between:
    - **Clinical Evidence**: Findings from randomized controlled trials (RCTs), Phase I/II/III studies, or retrospective patient cohorts.
    - **Laboratory/Pre-clinical**: Findings from "wet work," cell lines, mouse models, or in-vitro molecular studies.
- Cite article numbers for EVERY claim (e.g., "Combination therapy showed 85% ORR [#1, #4], whereas monotherapy was less effective [#2]").

## Therapeutic Landscapes
- Synthesize trends in drug development, dosages, and combinations.
- Note any specific toxicity or safety signals mentioned.

## Molecular & Biomarker Profiles
- Deep dive into mutation-specific responses or prognostic biomarkers.
- How do genetic profiles influence the outcomes seen in the therapeutic section?

## Critical Gaps & Evidence Strength
- Which findings are preliminary (lab-only) vs. ready for clinical consideration?
- What specific questions remain unanswered based on the provided data?

Guidelines:
- Do not just mirror titles; read into the abstracts for data.
- Use scientific but accessible language.
- Use markdown formatting: ## for headers, **bold** for emphasis, and - for bullets.`;

    const userContent = query
        ? `Research query context: "${query}"\n\nPlease synthesize insights from the following ${truncatedArticles.length} articles:\n\n${JSON.stringify(truncatedArticles, null, 2)}${fullTextContext}`
        : `Please synthesize insights from the following ${truncatedArticles.length} articles:\n\n${JSON.stringify(truncatedArticles, null, 2)}${fullTextContext}`;

    try {
        const anthropic = new Anthropic({
            apiKey: c.env.ANTHROPIC_API_KEY,
        });

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 8192,
            messages: [
                { role: 'user', content: userContent }
            ],
            system: systemPrompt,
        });

        const textContent = response.content.find((block: any) => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text response from Claude');
        }

        const summary = textContent.text;
        const insightId = crypto.randomUUID();

        // Save to D1
        try {
            await c.env.DB.prepare(`
                INSERT INTO insights (
                    id, query, filter_summary, summary, 
                    article_count, analyzed_articles_json, is_rag_enhanced
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                insightId,
                query || 'General Search',
                '', // Store filter summary if needed
                summary,
                truncatedArticles.length,
                JSON.stringify(truncatedArticles.map(a => ({ title: a.title, diseases: a.diseases, mutations: a.mutations, year: a.year }))),
                docsWithFullText > 0
            ).run();
        } catch (dbError) {
            console.error('Failed to save insight to DB:', dbError);
        }

        return c.json({
            success: true,
            insightId,
            summary,
            articleCount: truncatedArticles.length,
            totalArticles: articles.length,
            isRagEnhanced: docsWithFullText > 0,
            fullTextDocCount: docsWithFullText,
            model: 'claude-3-5-sonnet-latest'
        });
    } catch (e: any) {
        console.error('Summarize error:', e);

        // Fallback to Workers AI if Claude fails
        try {
            const fallbackArticles = articles.slice(0, 15).map((a: any, idx: number) => ({
                num: idx + 1,
                title: a.title?.substring(0, 150) || 'Untitled',
                abstract: a.abstract ? a.abstract.substring(0, 200) + '...' : 'No abstract',
                mutations: Array.isArray(a.mutations) ? a.mutations.join(', ') : '',
                diseases: Array.isArray(a.diseases) ? a.diseases.join(', ') : '',
                year: a.pub_date?.substring(0, 4) || 'Unknown'
            }));

            const fallbackResponse = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: 'You are a medical research synthesis expert. Summarize the key findings from these articles briefly.' },
                    { role: 'user', content: JSON.stringify(fallbackArticles, null, 2) }
                ]
            });

            if (fallbackResponse?.response) {
                return c.json({
                    success: true,
                    summary: fallbackResponse.response,
                    articleCount: fallbackArticles.length,
                    totalArticles: articles.length,
                    model: 'llama-3-8b-instruct (fallback)'
                });
            }
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }

        return c.json({
            success: false,
            error: 'Failed to generate summary. Please try again.'
        }, 500);
    } finally {
        // Attempt to save to persistence if we have a summary (even if fallback)
        // This is done after the response is ready to not block the user, 
        // but since we need the ID in the response, we actually need to do it BEFORE returning.
        // I will move the return inside the try/catch and handle saving there.
    }
});

app.get('/api/insights/:id', async (c) => {
    const id = c.req.param('id');
    try {
        const insight = await c.env.DB.prepare(
            'SELECT * FROM insights WHERE id = ?'
        ).bind(id).first();

        if (!insight) {
            return c.json({ success: false, error: 'Insight not found' }, 404);
        }

        return c.json({
            success: true,
            insight: {
                ...insight,
                analyzedArticles: JSON.parse((insight as any).analyzed_articles_json || '[]')
            }
        });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

app.get('/api/export', async (c) => {
    const {
        q,
        mutation,
        disease,
        tag,
        treatment,
        year_start,
        year_end,
        complex_karyotype,
        limit = '1000' // Higher limit for export
    } = c.req.query();

    let query = `
    SELECT DISTINCT s.* 
    FROM studies s
  `;
    const params: any[] = [];
    const constraints: string[] = [];

    // Joins if filtering by related tables
    if (mutation) {
        query += ` JOIN mutations m ON s.id = m.study_id`;
        const mutations = mutation.split(',').map(m => m.trim());
        constraints.push(`m.gene_symbol IN (${mutations.map(() => '?').join(',')})`);
        params.push(...mutations);
    }

    if (tag) {
        query += ` JOIN study_topics t ON s.id = t.study_id`;
        const tags = tag.split(',').map(t => t.trim());
        constraints.push(`t.topic_name IN (${tags.map(() => '?').join(',')})`);
        params.push(...tags);
    }

    if (treatment) {
        query += ` JOIN treatments tr ON s.id = tr.study_id JOIN ref_treatments rt ON tr.treatment_id = rt.id`;
        const treatments = treatment.split(',').map(t => t.trim());
        constraints.push(`rt.code IN (${treatments.map(() => '?').join(',')})`);
        params.push(...treatments);
    }

    // Text Search
    if (q) {
        constraints.push(`(s.title LIKE ? OR s.abstract LIKE ?)`);
        params.push(`%${q}%`, `%${q}%`);
    }

    // Disease Subtype
    if (disease) {
        const diseases = disease.split(',').map(d => d.trim());
        const diseaseConditions = diseases.map(() => `s.disease_subtype LIKE ?`).join(' OR ');
        constraints.push(`(${diseaseConditions})`);
        diseases.forEach(d => params.push(`%${d}%`));
    }

    // Complex Karyotype
    if (complex_karyotype === 'true') {
        constraints.push(`s.has_complex_karyotype = 1`);
    }

    // Advanced Filters
    const { author, journal, institution } = c.req.query();

    if (author) {
        constraints.push(`s.authors LIKE ?`);
        params.push(`%${author}%`);
    }
    if (journal) {
        constraints.push(`s.journal LIKE ?`);
        params.push(`%${journal}%`);
    }
    if (institution) {
        constraints.push(`s.affiliations LIKE ?`);
        params.push(`%${institution}%`);
    }

    // Date Range
    if (year_start) {
        constraints.push(`s.pub_date >= ?`);
        params.push(/^\d{4}$/.test(year_start) ? `${year_start}-01-01` : year_start);
    }
    if (year_end) {
        constraints.push(`s.pub_date <= ?`);
        params.push(/^\d{4}$/.test(year_end) ? `${year_end}-12-31` : year_end);
    }

    if (constraints.length > 0) {
        query += ` WHERE ` + constraints.join(' AND ');
    }

    query += ` ORDER BY s.pub_date DESC LIMIT ?`;
    params.push(parseInt(limit));

    try {
        const { results } = await c.env.DB.prepare(query).bind(...params).run();

        if (results.length === 0) {
            return c.text('No results found', 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="leukemialens_export_${new Date().toISOString().split('T')[0]}.csv"`
            });
        }

        // Fetch mutations, topics, and treatments for the results
        const studyIds = results.map((r: any) => r.id);

        // D1 has a hard limit of 100 parameters per query (not SQLite's 999!)
        // https://developers.cloudflare.com/d1/platform/limits/
        // Using batch size of 50 to stay well below this limit
        const batchSize = 50;
        const mutationsMap: Record<number, string[]> = {};
        const topicsMap: Record<number, string[]> = {};
        const treatmentsMap: Record<number, string[]> = {};

        // Process study IDs in batches
        for (let i = 0; i < studyIds.length; i += batchSize) {
            const batchIds = studyIds.slice(i, i + batchSize);
            const idsPlaceholder = batchIds.map(() => '?').join(',');

            const [mutationsRes, topicsRes, treatmentsRes] = await Promise.all([
                c.env.DB.prepare(`
                    SELECT study_id, gene_symbol FROM mutations WHERE study_id IN (${idsPlaceholder})
                `).bind(...batchIds).run(),
                c.env.DB.prepare(`
                    SELECT study_id, topic_name FROM study_topics WHERE study_id IN (${idsPlaceholder})
                `).bind(...batchIds).run(),
                c.env.DB.prepare(`
                    SELECT tr.study_id, rt.name
                    FROM treatments tr
                    JOIN ref_treatments rt ON tr.treatment_id = rt.id
                    WHERE tr.study_id IN (${idsPlaceholder})
                `).bind(...batchIds).run()
            ]);

            // Merge batch results into maps
            mutationsRes.results?.forEach((m: any) => {
                if (!mutationsMap[m.study_id]) mutationsMap[m.study_id] = [];
                mutationsMap[m.study_id].push(m.gene_symbol);
            });

            topicsRes.results?.forEach((t: any) => {
                if (!topicsMap[t.study_id]) topicsMap[t.study_id] = [];
                topicsMap[t.study_id].push(t.topic_name);
            });

            treatmentsRes.results?.forEach((t: any) => {
                if (!treatmentsMap[t.study_id]) treatmentsMap[t.study_id] = [];
                treatmentsMap[t.study_id].push(t.name);
            });
        }

        // Convert to CSV
        const headers = ['ID', 'Title', 'Abstract', 'Publication Date', 'Journal', 'Disease', 'Mutations', 'Treatments', 'Topics', 'Authors', 'Affiliations', 'Link'];
        const csvRows = [headers.join(',')];

        results.forEach((r: any) => {
            const mutations = mutationsMap[r.id]?.join(', ') || '';
            const topics = topicsMap[r.id]?.join(', ') || '';
            const treatments = treatmentsMap[r.id]?.join(', ') || '';

            const row = [
                r.source_id || r.id,
                `"${(r.title || '').replace(/"/g, '""')}"`, // Escape quotes
                `"${(r.abstract || '').replace(/"/g, '""')}"`,
                r.pub_date,
                `"${(r.journal || '').replace(/"/g, '""')}"`,
                `"${(r.disease_subtype || '').replace(/"/g, '""')}"`,
                `"${mutations.replace(/"/g, '""')}"`,
                `"${treatments.replace(/"/g, '""')}"`,
                `"${topics.replace(/"/g, '""')}"`,
                `"${(r.authors || '').replace(/"/g, '""')}"`,
                `"${(r.affiliations || '').replace(/"/g, '""')}"`,
                `https://pubmed.ncbi.nlm.nih.gov/${(r.source_id || '').replace('PMID:', '')}/`
            ];
            csvRows.push(row.join(','));
        });

        return c.text(csvRows.join('\n'), 200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="leukemialens_export_${new Date().toISOString().split('T')[0]}.csv"`
        });
    } catch (e: any) {
        return c.text(`Error exporting: ${e.message}`, 500);
    }
});

app.get('/api/stats', async (c) => {
    try {
        const mutationStats = await c.env.DB.prepare(`
            SELECT gene_symbol as name, COUNT(*) as count 
            FROM mutations 
            GROUP BY gene_symbol 
            ORDER BY count DESC 
            LIMIT 50
        `).all();

        let topicStats = { results: [] };
        try {
            topicStats = await c.env.DB.prepare(`
                SELECT topic_name as name, COUNT(*) as count
                FROM study_topics
                GROUP BY topic_name
                ORDER BY count DESC
                LIMIT 50
            `).all();
        } catch (e) {
            // Table may not exist yet or be empty
            console.warn('study_topics query failed:', e);
        }

        let treatmentStats = { results: [] };
        try {
            treatmentStats = await c.env.DB.prepare(`
                SELECT rt.code as name, rt.name as full_name, COUNT(*) as count
                FROM treatments tr
                JOIN ref_treatments rt ON tr.treatment_id = rt.id
                GROUP BY rt.code, rt.name
                ORDER BY count DESC
                LIMIT 50
            `).all();
        } catch (e) {
            // Table may not exist yet or be empty
            console.warn('treatments query failed:', e);
        }

        // Transform
        const mutations: Record<string, number> = {};
        mutationStats.results?.forEach((r: any) => {
            mutations[r.name] = r.count;
        });

        const tags: Record<string, number> = {};
        topicStats.results?.forEach((r: any) => {
            tags[r.name] = r.count;
        });

        const treatments: Record<string, number> = {};
        treatmentStats.results?.forEach((r: any) => {
            treatments[r.name] = r.count;
        });

        return c.json({
            mutations,
            tags,
            treatments
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.get('/api/ontology', async (c) => {
    try {
        const diseases = await c.env.DB.prepare(`
            SELECT code, name 
            FROM ref_diseases 
            ORDER BY display_order
        `).all();

        const mutations = await c.env.DB.prepare(`
            SELECT gene_symbol, name, category, risk_class, disease_relevance
            FROM ref_mutations 
            ORDER BY display_order, gene_symbol
        `).all();

        const treatments = await c.env.DB.prepare(`
            SELECT id, code, name, type, description, display_order
            FROM ref_treatments
            ORDER BY display_order, name
        `).all();

        const treatmentComponents = await c.env.DB.prepare(`
            SELECT tc.protocol_id, tc.drug_id, 
                   p.code as protocol_code, 
                   d.code as drug_code
            FROM ref_treatment_components tc
            JOIN ref_treatments p ON tc.protocol_id = p.id
            JOIN ref_treatments d ON tc.drug_id = d.id
        `).all();

        return c.json({
            diseases: diseases.results || [],
            mutations: mutations.results || [],
            treatments: treatments.results || [],
            treatment_components: treatmentComponents.results || []
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.get('/api/database-stats', async (c) => {
    try {
        // Run all stats queries in parallel
        const [
            studiesCount,
            mutationsCount,
            topicsCount,
            treatmentsCount,
            refDiseases,
            refMutations,
            refTreatments,
            uniqueMutations,
            uniqueTopics,
            dateRange
        ] = await Promise.all([
            c.env.DB.prepare('SELECT COUNT(*) as count FROM studies').all(),
            c.env.DB.prepare('SELECT COUNT(*) as count FROM mutations').all(),
            c.env.DB.prepare('SELECT COUNT(*) as count FROM study_topics').all(),
            c.env.DB.prepare('SELECT COUNT(*) as count FROM treatments').all(),
            c.env.DB.prepare('SELECT COUNT(*) as count FROM ref_diseases').all(),
            c.env.DB.prepare('SELECT COUNT(*) as count FROM ref_mutations').all(),
            c.env.DB.prepare('SELECT COUNT(*) as count FROM ref_treatments').all(),
            c.env.DB.prepare('SELECT COUNT(DISTINCT gene_symbol) as count FROM mutations').all(),
            c.env.DB.prepare('SELECT COUNT(DISTINCT topic_name) as count FROM study_topics').all(),
            c.env.DB.prepare('SELECT MIN(pub_date) as min_date, MAX(pub_date) as max_date FROM studies WHERE pub_date IS NOT NULL').all()
        ]);

        const stats = {
            main_tables: {
                studies: studiesCount.results?.[0]?.count || 0,
                mutation_records: mutationsCount.results?.[0]?.count || 0,
                topic_records: topicsCount.results?.[0]?.count || 0,
                treatment_records: treatmentsCount.results?.[0]?.count || 0
            },
            ontology_tables: {
                reference_diseases: refDiseases.results?.[0]?.count || 0,
                reference_mutations: refMutations.results?.[0]?.count || 0,
                reference_treatments: refTreatments.results?.[0]?.count || 0
            },
            unique_values: {
                unique_mutations: uniqueMutations.results?.[0]?.count || 0,
                unique_topics: uniqueTopics.results?.[0]?.count || 0
            },
            date_range: {
                oldest_article: dateRange.results?.[0]?.min_date || null,
                newest_article: dateRange.results?.[0]?.max_date || null
            },
            generated_at: new Date().toISOString()
        };

        // Cache for 1 hour
        return c.json(stats, 200, {
            'Cache-Control': 'public, max-age=3600'
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Monthly coverage statistics for backfill planning
app.get('/api/coverage', async (c) => {
    const { year } = c.req.query();

    try {
        let monthlyCoverage;

        if (year) {
            // Get monthly breakdown for a specific year
            monthlyCoverage = await c.env.DB.prepare(`
                SELECT 
                    strftime('%Y', pub_date) as year,
                    strftime('%m', pub_date) as month,
                    COUNT(*) as count
                FROM studies 
                WHERE pub_date IS NOT NULL 
                  AND strftime('%Y', pub_date) = ?
                GROUP BY year, month
                ORDER BY year DESC, month DESC
            `).bind(year).all();
        } else {
            // Get yearly summary with monthly breakdown
            monthlyCoverage = await c.env.DB.prepare(`
                SELECT 
                    strftime('%Y', pub_date) as year,
                    strftime('%m', pub_date) as month,
                    COUNT(*) as count
                FROM studies 
                WHERE pub_date IS NOT NULL
                GROUP BY year, month
                ORDER BY year DESC, month DESC
            `).all();
        }

        // Get yearly totals
        const yearlyCoverage = await c.env.DB.prepare(`
            SELECT 
                strftime('%Y', pub_date) as year,
                COUNT(*) as count
            FROM studies 
            WHERE pub_date IS NOT NULL
            GROUP BY year
            ORDER BY year DESC
        `).all();

        // Transform monthly data into a more usable structure
        const monthlyByYear: Record<string, Record<string, number>> = {};
        monthlyCoverage.results?.forEach((row: any) => {
            if (!monthlyByYear[row.year]) {
                monthlyByYear[row.year] = {};
            }
            monthlyByYear[row.year][row.month] = row.count;
        });

        // Build yearly summary with monthly details
        const coverage = yearlyCoverage.results?.map((row: any) => {
            const yearData = monthlyByYear[row.year] || {};
            const months: Record<string, number> = {};

            // Fill in all 12 months (0 for missing)
            for (let m = 1; m <= 12; m++) {
                const monthKey = m.toString().padStart(2, '0');
                months[monthKey] = yearData[monthKey] || 0;
            }

            return {
                year: row.year,
                total: row.count,
                months,
                gaps: Object.entries(months)
                    .filter(([_, count]) => count === 0)
                    .map(([month]) => month)
            };
        }) || [];

        // Calculate overall stats
        const totalArticles = yearlyCoverage.results?.reduce((sum: number, row: any) => sum + row.count, 0) || 0;
        const yearsWithData = yearlyCoverage.results?.length || 0;
        const totalGaps = coverage.reduce((sum, y) => sum + y.gaps.length, 0);

        return c.json({
            summary: {
                total_articles: totalArticles,
                years_with_data: yearsWithData,
                total_month_gaps: totalGaps
            },
            coverage,
            generated_at: new Date().toISOString()
        }, 200, {
            'Cache-Control': 'public, max-age=1800'  // Cache for 30 minutes
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

app.get('/api/news/:disease', async (c) => {
    const disease = c.req.param('disease');
    // Using a more specific query to get better results
    const query = encodeURIComponent(`${disease} leukemia news`);
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const xml = await response.text();

        // Simple regex parsing for RSS item components
        const items: any[] = [];
        const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

        for (const match of itemMatches) {
            const content = match[1];

            // Helper to unescape XML entities
            const unescape = (str: string) => {
                return str
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'")
                    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
            };

            const title = unescape(content.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '');
            const link = content.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
            const pubDate = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
            const source = unescape(content.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || '');

            // Clean up titles (Google News often appends " - Source")
            let cleanTitle = title;
            if (source && title.endsWith(` - ${source}`)) {
                cleanTitle = title.substring(0, title.length - (source.length + 3));
            }

            items.push({
                title: cleanTitle,
                link,
                pubDate,
                source
            });

            if (items.length >= 8) break;
        }

        return c.json(items, 200, {
            'Cache-Control': 'public, max-age=3600' // Cache news for 1 hour
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ==========================================
// RAG PIPELINE ENDPOINTS
// ==========================================

// Check if a PMC article is available in Open Access
app.get('/api/pmc/check/:pmcid', async (c) => {
    const pmcid = c.req.param('pmcid');

    // Normalize PMCID format (accept with or without 'PMC' prefix)
    const normalizedPmcid = pmcid.toUpperCase().startsWith('PMC')
        ? pmcid.toUpperCase()
        : `PMC${pmcid}`;

    try {
        // Call PMC OA Web Service API
        const response = await fetch(
            `https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.fcgi?id=${normalizedPmcid}`
        );

        if (!response.ok) {
            return c.json<PMCOACheckResponse>({
                available: false,
                error: `PMC API returned status ${response.status}`
            });
        }

        const xmlText = await response.text();

        // Check for error in response
        if (xmlText.includes('<error')) {
            const errorMatch = xmlText.match(/<error[^>]*>([^<]*)<\/error>/);
            return c.json<PMCOACheckResponse>({
                available: false,
                pmcid: normalizedPmcid,
                error: errorMatch?.[1] || 'Article not found in PMC Open Access'
            });
        }

        // Parse the XML response to extract record info
        const recordMatch = xmlText.match(
            /<record[^>]*id="([^"]+)"[^>]*citation="([^"]+)"[^>]*license="([^"]+)"[^>]*retracted="([^"]+)"[^>]*>/
        );

        if (!recordMatch) {
            return c.json<PMCOACheckResponse>({
                available: false,
                pmcid: normalizedPmcid,
                error: 'Could not parse PMC response'
            });
        }

        // Extract links
        const links: PMCOARecord['links'] = [];
        const linkRegex = /<link[^>]*format="([^"]+)"[^>]*updated="([^"]+)"[^>]*href="([^"]+)"[^>]*\/>/g;
        let linkMatch;
        while ((linkMatch = linkRegex.exec(xmlText)) !== null) {
            links.push({
                format: linkMatch[1] as 'pdf' | 'tgz',
                updated: linkMatch[2],
                href: linkMatch[3]
            });
        }

        const record: PMCOARecord = {
            pmcid: recordMatch[1],
            citation: recordMatch[2],
            license: recordMatch[3],
            retracted: recordMatch[4] === 'yes',
            links
        };

        return c.json<PMCOACheckResponse>({
            available: true,
            pmcid: normalizedPmcid,
            record
        });
    } catch (e: any) {
        return c.json<PMCOACheckResponse>({
            available: false,
            pmcid: normalizedPmcid,
            error: e.message
        }, 500);
    }
});

// Convert PMID to PMCID using E-utilities
app.get('/api/pmc/convert/:pmid', async (c) => {
    const pmid = c.req.param('pmid');

    try {
        // Use NCBI ID Converter API
        const response = await fetch(
            `https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?ids=${pmid}&format=json`
        );

        if (!response.ok) {
            return c.json({ pmid, error: 'Conversion API error' }, 500);
        }

        const data = await response.json() as any;
        const record = data.records?.[0];

        if (!record || record.status === 'error') {
            return c.json({
                pmid,
                pmcid: null,
                error: record?.errmsg || 'No PMC ID found for this PMID'
            });
        }

        return c.json({
            pmid: record.pmid,
            pmcid: record.pmcid || null,
            doi: record.doi || null
        });
    } catch (e: any) {
        return c.json({ pmid, error: e.message }, 500);
    }
});

// Upload a document to R2 and create metadata record
app.post('/api/documents/upload', async (c) => {
    try {
        const contentType = c.req.header('content-type') || '';

        let documentData: DocumentUploadRequest;
        let formData: FormData | null = null;
        let fileBuffer: ArrayBuffer | null = null;

        if (contentType.includes('multipart/form-data')) {
            // Handle multipart form data (file upload)
            formData = await c.req.formData();
            const file = formData.get('file');

            if (!file || typeof file === 'string') {
                return c.json<DocumentUploadResponse>({
                    success: false,
                    error: 'No file provided'
                }, 400);
            }

            // At this point file is definitely a File object
            const fileObj = file as unknown as File;
            const metadata = formData.get('metadata') as string | null;
            documentData = metadata ? JSON.parse(metadata) : {};
            documentData.filename = documentData.filename || fileObj.name;
            documentData.fileSize = fileObj.size;

            // Detect format from file extension
            if (!documentData.format) {
                const ext = fileObj.name.split('.').pop()?.toLowerCase();
                if (ext === 'pdf') documentData.format = 'pdf';
                else if (ext === 'xml') documentData.format = 'xml';
                else if (ext === 'txt') documentData.format = 'txt';
                else documentData.format = 'pdf'; // default
            }
        } else {
            // Handle JSON body with base64 content
            documentData = await c.req.json();

            if (documentData.content) {
                // Decode base64 content
                const binaryString = atob(documentData.content);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                fileBuffer = bytes.buffer;
                documentData.fileSize = fileBuffer.byteLength;
            }
        }

        if (!documentData.filename) {
            return c.json<DocumentUploadResponse>({
                success: false,
                error: 'Filename is required'
            }, 400);
        }

        if (!documentData.source) {
            documentData.source = 'manual';
        }

        if (!documentData.format) {
            documentData.format = 'pdf';
        }

        // Generate document ID
        const docId = crypto.randomUUID();

        // Determine R2 key path
        let r2Key = documentData.pmcid
            ? `pmc/${documentData.pmcid}/${documentData.filename}`
            : `uploads/${docId}/${documentData.filename}`;

        // If status is skipped, use a special key path
        if (documentData.status === 'skipped') {
            const id = documentData.pmid || documentData.pmcid || docId;
            r2Key = `skipped/${id}`;
        }

        // Upload to R2 if we have file content
        if (formData) {
            const file = formData.get('file') as unknown as File;
            await c.env.DOCUMENTS.put(r2Key, file.stream(), {
                customMetadata: {
                    pmcid: documentData.pmcid || '',
                    pmid: documentData.pmid || '',
                    format: documentData.format,
                    source: documentData.source
                }
            });
        } else if (fileBuffer) {
            await c.env.DOCUMENTS.put(r2Key, fileBuffer, {
                customMetadata: {
                    pmcid: documentData.pmcid || '',
                    pmid: documentData.pmid || '',
                    format: documentData.format,
                    source: documentData.source
                }
            });
        }

        // Create document record in D1
        await c.env.DB.prepare(`
            INSERT INTO documents (
                id, pmcid, pmid, study_id, filename, source, format, 
                license, r2_key, file_size, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
            docId,
            documentData.pmcid || null,
            documentData.pmid || null,
            documentData.studyId || null,
            documentData.filename,
            documentData.source,
            documentData.format,
            documentData.license || null,
            r2Key,
            documentData.fileSize || null,
            documentData.status || (fileBuffer || formData ? 'pending' : 'awaiting_upload')
        ).run();

        // Fetch the created document
        const doc = await c.env.DB.prepare(
            'SELECT * FROM documents WHERE id = ?'
        ).bind(docId).first();

        return c.json<DocumentUploadResponse>({
            success: true,
            document: doc as unknown as Document
        });
    } catch (e: any) {
        console.error('Document upload error:', e);
        return c.json<DocumentUploadResponse>({
            success: false,
            error: e.message
        }, 500);
    }
});

// List documents with optional filtering
app.get('/api/documents', async (c) => {
    const { status, source, limit = '50', offset = '0' } = c.req.query();

    try {
        let query = 'SELECT * FROM documents';
        const constraints: string[] = [];
        const params: any[] = [];

        if (status) {
            constraints.push('status = ?');
            params.push(status);
        }

        if (source) {
            constraints.push('source = ?');
            params.push(source);
        }

        if (constraints.length > 0) {
            query += ' WHERE ' + constraints.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const { results } = await c.env.DB.prepare(query).bind(...params).run();

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM documents';
        if (constraints.length > 0) {
            countQuery += ' WHERE ' + constraints.join(' AND ');
        }
        const countResult = await c.env.DB.prepare(countQuery)
            .bind(...params.slice(0, -2))
            .first<{ total: number }>();

        return c.json<DocumentListResponse>({
            documents: results as unknown as Document[],
            total: countResult?.total || 0,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Get a specific document with pre-signed URL
app.get('/api/documents/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const doc = await c.env.DB.prepare(
            'SELECT * FROM documents WHERE id = ?'
        ).bind(id).first();

        if (!doc) {
            return c.json({ error: 'Document not found' }, 404);
        }

        // Check if file exists in R2 and get metadata
        const r2Object = await c.env.DOCUMENTS.head(doc.r2_key as string);

        return c.json({
            document: doc,
            fileExists: !!r2Object,
            httpMetadata: r2Object?.httpMetadata,
            size: r2Object?.size
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Get document content (for local processing)
app.get('/api/documents/:id/content', async (c) => {
    const id = c.req.param('id');

    try {
        const doc = await c.env.DB.prepare(
            'SELECT * FROM documents WHERE id = ?'
        ).bind(id).first();

        if (!doc) {
            return c.json({ error: 'Document not found' }, 404);
        }

        const r2Object = await c.env.DOCUMENTS.get(doc.r2_key as string);

        if (!r2Object) {
            return c.json({ error: 'File not found in storage' }, 404);
        }

        // Return the file with appropriate content type
        const contentType = doc.format === 'pdf'
            ? 'application/pdf'
            : doc.format === 'xml'
                ? 'application/xml'
                : 'text/plain';

        return new Response(r2Object.body, {
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${doc.filename}"`
            }
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Update document status (for processing pipeline)
app.patch('/api/documents/:id/status', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{ status: string; errorMessage?: string; chunkCount?: number }>().catch(() => null);

    if (!body || !body.status) {
        return c.json({ error: 'Status is required' }, 400);
    }

    try {
        const updates: string[] = ['status = ?'];
        const params: any[] = [body.status];

        if (body.status === 'ready') {
            updates.push("processed_at = datetime('now')");
        }

        if (body.errorMessage !== undefined) {
            updates.push('error_message = ?');
            params.push(body.errorMessage);
        }

        if (body.chunkCount !== undefined) {
            updates.push('chunk_count = ?');
            params.push(body.chunkCount);
        }

        params.push(id);

        await c.env.DB.prepare(
            `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...params).run();

        const doc = await c.env.DB.prepare(
            'SELECT * FROM documents WHERE id = ?'
        ).bind(id).first();

        return c.json({ success: true, document: doc });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// RAG Pipeline stats (enhanced for Stats page)
app.get('/api/rag/stats', async (c) => {
    try {
        const [
            totalDocs,
            byStatus,
            bySource,
            byFormat,
            totalChunks,
            totalStudies,
            recentDocs
        ] = await Promise.all([
            c.env.DB.prepare('SELECT COUNT(*) as count FROM documents').first<{ count: number }>(),
            c.env.DB.prepare(`
                SELECT status, COUNT(*) as count 
                FROM documents 
                GROUP BY status
            `).all(),
            c.env.DB.prepare(`
                SELECT source, COUNT(*) as count 
                FROM documents 
                GROUP BY source
            `).all(),
            c.env.DB.prepare(`
                SELECT format, COUNT(*) as count 
                FROM documents 
                GROUP BY format
            `).all(),
            c.env.DB.prepare('SELECT COUNT(*) as count FROM chunks').first<{ count: number }>(),
            c.env.DB.prepare('SELECT COUNT(*) as count FROM studies').first<{ count: number }>(),
            c.env.DB.prepare(`
                SELECT d.id, d.pmcid, d.filename, d.format, d.chunk_count, d.processed_at,
                       s.title
                FROM documents d
                LEFT JOIN studies s ON s.source_id = 'PMID:' || d.pmid OR s.source_id = d.pmcid
                WHERE d.status = 'ready'
                ORDER BY d.processed_at DESC
                LIMIT 5
            `).all()
        ]);

        const statusCounts: Record<string, number> = {};
        byStatus.results?.forEach((r: any) => statusCounts[r.status] = r.count);

        const sourceCounts: Record<string, number> = {};
        bySource.results?.forEach((r: any) => sourceCounts[r.source] = r.count);

        const formatCounts: Record<string, number> = {};
        byFormat.results?.forEach((r: any) => formatCounts[r.format] = r.count);

        const readyDocs = statusCounts['ready'] || 0;
        const totalStudiesCount = totalStudies?.count || 0;
        const coveragePercent = totalStudiesCount > 0
            ? Math.round((readyDocs / totalStudiesCount) * 10000) / 100
            : 0;

        return c.json({
            totalDocuments: totalDocs?.count || 0,
            readyDocuments: readyDocs,
            totalChunks: totalChunks?.count || 0,
            totalStudies: totalStudiesCount,
            ragCoveragePercent: coveragePercent,
            byStatus: statusCounts,
            bySource: sourceCounts,
            byFormat: formatCounts,
            recentlyProcessed: recentDocs.results?.map((d: any) => ({
                id: d.id,
                pmcid: d.pmcid,
                filename: d.filename,
                format: d.format,
                chunkCount: d.chunk_count,
                processedAt: d.processed_at,
                title: d.title
            })) || [],
            generatedAt: new Date().toISOString()
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// ==========================================
// CHUNK ENDPOINTS (Phase 2)
// ==========================================

// Get chunks for a document
app.get('/api/documents/:id/chunks', async (c) => {
    const docId = c.req.param('id');
    const { limit = '100', offset = '0' } = c.req.query();

    try {
        const { results } = await c.env.DB.prepare(`
            SELECT * FROM chunks 
            WHERE document_id = ? 
            ORDER BY chunk_index 
            LIMIT ? OFFSET ?
        `).bind(docId, parseInt(limit), parseInt(offset)).run();

        const countResult = await c.env.DB.prepare(
            'SELECT COUNT(*) as total FROM chunks WHERE document_id = ?'
        ).bind(docId).first<{ total: number }>();

        return c.json({
            chunks: results,
            total: countResult?.total || 0,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Batch create chunks with embeddings
app.post('/api/chunks/batch', async (c) => {
    try {
        const body = await c.req.json<BatchChunkRequest>();

        if (!body.documentId || !body.chunks || body.chunks.length === 0) {
            return c.json<BatchChunkResponse>({
                success: false,
                chunksCreated: 0,
                vectorsUpserted: 0,
                error: 'documentId and chunks are required'
            }, 400);
        }

        // Verify document exists
        const doc = await c.env.DB.prepare(
            'SELECT id FROM documents WHERE id = ?'
        ).bind(body.documentId).first();

        if (!doc) {
            return c.json<BatchChunkResponse>({
                success: false,
                chunksCreated: 0,
                vectorsUpserted: 0,
                error: 'Document not found'
            }, 404);
        }

        let chunksCreated = 0;
        let vectorsUpserted = 0;

        // Process chunks in batches (D1 has 100 param limit)
        const batchSize = 10;

        for (let i = 0; i < body.chunks.length; i += batchSize) {
            const batch = body.chunks.slice(i, i + batchSize);

            // Insert chunks into D1
            for (const chunk of batch) {
                await c.env.DB.prepare(`
                    INSERT INTO chunks (
                        id, document_id, chunk_index, content,
                        start_page, end_page, section_header, token_count,
                        embedding_id, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                `).bind(
                    chunk.id,
                    body.documentId,
                    chunk.chunkIndex,
                    chunk.content,
                    chunk.startPage || null,
                    chunk.endPage || null,
                    chunk.sectionHeader || null,
                    chunk.tokenCount || null,
                    chunk.id  // Use chunk ID as embedding ID
                ).run();

                chunksCreated++;
            }

            // Upsert embeddings to Vectorize
            const vectors = batch.map(chunk => ({
                id: chunk.id,
                values: chunk.embedding,
                metadata: {
                    documentId: body.documentId,
                    chunkIndex: chunk.chunkIndex,
                    sectionHeader: chunk.sectionHeader || ''
                }
            }));

            await c.env.VECTORIZE.upsert(vectors);
            vectorsUpserted += vectors.length;
        }

        // Update document chunk count
        await c.env.DB.prepare(
            'UPDATE documents SET chunk_count = ? WHERE id = ?'
        ).bind(chunksCreated, body.documentId).run();

        return c.json<BatchChunkResponse>({
            success: true,
            chunksCreated,
            vectorsUpserted
        });
    } catch (e: any) {
        console.error('Batch chunk error:', e);
        return c.json<BatchChunkResponse>({
            success: false,
            chunksCreated: 0,
            vectorsUpserted: 0,
            error: e.message
        }, 500);
    }
});

// Get a single chunk
app.get('/api/chunks/:id', async (c) => {
    const id = c.req.param('id');

    try {
        const chunk = await c.env.DB.prepare(
            'SELECT * FROM chunks WHERE id = ?'
        ).bind(id).first();

        if (!chunk) {
            return c.json({ error: 'Chunk not found' }, 404);
        }

        return c.json(chunk);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// Vector similarity search
app.post('/api/rag/search', async (c) => {
    try {
        const body = await c.req.json<{ query: string; topK?: number; documentIds?: string[] }>();

        if (!body.query) {
            return c.json({ error: 'Query is required' }, 400);
        }

        const topK = body.topK || 5;

        // Generate query embedding using Workers AI (bge-base-en-v1.5, 768-dim)
        // This matches the embeddings generated by both the local processor and ingest worker
        const embeddingResult = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
            text: body.query
        }) as { data: number[][] };

        if (!embeddingResult.data || !embeddingResult.data[0]) {
            return c.json({ error: 'Failed to generate query embedding' }, 500);
        }

        // Search Vectorize
        const searchResults = await c.env.VECTORIZE.query(
            embeddingResult.data[0],
            { topK, returnValues: false, returnMetadata: 'all' }
        );

        // Fetch chunk content from D1
        const chunkIds = searchResults.matches.map(m => m.id);

        if (chunkIds.length === 0) {
            return c.json({ matches: [], query: body.query });
        }

        const placeholders = chunkIds.map(() => '?').join(',');
        const { results: chunks } = await c.env.DB.prepare(`
            SELECT c.*, d.filename, d.pmcid
            FROM chunks c
            JOIN documents d ON c.document_id = d.id
            WHERE c.id IN (${placeholders})
        `).bind(...chunkIds).run();

        // Combine with scores
        const matches = searchResults.matches.map(match => {
            const chunk = chunks?.find((c: any) => c.id === match.id);
            return {
                id: match.id,
                score: match.score,
                chunk,
                metadata: match.metadata
            };
        });

        return c.json({
            query: body.query,
            matches
        });
    } catch (e: any) {
        console.error('RAG search error:', e);
        return c.json({ error: e.message }, 500);
    }
});

// ==========================================
// RAG QUERY WITH CLAUDE (Phase 4)
// ==========================================

// Token estimation: ~4 chars per token for English text
function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

// Build context from chunks with token limit
function buildContext(
    chunks: Array<{
        id: string;
        content: string;
        filename: string;
        pmcid?: string;
        start_page?: number;
        end_page?: number;
        score: number;
    }>,
    maxTokens: number
): { context: string; sources: any[]; tokensUsed: number } {
    const sources: any[] = [];
    const contextBlocks: string[] = [];
    let tokensUsed = 0;
    let index = 1;

    for (const chunk of chunks) {
        const pageRange = chunk.start_page && chunk.end_page
            ? `(pp. ${chunk.start_page}-${chunk.end_page})`
            : '';

        const block = `[${index}] From: "${chunk.filename}" ${chunk.pmcid ? `(${chunk.pmcid})` : ''} ${pageRange}
${chunk.content}
`;
        const blockTokens = estimateTokens(block);

        if (tokensUsed + blockTokens > maxTokens) {
            break; // Stop if we'd exceed the limit
        }

        contextBlocks.push(block);
        sources.push({
            index,
            documentId: chunk.id.split('-chunk-')[0] || chunk.id,
            chunkId: chunk.id,
            pmcid: chunk.pmcid,
            filename: chunk.filename,
            content: chunk.content.substring(0, 200) + '...',
            relevanceScore: chunk.score,
            pageRange: pageRange || undefined
        });

        tokensUsed += blockTokens;
        index++;
    }

    return {
        context: contextBlocks.join('\n---\n\n'),
        sources,
        tokensUsed
    };
}

// RAG Query endpoint with Claude synthesis
app.post('/api/rag/query', async (c) => {
    try {
        const body = await c.req.json<{
            query: string;
            topK?: number;
            maxContextTokens?: number;
            documentIds?: string[];
        }>();

        if (!body.query) {
            return c.json({ error: 'Query is required' }, 400);
        }

        const topK = Math.min(body.topK || 15, 50);
        const maxContextTokens = body.maxContextTokens || 150000;

        // Step 1: Generate query embedding
        const embeddingResult = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
            text: body.query
        }) as { data: number[][] };

        if (!embeddingResult.data?.[0]) {
            return c.json({ error: 'Failed to generate query embedding' }, 500);
        }

        // Step 2: Vector search
        const searchResults = await c.env.VECTORIZE.query(
            embeddingResult.data[0],
            { topK, returnValues: false, returnMetadata: 'all' }
        );

        if (searchResults.matches.length === 0) {
            return c.json({
                answer: "I couldn't find any relevant information in the research database for your query. Please try rephrasing your question or using different terms.",
                sources: [],
                usage: { contextTokens: 0, responseTokens: 0, totalTokens: 0, chunksUsed: 0 }
            });
        }

        // Step 3: Fetch chunk content from D1
        const chunkIds = searchResults.matches.map(m => m.id);
        const placeholders = chunkIds.map(() => '?').join(',');

        const { results: dbChunks } = await c.env.DB.prepare(`
            SELECT c.id, c.content, c.start_page, c.end_page, c.document_id,
                   d.filename, d.pmcid
            FROM chunks c
            JOIN documents d ON c.document_id = d.id
            WHERE c.id IN (${placeholders})
        `).bind(...chunkIds).run();

        // Combine with scores and sort by score
        const scoredChunks = searchResults.matches.map(match => {
            const chunk = dbChunks?.find((c: any) => c.id === match.id) as any;
            return {
                id: match.id,
                content: chunk?.content || '',
                filename: chunk?.filename || 'Unknown',
                pmcid: chunk?.pmcid,
                start_page: chunk?.start_page,
                end_page: chunk?.end_page,
                score: match.score
            };
        }).filter(c => c.content);

        // Step 4: Build context with token limit
        const { context, sources, tokensUsed } = buildContext(scoredChunks, maxContextTokens);

        // Step 5: Call Claude
        const anthropic = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY });

        const systemPrompt = `You are a knowledgeable medical research assistant specializing in hematologic malignancies (leukemia, lymphoma, myeloma). You help patients, caregivers, and researchers understand scientific literature.

IMPORTANT GUIDELINES:
- Synthesize information from the provided research excerpts to answer the user's question
- Always cite your sources using [1], [2], etc. to reference the numbered excerpts
- Be accurate and precise - if information isn't in the sources, say so
- Use clear, accessible language while maintaining scientific accuracy
- For treatment information, emphasize that decisions should be made with healthcare providers
- If the sources contain conflicting information, acknowledge this
- Organize your response with appropriate structure (paragraphs, bullet points) for readability`;

        const userPrompt = `Based on the following research excerpts, please answer this question:

**Question:** ${body.query}

---

**Research Excerpts:**

${context}

---

Please provide a comprehensive answer based on these sources, citing them with [1], [2], etc. as appropriate.`;

        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [
                { role: 'user', content: userPrompt }
            ],
            system: systemPrompt
        });

        // Extract text from response
        const answer = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as { type: 'text'; text: string }).text)
            .join('\n');

        return c.json({
            answer,
            sources,
            usage: {
                contextTokens: tokensUsed,
                responseTokens: response.usage?.output_tokens || 0,
                totalTokens: tokensUsed + (response.usage?.output_tokens || 0),
                chunksUsed: sources.length
            },
            model: response.model
        });

    } catch (e: any) {
        console.error('RAG query error:', e);
        return c.json({ error: e.message }, 500);
    }
});

export default app;
