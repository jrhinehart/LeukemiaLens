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
    BatchChunkResponse,
    RAGQueryRequest,
    RAGQueryResponse
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
        const documentStatusMap: Record<string, string> = {}; // PMID -> format (pdf, xml)

        // Process study IDs in batches
        for (let i = 0; i < studyIds.length; i += batchSize) {
            const batchIds = studyIds.slice(i, i + batchSize);
            const idsPlaceholder = batchIds.map(() => '?').join(',');

            try {
                const [mutationsRes, treatmentsRes, documentsRes] = await Promise.all([
                    c.env.DB.prepare(`
                        SELECT study_id, gene_symbol FROM mutations WHERE study_id IN (${idsPlaceholder})
                    `).bind(...batchIds).run(),
                    c.env.DB.prepare(`
                        SELECT tr.study_id, rt.code, rt.name, rt.type 
                        FROM treatments tr 
                        JOIN ref_treatments rt ON tr.treatment_id = rt.id 
                        WHERE tr.study_id IN (${idsPlaceholder})
                    `).bind(...batchIds).run(),
                    c.env.DB.prepare(`
                        SELECT pmid, format FROM documents 
                        WHERE pmid IN (${batchIds.map(() => '?').join(',')}) AND status = 'ready'
                    `).bind(...batchIds.map(id => {
                        const study: any = results.find((r: any) => r.id === id);
                        return study?.source_id ? study.source_id.replace('PMID:', '') : '';
                    }).filter(Boolean)).run()
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
                if (documentsRes.results) {
                    documentsRes.results.forEach((d: any) => {
                        documentStatusMap[d.pmid] = d.format;
                    });
                }
            } catch (batchError: any) {
                console.error(`Batch query error for batch starting at ${i}, batchSize: ${batchIds.length}`, batchError);
                throw new Error(`Batch query failed: ${batchError.message} (batch size: ${batchIds.length})`);
            }
        }

        const enhancedResults = results.map((r: any) => {
            const pmid = r.source_id ? r.source_id.replace('PMID:', '') : '';
            return {
                ...r,
                mutations: mutationsMap[r.id] || [],
                treatments: treatmentsMap[r.id] || [],
                full_text_type: documentStatusMap[pmid] || null
            };
        });

        return c.json(enhancedResults);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
    }
});

