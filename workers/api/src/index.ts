import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Anthropic from '@anthropic-ai/sdk';

type Bindings = {
    DB: D1Database;
    AI: Ai;
    ANTHROPIC_API_KEY: string;
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
    const maxAbstractLength = 1000;

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
        ? `Research query context: "${query}"\n\nPlease synthesize insights from the following ${truncatedArticles.length} articles:\n\n${JSON.stringify(truncatedArticles, null, 2)}`
        : `Please synthesize insights from the following ${truncatedArticles.length} articles:\n\n${JSON.stringify(truncatedArticles, null, 2)}`;

    try {
        const anthropic = new Anthropic({
            apiKey: c.env.ANTHROPIC_API_KEY,
        });

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 2048,
            messages: [
                { role: 'user', content: userContent }
            ],
            system: systemPrompt,
        });

        const textContent = response.content.find(block => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
            throw new Error('No text response from Claude');
        }

        return c.json({
            success: true,
            summary: textContent.text,
            articleCount: truncatedArticles.length,
            totalArticles: articles.length,
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

app.get('/api/study/:id', async (c) => {
    const id = c.req.param('id');

    // Parallel fetch for details, mutations, links
    const studyQuery = c.env.DB.prepare('SELECT * FROM studies WHERE id = ?').bind(id);
    const mutationsQuery = c.env.DB.prepare('SELECT gene_symbol FROM mutations WHERE study_id = ?').bind(id);
    const linksQuery = c.env.DB.prepare('SELECT url, link_type FROM links WHERE study_id = ?').bind(id);

    const [study, mutations, links] = await Promise.all([
        studyQuery.first(),
        mutationsQuery.all(),
        linksQuery.all()
    ]);

    if (!study) return c.json({ error: 'Not found' }, 404);

    return c.json({
        ...study,
        mutations: mutations.results?.map((m: any) => m.gene_symbol) || [],
        links: links.results || []
    });
});

export default app;
