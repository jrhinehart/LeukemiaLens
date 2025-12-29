import { extractMetadata } from './parsers';
import { RateLimiter } from './rate-limiter';
import * as cheerio from 'cheerio';

export interface Env {
    DB: D1Database;
    NCBI_API_KEY?: string; // Stored as Cloudflare secret
    NCBI_EMAIL: string; // Stored as environment variable
}

const SEARCH_TERM = '(Leukemia[Title/Abstract]) AND ("2023/01/01"[Date - Publication] : "3000"[Date - Publication])';
const MAX_RESULTS = 20;
const TOOL_NAME = "LeukemiaLens"; // Register tool name with NCBI

// Global rate limiter instance
let rateLimiter: RateLimiter;

async function searchPubmed(env: Env, termOverride: string | null = null, limit: number = MAX_RESULTS): Promise<string[]> {
    // Initialize rate limiter if not already done
    if (!rateLimiter) {
        const requestsPerSecond = env.NCBI_API_KEY ? 10 : 3;
        rateLimiter = new RateLimiter(requestsPerSecond);
        console.log(`Initialized with API key: ${env.NCBI_API_KEY ? 'YES (10 req/s)' : 'NO (3 req/s)'}`);
    }

    const params = new URLSearchParams({
        db: "pubmed",
        term: termOverride || SEARCH_TERM,
        retmax: limit.toString(),
        usehistory: "y",
        email: env.NCBI_EMAIL,
        tool: TOOL_NAME,
        retmode: 'json'
    });

    // Add API key if available
    if (env.NCBI_API_KEY) {
        params.append('api_key', env.NCBI_API_KEY);
    }

    const response = await rateLimiter.fetchWithRetry(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params.toString()}`
    );
    const data: any = await response.json();
    return data.esearchresult.idlist || [];
}

async function fetchDetails(env: Env, ids: string[]): Promise<string> {
    if (!ids.length) return "";

    const params = new URLSearchParams({
        db: "pubmed",
        id: ids.join(","),
        retmode: "xml",
        email: env.NCBI_EMAIL,
        tool: TOOL_NAME
    });

    // Add API key if available
    if (env.NCBI_API_KEY) {
        params.append('api_key', env.NCBI_API_KEY);
    }

    const response = await rateLimiter.fetchWithRetry(
        `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params.toString()}`
    );
    return await response.text();
}

export default {
    async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
        ctx.waitUntil(this.processIngestion(env));
    },

    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const year = url.searchParams.get("year");
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam) : MAX_RESULTS;

        let searchTermOverride = null;
        if (year) {
            searchTermOverride = `(Leukemia[Title/Abstract]) AND ("${year}/01/01"[Date - Publication] : "${year}/12/31"[Date - Publication])`;
        }

        // Manual trigger for testing
        ctx.waitUntil(this.processIngestion(env, searchTermOverride, limit));
        return new Response(`Ingestion triggered for ${year || "default range"} with limit ${limit}`);
    },

    async processIngestion(env: Env, searchTermOverride: string | null = null, limit: number = MAX_RESULTS) {
        console.log(`Starting ingestion... term=${searchTermOverride || "default"} limit=${limit}`);
        try {
            const ids = await searchPubmed(env, searchTermOverride, limit);
            console.log(`Found ${ids.length} articles.`);
            if (ids.length === 0) return;

            const xmlContent = await fetchDetails(env, ids);
            const $ = cheerio.load(xmlContent, { xmlMode: true });

            const articles = $('PubmedArticle');

            for (const article of articles) {
                const pmid = $(article).find('PMID').first().text();
                const articleNode = $(article).find('MedlineCitation > Article');
                const title = articleNode.find('ArticleTitle').text() || "No Title";
                const abstract = articleNode.find('Abstract > AbstractText').text() || "";

                const pubDateNode = articleNode.find('Journal > JournalIssue > PubDate');
                let pubDateYear = pubDateNode.find('Year').text();
                let pubDateMonth = pubDateNode.find('Month').text();
                let pubDateDay = pubDateNode.find('Day').text();

                if (!pubDateYear) {
                    // fallback if only MedlineDate
                    const medlineDate = pubDateNode.find('MedlineDate').text();
                    const match = medlineDate.match(/\d{4}/);
                    pubDateYear = match ? match[0] : "1900";
                }

                // Convert month name to number if needed
                const monthMap: Record<string, string> = {
                    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                };

                let month = '01';
                if (pubDateMonth) {
                    // Check if it's a number or month name
                    if (/^\d+$/.test(pubDateMonth)) {
                        month = pubDateMonth.padStart(2, '0');
                    } else {
                        month = monthMap[pubDateMonth] || '01';
                    }
                }

                const day = pubDateDay ? pubDateDay.padStart(2, '0') : '01';
                const pubDate = `${pubDateYear}-${month}-${day}`;

                const journal = articleNode.find('Journal > Title').text() || "Unknown Journal";

                // Authors & Affiliations
                const authorsList: string[] = [];
                const affiliationsList: string[] = [];
                articleNode.find('AuthorList > Author').each((_, el) => {
                    const last = $(el).find('LastName').text();
                    const initials = $(el).find('Initials').text();
                    if (last) authorsList.push(`${last} ${initials}`);

                    const aff = $(el).find('AffiliationInfo > Affiliation').text();
                    if (aff && !affiliationsList.includes(aff)) {
                        affiliationsList.push(aff);
                    }
                });
                const authors = authorsList.join(", ");
                const affiliations = affiliationsList.join(" | ");

                const fullText = `${title} ${abstract}`;
                const metadata = extractMetadata(fullText);

                // --- D1 INSERTS ---
                // 1. Studies Table
                try {
                    const { results } = await env.DB.prepare(`
                INSERT INTO studies (title, abstract, pub_date, journal, authors, affiliations, disease_subtype, has_complex_karyotype, transplant_context, source_id, source_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source_id) DO UPDATE SET
                    title=excluded.title,
                    abstract=excluded.abstract,
                    disease_subtype=excluded.disease_subtype,
                    affiliations=excluded.affiliations
                RETURNING id
            `).bind(
                        title,
                        abstract,
                        pubDate,
                        journal,
                        authors,
                        affiliations,
                        metadata.diseaseSubtypes.join(','),
                        metadata.hasComplexKaryotype ? 1 : 0,
                        metadata.transplantContext ? 1 : 0,
                        `PMID:${pmid}`,
                        'pubmed'
                    ).run();

                    const studyId = results[0].id as number;

                    // 2. Mutations
                    // Clear existing for this study (simplest update strategy)
                    await env.DB.prepare("DELETE FROM mutations WHERE study_id = ?").bind(studyId).run();
                    if (metadata.mutations.length > 0) {
                        const stmt = env.DB.prepare("INSERT INTO mutations (study_id, gene_symbol) VALUES (?, ?)");
                        await env.DB.batch(metadata.mutations.map(m => stmt.bind(studyId, m)));
                    }

                    // 3. Cytogenetics (Complex karyotype logic is simple bool in main table, but if we had specific abnormalities we'd insert here)
                    // For now, based on parser, we just check complex boolean. If we parse specific strings, we add them. 
                    // In the parser we didn't extract specific cytogenetic strings other than the detecting complex.

                    // 3b. Study Topics
                    await env.DB.prepare("DELETE FROM study_topics WHERE study_id = ?").bind(studyId).run();
                    if (metadata.topics.length > 0) {
                        const stmt = env.DB.prepare("INSERT INTO study_topics (study_id, topic_name) VALUES (?, ?)");
                        // Allow duplicates in array? Parser might return unique, but let's be safe or just insert.
                        // Metadata extractor usually returns lists. Using Set in parser or here is good.
                        // For now assuming parser output is clean enough or DB handles it (no unique constraint on topic_name/study_id pair in schema yet, but simple is fine)
                        // Ideally we use distinct topics.
                        const distinctTopics = [...new Set(metadata.topics)];
                        await env.DB.batch(distinctTopics.map(t => stmt.bind(studyId, t)));
                    }

                    // 3c. Treatments
                    // Clear existing treatments for this study
                    await env.DB.prepare("DELETE FROM treatments WHERE study_id = ?").bind(studyId).run();
                    if (metadata.treatments.length > 0) {
                        // Look up treatment IDs from ref_treatments table
                        const distinctTreatments = [...new Set(metadata.treatments)];
                        const treatmentIds: number[] = [];

                        for (const treatmentCode of distinctTreatments) {
                            try {
                                const result = await env.DB.prepare(
                                    "SELECT id FROM ref_treatments WHERE code = ?"
                                ).bind(treatmentCode).first();

                                if (result && result.id) {
                                    treatmentIds.push(result.id as number);
                                } else {
                                    console.warn(`Treatment code '${treatmentCode}' not found in ref_treatments for PMID:${pmid}`);
                                }
                            } catch (lookupError: any) {
                                console.warn(`Error looking up treatment '${treatmentCode}':`, lookupError.message);
                            }
                        }

                        // Insert treatment associations
                        if (treatmentIds.length > 0) {
                            const stmt = env.DB.prepare("INSERT INTO treatments (study_id, treatment_id) VALUES (?, ?)");
                            await env.DB.batch(treatmentIds.map(tid => stmt.bind(studyId, tid)));
                        }
                    }

                    // 4. MRD (Not parsed yet)

                    // 5. Links
                    await env.DB.prepare("INSERT OR IGNORE INTO links (study_id, url, link_type) VALUES (?, ?, ?)")
                        .bind(studyId, `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, 'pubmed').run();

                } catch (e: any) { // Use 'any' type for error to access 'message'
                    console.error(`Error saving PMID:${pmid}:`, e.message);
                }
            }
            console.log("Ingestion complete.");

        } catch (e) {
            console.error("Ingestion failed:", e);
        }
    }
};
