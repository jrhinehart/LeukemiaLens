import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

app.get('/api/search', async (c) => {
    const {
        q,
        mutation,
        disease,
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
        // Fetch mutations for these studies to hydrate the response
        const idsPlaceholder = studyIds.map(() => '?').join(',');
        const mutationsRes = await c.env.DB.prepare(`
        SELECT study_id, gene_symbol FROM mutations WHERE study_id IN (${idsPlaceholder})
    `).bind(...studyIds).run();

        const mutationsMap: Record<number, string[]> = {};
        if (mutationsRes.results) {
            mutationsRes.results.forEach((m: any) => {
                if (!mutationsMap[m.study_id]) mutationsMap[m.study_id] = [];
                mutationsMap[m.study_id].push(m.gene_symbol);
            });
        }

        const enhancedResults = results.map((r: any) => ({
            ...r,
            mutations: mutationsMap[r.id] || []
        }));

        return c.json(enhancedResults);
    } catch (e: any) {
        return c.json({ error: e.message }, 500);
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

        // Transform to format expected by frontend { mutations: { "FLT3": 10 }, tags: {} }
        const mutations: Record<string, number> = {};
        mutationStats.results?.forEach((r: any) => {
            mutations[r.name] = r.count;
        });

        return c.json({
            mutations,
            tags: {} // Tags not yet implemented in D1
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