// NLP-powered query parsing using Workers AI
app.post('/api/parse-query', async (c) => {
    const body = await c.req.json<RAGQueryRequest>().catch(() => ({ query: '' } as RAGQueryRequest));
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

// Smart Query: Combines filter parsing + article fetch + insights trigger
// This powers the conversational Smart Search feature
app.post('/api/smart-query', async (c) => {
    try {
        const body = await c.req.json().catch(() => ({})) as any;
        const { query } = body;

        if (!query || typeof query !== 'string') {
            return c.json({ error: 'Query is required' }, 400);
        }

        // Step 1: Parse query to extract filters using Llama
        const filterSystemPrompt = `You are a search filter extractor for a leukemia research database.
Given a natural language query, extract structured filters as JSON.

Available filters:
- q: ONLY for keywords that do NOT match any other filter category below. Do not put gene names, disease names, treatments, or other recognized terms here.
- mutations: gene symbols like FLT3, NPM1, IDH1, IDH2, TP53, DNMT3A, TET2, ASXL1, RUNX1, CEBPA, KRAS, NRAS, WT1, SF3B1, GATA2, BCR-ABL1, PML-RARA, KIT
- diseases: AML (Acute Myeloid Leukemia), ALL (Acute Lymphoblastic Leukemia), CML (Chronic Myeloid Leukemia), CLL (Chronic Lymphocytic Leukemia), MDS (Myelodysplastic Syndromes), MPN (Myeloproliferative Neoplasms), DLBCL, MM
- treatments: chemotherapy drugs and protocols like "7+3", azacitidine (AZA), venetoclax (VEN), decitabine, cytarabine, daunorubicin, idarubicin
- tags: study topics like Prognosis, Biomarkers, MRD (Minimal Residual Disease), Clinical Trial, Transplant, Pediatric, Relapsed, Refractory
- yearStart: publication start year (YYYY format)
- yearEnd: publication end year (YYYY format)

Rules:
1. Only include fields that are clearly indicated in the query
2. Use uppercase for gene symbols and disease codes
3. Recognize synonyms: "venetoclax" = "VEN", "azacitidine" = "AZA"
4. For date ranges like "from 2020" use yearStart, "until 2023" use yearEnd, "in 2024" use both
5. "recent" or "latest" means yearStart should be current year minus 2
6. Respond ONLY with valid JSON object, no explanation or markdown`;

        let filters: any = {};
        try {
            const parseResponse = await c.env.AI.run('@cf/meta/llama-2-7b-chat-int8', {
                messages: [
                    { role: 'system', content: filterSystemPrompt },
                    { role: 'user', content: query }
                ]
            });

            if (parseResponse?.response) {
                let jsonStr = parseResponse.response.trim();
                if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
                }
                filters = JSON.parse(jsonStr);
            }
        } catch (parseErr) {
            console.warn('[SmartQuery] Filter parsing failed, continuing with empty filters:', parseErr);
        }

        // Step 2: Build query to fetch matching articles
        let dbQuery = `SELECT DISTINCT s.* FROM studies s`;
        const params: any[] = [];
        const constraints: string[] = [];

        if (filters.mutations?.length) {
            dbQuery += ` JOIN mutations m ON s.id = m.study_id`;
            const mutations = Array.isArray(filters.mutations) ? filters.mutations : [filters.mutations];
            constraints.push(`m.gene_symbol IN (${mutations.map(() => '?').join(',')})`);
            params.push(...mutations);
        }

        if (filters.tags?.length) {
            dbQuery += ` JOIN study_topics t ON s.id = t.study_id`;
            const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
            constraints.push(`t.topic_name IN (${tags.map(() => '?').join(',')})`);
            params.push(...tags);
        }

        if (filters.treatments?.length) {
            dbQuery += ` JOIN treatments tr ON s.id = tr.study_id JOIN ref_treatments rt ON tr.treatment_id = rt.id`;
            const treatments = Array.isArray(filters.treatments) ? filters.treatments : [filters.treatments];
            constraints.push(`rt.code IN (${treatments.map(() => '?').join(',')})`);
            params.push(...treatments);
        }

        if (filters.q) {
            constraints.push(`(s.title LIKE ? OR s.abstract LIKE ?)`);
            params.push(`%${filters.q}%`, `%${filters.q}%`);
        }

        if (filters.diseases?.length) {
            const diseases = Array.isArray(filters.diseases) ? filters.diseases : [filters.diseases];
            const diseaseConditions = diseases.map(() => `s.disease_subtype LIKE ?`).join(' OR ');
            constraints.push(`(${diseaseConditions})`);
            diseases.forEach((d: string) => params.push(`%${d}%`));
        }

        if (filters.yearStart) {
            constraints.push(`s.pub_date >= ?`);
            params.push(/^\d{4}$/.test(filters.yearStart) ? `${filters.yearStart}-01-01` : filters.yearStart);
        }

        if (filters.yearEnd) {
            constraints.push(`s.pub_date <= ?`);
            params.push(/^\d{4}$/.test(filters.yearEnd) ? `${filters.yearEnd}-12-31` : filters.yearEnd);
        }

        if (constraints.length > 0) {
            dbQuery += ` WHERE ` + constraints.join(' AND ');
        }

        dbQuery += ` ORDER BY s.pub_date DESC LIMIT 50`;

        // Step 3: Fetch articles
        const { results: articles } = await c.env.DB.prepare(dbQuery).bind(...params).run();

        if (!articles || articles.length === 0) {
            return c.json({
                success: true,
                filters,
                articleCount: 0,
                message: 'No articles found matching your query. Try broadening your search terms.',
                originalQuery: query
            });
        }

        // Fetch mutations for the articles
        const studyIds = articles.map((r: any) => r.id);
        const batchSize = 50;
        const mutationsMap: Record<number, string[]> = {};

        for (let i = 0; i < studyIds.length; i += batchSize) {
            const batchIds = studyIds.slice(i, i + batchSize);
            const idsPlaceholder = batchIds.map(() => '?').join(',');
            const { results: mutationsRes } = await c.env.DB.prepare(`
                SELECT study_id, gene_symbol FROM mutations WHERE study_id IN (${idsPlaceholder})
            `).bind(...batchIds).run();
            mutationsRes?.forEach((m: any) => {
                if (!mutationsMap[m.study_id]) mutationsMap[m.study_id] = [];
                mutationsMap[m.study_id].push(m.gene_symbol);
            });
        }

        const enhancedArticles = articles.map((r: any) => ({
            ...r,
            mutations: mutationsMap[r.id] || [],
            diseases: r.disease_subtype ? [r.disease_subtype] : []
        }));

        // Step 4: Create insight record
        let insightId;
        try {
            insightId = crypto.randomUUID();
        } catch {
            insightId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        }

        const truncatedArticles = enhancedArticles.slice(0, 30);
        const filterSummary = Object.entries(filters)
            .filter(([_, v]) => v && (Array.isArray(v) ? v.length > 0 : true))
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ') || 'General Search';

        const analyzedBrief = JSON.stringify(truncatedArticles.map((a: any) => ({
            title: a.title || 'Untitled',
            year: a.pub_date?.substring(0, 4) || 'N/A'
        })));

        await c.env.DB.prepare(`
            INSERT INTO insights (
                id, query, filter_summary, summary,
                article_count, analyzed_articles_json, is_rag_enhanced, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            insightId,
            query, // Store the original question
            filterSummary,
            '',
            truncatedArticles.length,
            analyzedBrief,
            false,
            'processing'
        ).run();

        // Step 5: Launch Map-Reduce orchestration with the question as context
        c.executionCtx.waitUntil(orchestrateMapReduceSummary(c, insightId, truncatedArticles, query));

        return c.json({
            success: true,
            insightId,
            filters,
            articleCount: enhancedArticles.length,
            analyzedCount: truncatedArticles.length,
            status: 'processing',
            originalQuery: query
        });

    } catch (e: any) {
        console.error('[SmartQuery] Error:', e);
        return c.json({
            success: false,
            error: `Smart query failed: ${e.message}`
        }, 500);
    }
});

// AI-powered research insights summarization using Claude
app.post('/api/summarize', async (c) => {
    try {
        const body = await c.req.json().catch(() => ({})) as any;
        const { articles, query, filter_summary } = body;

        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            return c.json({ error: 'No articles provided' }, 400);
        }

        const ip = c.req.header('cf-connecting-ip') || 'unknown';
        const now = Math.floor(Date.now() / 1000);

        // Quick rate limit check
        try {
            const usage = await c.env.DB.prepare('SELECT count FROM api_usage WHERE ip = ? AND last_reset > ?')
                .bind(ip, now - 3600).first<{ count: number }>();
            if (usage && usage.count >= 25) {
                return c.json({ error: 'Rate limit exceeded' }, 429);
            }
            await c.env.DB.prepare('INSERT INTO api_usage (ip, count, last_reset) VALUES (?, 1, ?) ON CONFLICT(ip) DO UPDATE SET count = api_usage.count + 1')
                .bind(ip, now).run();
        } catch (e) {
            console.error('Rate limit DB error:', e);
        }

        let insightId;
        try {
            insightId = crypto.randomUUID();
        } catch (e) {
            insightId = Date.now().toString(36) + Math.random().toString(36).substring(2);
            console.warn('crypto.randomUUID failed, using fallback:', insightId);
        }

        const truncatedArticles = articles.slice(0, 30);

        // Defensive mapping for analyzed articles JSON
        const analyzedBrief = JSON.stringify(truncatedArticles.map(a => ({
            title: a.title || 'Untitled',
            year: a.year || (a.pub_date && typeof a.pub_date === 'string' ? a.pub_date.substring(0, 4) : 'N/A')
        })));

        // Initial persistence with 'processing' status
        try {
            await c.env.DB.prepare(`
                INSERT INTO insights (
                    id, query, filter_summary, summary,
                    article_count, analyzed_articles_json, is_rag_enhanced, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                insightId,
                query || 'General Search',
                filter_summary || '',
                '',
                truncatedArticles.length,
                analyzedBrief,
                false,
                'processing'
            ).run();
        } catch (e: any) {
            console.error('Failed to initialize insight in DB:', e);
            return c.json({ error: `Failed to initialize insight: ${e.message}` }, 500);
        }

        // Launch background orchestration
        c.executionCtx.waitUntil(orchestrateMapReduceSummary(c, insightId, truncatedArticles, query));

        return c.json({
            success: true,
            insightId,
            status: 'processing'
        });
    } catch (globalError: any) {
        console.error('Global /api/summarize error:', globalError);
        return c.json({ error: `Internal server error: ${globalError.message}` }, 500);
    }
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callLLMWithFallback(c: any, prompt: string, system: string, maxTokens: number = 2048): Promise<{ text: string, model: string }> {
    const anthropic = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY });

    console.log(`[LLM] Starting call. API Key present: ${!!c.env.ANTHROPIC_API_KEY}`);
    if (c.env.ANTHROPIC_API_KEY) {
        // Log prefix for debugging auth issues
        console.log(`[LLM] Key prefix: ${c.env.ANTHROPIC_API_KEY.substring(0, 7)}...`);
    } else {
        console.warn(`[LLM] WARNING: ANTHROPIC_API_KEY is MISSING in worker environment.`);
    }

    // List of models to try in sequence (including 2026-era models)
    const models = [
        'claude-3-5-sonnet-latest',   // Most reliable standard alias
        'claude-3-haiku-20240307',    // Fast fallback
        'claude-sonnet-4-5',          // Potential future models
        'claude-sonnet-4',
        'claude-3-5-sonnet-20241022',
        'claude-3-5-sonnet-20240620'
    ];

    for (const model of models) {
        try {
            console.log(`[LLM] Attempting Anthropic model: ${model}...`);
            const response = await anthropic.messages.create({
                model,
                max_tokens: maxTokens,
                messages: [{ role: 'user', content: prompt }],
                system
            });
            console.log(`[LLM] SUCCESS with ${model}`);
            return { text: (response.content[0] as any).text || '', model };
        } catch (e: any) {
            console.error(`[LLM] FAILED with ${model}:`, e.message);

            // Handle Overloaded (529) or Rate Limit (429) with retry
            if (e.status === 529 || e.status === 429) {
                console.log(`[LLM] Provider overloaded (529) or rate limited (429). Retrying in 2s...`);
                await sleep(2000); // Simple fixed delay for retry
                try {
                    const retryResponse = await anthropic.messages.create({
                        model,
                        max_tokens: maxTokens,
                        messages: [{ role: 'user', content: prompt }],
                        system
                    });
                    console.log(`[LLM] SUCCESS after retry with ${model}`);
                    return { text: (retryResponse.content[0] as any).text || '', model };
                } catch (retryErr: any) {
                    console.error(`[LLM] Retry FAILED for ${model}:`, retryErr.message);
                    // If retry fails, continue to next model
                }
            }

            // If it's a 404 (model not found) or a 403 (unauthorized for this specific model), try next
            if (e.status === 404 || e.status === 403 || e.status === 529 || e.status === 429) {
                console.log(`[LLM] Trying next model due to error ${e.status}...`);
                continue;
            }
            // For other errors (like 401 Invalid Key), we stop and throw
            throw e;
        }
    }

    // Final Fallback: Cloudflare Workers AI (local Llama)
    console.warn(`[LLM] All Anthropic attempts failed or returned 404. Falling back to Llama-3...`);
    try {
        const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: prompt }
            ]
        });
        console.log(`[LLM] SUCCESS with Llama-3 fallback.`);
        return { text: response.response || '', model: 'llama-3-8b-instruct' };
    } catch (llamaError: any) {
        console.error(`[LLM] CRITICAL: Llama fallback failed:`, llamaError.message);
        throw new Error(`All LLM providers failed. Last error: ${llamaError.message}`);
    }
}

async function orchestrateMapReduceSummary(c: any, insightId: string, articles: any[], query: string | undefined) {
    const batchSize = 10;
    const batches: any[] = [];
    for (let i = 0; i < articles.length; i += batchSize) {
        batches.push(articles.slice(i, i + batchSize));
    }

    try {
        // Step 1: Technical Analysis of each batch sequentially (Map Phase)
        // Sequential processing reduces concurrent load and prevents provider overload
        const mappedResults: any[] = [];
        let lastUsedModel = 'unknown';

        for (let bIdx = 0; bIdx < batches.length; bIdx++) {
            const batch = batches[bIdx];
            const batchPmids = batch.map((a: any) => a.pubmed_id || a.pmid || '').filter(Boolean);

            let technicalContext = '';
            let docsWithFullText = 0;
            let fullTextPmidsInBatch: string[] = [];

            if (batchPmids.length > 0) {
                const { results: fullTextDocs } = await c.env.DB.prepare(`
                    SELECT id, pmid, filename FROM documents 
                    WHERE (pmid IN (${batchPmids.map(() => '?').join(',')})) AND status = 'ready'
                `).bind(...batchPmids).run();

                if (fullTextDocs && fullTextDocs.length > 0) {
                    docsWithFullText = fullTextDocs.length;
                    fullTextPmidsInBatch = fullTextDocs.map((d: any) => d.pmid);
                    const docIds = fullTextDocs.map((d: any) => d.id);

                    const { results: chunksMetadata } = await c.env.DB.prepare(`
                        SELECT id, document_id, content, chunk_index FROM chunks 
                        WHERE document_id IN (${docIds.map(() => '?').join(',')}) AND chunk_index < 5
                    `).bind(...docIds).run();

                    const docContentPromises = fullTextDocs.map(async (doc: any) => {
                        let content = "";
                        try {
                            const r2Key = `chunks/${doc.id}.json`;
                            const object = await c.env.DOCUMENTS.get(r2Key);
                            if (object) {
                                const data: any = await object.json();
                                if (data && data.chunks) {
                                    content = data.chunks.slice(0, 5).map((ch: any) => ch.content).join("\n");
                                }
                            }
                        } catch (e) {
                            console.warn(`[Insights] Failed to fetch R2 content for ${doc.id}:`, e);
                        }

                        if (!content && chunksMetadata) {
                            const docChunks = (chunksMetadata as any[]).filter(ch => ch.document_id === doc.id);
                            content = docChunks.map(ch => ch.content).filter(Boolean).join("\n");
                        }

                        if (content) {
                            const articleNum = articles.findIndex(a => (a.pubmed_id || a.pmid || a.pubmedId) === doc.pmid) + 1;
                            return `Ref [#${articleNum}]:\n${content}\n\n`;
                        }
                        return "";
                    });

                    const contents = await Promise.all(docContentPromises);
                    technicalContext = "\nFULL-TEXT EXCERPTS (TOP 5 CHUNKS):\n" + contents.join("");
                }
            }

            const startIdx = bIdx * batchSize;
            const batchContent = batch.map((a: any, idx: number) => `
Article [#${startIdx + idx + 1}]:
Title: ${a.title}
Abstract: ${a.abstract || 'N/A'}
Year: ${a.year || a.pub_date?.substring(0, 4)}
`).join('\n---\n');

            const mapPrompt = `You are a scientific analyst. Extract precise metrics (ORR, OS, hazard ratios, p-values), key molecular findings, and trial designs for the following leukemia research articles. 
Be technical, dense, and concise. Cite article numbers [#N] for every data point. Include findings from both abstracts and any provided full-text excerpts.

ARTICLES:
${batchContent}

${technicalContext}

Provide a dense bulleted list of technical highlights for this batch.`;

            const { text, model } = await callLLMWithFallback(
                c,
                mapPrompt,
                "Scientific data extractor. Output only technical highlights with citations.",
                2048
            );
            lastUsedModel = model;

            mappedResults.push({
                text,
                hasFullText: docsWithFullText > 0,
                fullTextPmids: fullTextPmidsInBatch,
                docsWithFullText
            });

            // Small delay between batches to further reduce spike load
            if (bIdx < batches.length - 1) {
                await sleep(500);
            }
        }

        // Step 2: Global Synthesis (Reduce Phase)
        const combinedHighlights = mappedResults.map((r, i) => `BATCH ${i + 1} HIGHLIGHTS:\n${r.text}`).join('\n\n');
        const totalFullText = mappedResults.some(r => r.hasFullText);
        const fullTextCount = mappedResults.reduce((acc, r) => acc + (r.docsWithFullText || 0), 0);
        const allFullTextPmids = new Set<string>();
        mappedResults.forEach(r => r.fullTextPmids?.forEach((p: string) => allFullTextPmids.add(String(p))));

        const updatedAnalyzedArticles = articles.map((a, i) => {
            const pmid = String(a.pubmed_id || a.pmid || '');
            return {
                num: i + 1,
                title: a.title || 'Untitled',
                year: a.year || (a.pub_date && typeof a.pub_date === 'string' ? a.pub_date.substring(0, 4) : 'N/A'),
                pmid: pmid,
                hasFullText: allFullTextPmids.has(pmid)
            };
        });

        // Build the reduce prompt - use question-answering format when query exists
        const reducePrompt = query
            ? `You are a medical research assistant answering a specific question from the scientific literature.

USER QUESTION: ${query}

Based on the research data below, synthesize a comprehensive answer. Structure your response with these sections:

## Answer
- Directly answer the user's question using evidence from the articles
- Be specific with data points, percentages, outcomes, and statistics
- Cite EVERY relevant article [#1, #2...] where you draw information from

## Key Evidence
- Major findings and metrics that support your answer
- Distinguish between clinical evidence (trials, cohorts) and pre-clinical data
- Include specific outcomes: ORR, OS, PFS, hazard ratios where available

## Treatment Implications
- What this means for therapy decisions (if applicable)
- Drug combinations, dosages, or regimens mentioned

## Limitations & Gaps
- What the evidence doesn't cover
- Conflicting findings or areas needing more research
- Note if evidence is preliminary vs. established

RESEARCH DATA:
${combinedHighlights}`
            : `You are a medical research synthesis expert specializing in hematological malignancies. I will provide you with technical summary highlights for articles. 
Your task is to synthesize these into a single, cohesive, high-level scientific report.

Structure your response with these exact sections:
## Key Findings & Comparative Efficacy
- Synthesize major trends and outcome metrics.
- Cite EVERY article number [#1, #2... #50] where data was drawn from.
- Distinguish between clinical (RCTs/cohorts) and pre-clinical (lab/cell line) evidence.

## Therapeutic Landscapes
- Trends in drug development, dosages, and combinations.
- Safety signals/toxicities.

## Molecular & Biomarker Profiles
- Deep dive into mutation-specific responses (FLT3, NPM1, TP53, etc).

## Critical Gaps & Evidence Strength
- Preliminary findings vs. clinical-ready data.

RESEARCH DATA:
${combinedHighlights}`;

        const systemPrompt = query
            ? "You are a knowledgeable medical research assistant. Answer the user's question directly using the provided research data. Be accurate, cite sources, and use clear language accessible to patients while maintaining scientific precision."
            : "Master scientific report writer. Synthesize multi-batch data into a final structured report.";

        const { text: summary, model: finalModel } = await callLLMWithFallback(
            c,
            reducePrompt,
            systemPrompt,
            4096
        );

        // Update persistence
        await c.env.DB.prepare(`
            UPDATE insights SET 
                summary = ?, 
                is_rag_enhanced = ?, 
                status = 'completed', 
                error = NULL, 
                analyzed_articles_json = ?,
                model_used = ?,
                full_text_count = ?
            WHERE id = ?
        `).bind(
            summary,
            totalFullText ? 1 : 0,
            JSON.stringify(updatedAnalyzedArticles),
            finalModel,
            fullTextCount,
            insightId
        ).run();

    } catch (e: any) {
        console.error(`Map-Reduce Orchestration Error [ID: ${insightId}]:`, e);
        try {
            await c.env.DB.prepare(`
                UPDATE insights SET status = 'error', error = ? WHERE id = ?
            `).bind(`${e.name}: ${e.message}`, insightId).run();
        } catch (dbError) {
            console.error('Failed to update error status in DB:', dbError);
        }
    }
}



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
                analyzedArticles: JSON.parse((insight as any).analyzed_articles_json || '[]'),
                chatHistory: JSON.parse((insight as any).chat_history || '[]')
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
    try {
        // Run all coverage queries in parallel
        const [pubmedMetrics, taggedMetrics, ragMetrics, yearlyTotals] = await Promise.all([
            // 1. PubMed Totals (from coverage_metrics)
            c.env.DB.prepare(`
                SELECT year, month, pubmed_total as count
                FROM coverage_metrics
            `).all(),

            // 2. Tagged Totals (from studies)
            c.env.DB.prepare(`
                SELECT 
                    strftime('%Y', pub_date) as year,
                    strftime('%m', pub_date) as month,
                    COUNT(*) as count
                FROM studies 
                WHERE pub_date IS NOT NULL
                GROUP BY year, month
            `).all(),

            // 3. RAG Totals (from documents joining with studies to get publication month)
            c.env.DB.prepare(`
                SELECT 
                    strftime('%Y', s.pub_date) as year,
                    strftime('%m', s.pub_date) as month,
                    COUNT(d.id) as count
                FROM studies s
                JOIN documents d ON s.source_id = 'PMID:' || d.pmid
                WHERE s.pub_date IS NOT NULL AND d.status = 'ready'
                GROUP BY year, month
            `).all(),

            // 4. Yearly Totals (for summary)
            c.env.DB.prepare(`
                SELECT 
                    strftime('%Y', pub_date) as year,
                    COUNT(*) as count
                FROM studies 
                WHERE pub_date IS NOT NULL
                GROUP BY year
                ORDER BY year DESC
            `).all()
        ]);

        // Transform results into a nested structure: year -> month -> { pubmed, tagged, rag }
        const statsByYear: Record<string, Record<string, { pubmed: number, tagged: number, rag: number }>> = {};

        // Helper to initialize year/month
        const ensurePath = (year: string, month: string) => {
            if (!statsByYear[year]) statsByYear[year] = {};
            if (!statsByYear[year][month]) {
                statsByYear[year][month] = { pubmed: 0, tagged: 0, rag: 0 };
            }
        };

        pubmedMetrics.results?.forEach((row: any) => {
            const y = row.year.toString();
            const m = row.month.toString().padStart(2, '0');
            ensurePath(y, m);
            statsByYear[y][m].pubmed = row.count || 0;
        });

        taggedMetrics.results?.forEach((row: any) => {
            const y = row.year;
            const m = row.month;
            ensurePath(y, m);
            statsByYear[y][m].tagged = row.count || 0;
        });

        ragMetrics.results?.forEach((row: any) => {
            const y = row.year;
            const m = row.month;
            ensurePath(y, m);
            statsByYear[y][m].rag = row.count || 0;
        });

        // Build final coverage array
        const coverage = yearlyTotals.results?.map((row: any) => {
            const year = row.year;
            const yearData = statsByYear[year] || {};
            const months: Record<string, any> = {};

            // Fill in all 12 months
            for (let m = 1; m <= 12; m++) {
                const monthKey = m.toString().padStart(2, '0');
                months[monthKey] = yearData[monthKey] || { pubmed: 0, tagged: 0, rag: 0 };
            }

            return {
                year,
                total: row.count, // Total tagged in this year
                months,
                gaps: Object.entries(months)
                    .filter(([_, data]: [any, any]) => data.tagged === 0)
                    .map(([month]) => month)
            };
        }) || [];

        // Overall summary
        const totalArticles = yearlyTotals.results?.reduce((sum: number, row: any) => sum + row.count, 0) || 0;
        const yearsWithData = yearlyTotals.results?.length || 0;
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
            'Cache-Control': 'public, max-age=600' // Cache for 10 minutes
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

        // Store chunk content in R2
        const chunkContentData = {
            documentId: body.documentId,
            chunks: body.chunks.map(chunk => ({
                id: chunk.id,
                chunkIndex: chunk.chunkIndex,
                content: chunk.content
            }))
        };

        const r2Key = `chunks/${body.documentId}.json`;
        await c.env.DOCUMENTS.put(
            r2Key,
            JSON.stringify(chunkContentData),
            {
                httpMetadata: {
                    contentType: 'application/json'
                }
            }
        );

        let chunksCreated = 0;
        let vectorsUpserted = 0;

        // Process chunks in batches (D1 has 100 param limit)
        const batchSize = 10;

        for (let i = 0; i < body.chunks.length; i += batchSize) {
            const batch = body.chunks.slice(i, i + batchSize);

            // Insert chunks metadata into D1 (empty string for content to satisfy NOT NULL constraint)
            for (const chunk of batch) {
                await c.env.DB.prepare(`
                    INSERT INTO chunks (
                        id, document_id, chunk_index, content,
                        start_page, end_page, section_header, token_count,
                        embedding_id, created_at
                    ) VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, datetime('now'))
                `).bind(
                    chunk.id,
                    body.documentId,
                    chunk.chunkIndex,
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

// Get chunk content from R2 for a document
app.get('/api/chunks/content/:documentId', async (c) => {
    const documentId = c.req.param('documentId');

    try {
        const r2Key = `chunks/${documentId}.json`;
        const object = await c.env.DOCUMENTS.get(r2Key);

        if (!object) {
            return c.json({ error: 'Chunk content not found' }, 404);
        }

        const data = await object.json();
        return c.json(data);
    } catch (e: any) {
        console.error('Chunk content retrieval error:', e);
        return c.json({ error: e.message }, 500);
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
        const body = await c.req.json<RAGQueryRequest>().catch(() => ({ query: '' } as RAGQueryRequest));

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

        // Step 3: Fetch chunk metadata from D1
        const chunkIds = searchResults.matches.map(m => m.id);
        const placeholders = chunkIds.map(() => '?').join(',');

        const { results: dbChunks } = await c.env.DB.prepare(`
            SELECT c.id, c.content, c.start_page, c.end_page, c.document_id,
                   d.filename, d.pmcid
            FROM chunks c
            JOIN documents d ON c.document_id = d.id
            WHERE c.id IN (${placeholders})
        `).bind(...chunkIds).run();

        // Group chunks by document ID to fetch content from R2
        const documentIds = new Set<string>();
        const chunksByDoc = new Map<string, any[]>();

        for (const chunk of (dbChunks || [])) {
            const docId = (chunk as any).document_id;
            documentIds.add(docId);
            if (!chunksByDoc.has(docId)) {
                chunksByDoc.set(docId, []);
            }
            chunksByDoc.get(docId)!.push(chunk);
        }

        // Fetch chunk content from R2 for each document
        const documentContentMap = new Map<string, any>();
        for (const docId of documentIds) {
            try {
                const r2Key = `chunks/${docId}.json`;
                const object = await c.env.DOCUMENTS.get(r2Key);
                if (object) {
                    const data: any = await object.json();
                    documentContentMap.set(docId, data);
                }
            } catch (e) {
                console.warn(`Failed to fetch chunk content from R2 for ${docId}:`, e);
            }
        }

        // Combine with scores and get content from R2 or fallback to D1
        const scoredChunks = searchResults.matches.map(match => {
            const chunk = dbChunks?.find((c: any) => c.id === match.id) as any;
            if (!chunk) return null;

            let content = '';
            const docId = chunk.document_id;

            // Try to get content from R2
            const docContent = documentContentMap.get(docId);
            if (docContent && docContent.chunks) {
                const chunkData = docContent.chunks.find((c: any) => c.id === match.id);
                if (chunkData) {
                    content = chunkData.content;
                }
            }

            // Fallback to D1 content for legacy chunks
            if (!content && chunk.content) {
                content = chunk.content;
            }

            if (!content) return null;

            return {
                id: match.id,
                content: content,
                filename: chunk.filename || 'Unknown',
                pmcid: chunk.pmcid,
                start_page: chunk.start_page,
                end_page: chunk.end_page,
                score: match.score
            };
        }).filter(c => c !== null);

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

        // Step 5: Call LLM with synthesis fallback
        const { text: answer, model: usedModel } = await callLLMWithFallback(
            c,
            userPrompt,
            systemPrompt,
            4096
        );

        // Step 6: Persist follow-up to history if insightId provided
        if (body.insightId) {
            try {
                const insight = await c.env.DB.prepare('SELECT chat_history FROM insights WHERE id = ?')
                    .bind(body.insightId).first();
                if (insight) {
                    const history = JSON.parse((insight as any).chat_history || '[]');
                    history.push({ role: 'user', content: body.query });
                    history.push({ role: 'assistant', content: answer, model: usedModel });

                    await c.env.DB.prepare('UPDATE insights SET chat_history = ? WHERE id = ?')
                        .bind(JSON.stringify(history), body.insightId).run();
                }
            } catch (historyError) {
                console.error('Failed to save chat history:', historyError);
            }
        }


        return c.json({
            answer,
            sources,
            usage: {
                contextTokens: tokensUsed,
                responseTokens: estimateTokens(answer), // Approximated
                totalTokens: tokensUsed + estimateTokens(answer),
                chunksUsed: sources.length
            },
            model: usedModel
        });

    } catch (e: any) {
        console.error('RAG query error:', e);
        return c.json({ error: e.message }, 500);
    }
});

export default app;
