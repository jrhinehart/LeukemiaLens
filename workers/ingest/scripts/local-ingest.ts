/**
 * Local Ingest Script
 * 
 * Runs ingestion locally without Worker timeout limits.
 * Fetches from PubMed and writes directly to D1 via Cloudflare API.
 * 
 * Usage:
 *   cd workers/ingest
 *   npx tsx scripts/local-ingest.ts --year 2025 --month 2
 * 
 * Environment variables (in .env):
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN  
 *   DATABASE_ID
 *   NCBI_API_KEY (optional, increases rate limit to 10 req/s)
 *   NCBI_EMAIL
 */

import 'dotenv/config';
import * as cheerio from 'cheerio';
import { extractMetadata } from '../src/parsers';

// Config
const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'jr.rhinehart@gmail.com';
const TOOL_NAME = 'LeukemiaLens-LocalIngest';
const BATCH_SIZE = 100; // Articles per PubMed request
const RATE_LIMIT_DELAY = NCBI_API_KEY ? 100 : 350; // ms between requests

// Cloudflare D1 API
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !DATABASE_ID) {
    console.error('Missing environment variables. Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, DATABASE_ID');
    process.exit(1);
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseArgs(): { year: number; month?: number; limit?: number } {
    const args = process.argv.slice(2);
    let year = 0;
    let month: number | undefined;
    let limit: number | undefined;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--year' && args[i + 1]) {
            year = parseInt(args[i + 1]);
        } else if (args[i] === '--month' && args[i + 1]) {
            month = parseInt(args[i + 1]);
        } else if (args[i] === '--limit' && args[i + 1]) {
            limit = parseInt(args[i + 1]);
        }
    }

    if (!year) {
        console.error('Error: --year is required');
        console.log('Usage: npx tsx scripts/local-ingest.ts --year 2025 [--month 2] [--limit 500]');
        process.exit(1);
    }

    return { year, month, limit };
}

async function queryD1(sql: string, params: any[] = []): Promise<any> {
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql, params })
        }
    );

    const data = await response.json() as any;
    if (!data.success) {
        throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
    }
    return data.result[0];
}

function buildSearchTerm(year: number, month?: number): string {
    if (month) {
        const y = year;
        const m = month;
        const lastDay = new Date(y, m, 0).getDate();
        const monthStr = m.toString().padStart(2, '0');
        return `(Leukemia[Title/Abstract]) AND ("${year}/${monthStr}/01"[Date - Publication] : "${year}/${monthStr}/${lastDay}"[Date - Publication])`;
    }
    return `(Leukemia[Title/Abstract]) AND ("${year}/01/01"[Date - Publication] : "${year}/12/31"[Date - Publication])`;
}

async function searchPubmed(term: string, limit: number, offset: number): Promise<{ ids: string[], total: number }> {
    const params = new URLSearchParams({
        db: 'pubmed',
        term,
        retmax: limit.toString(),
        retstart: offset.toString(),
        usehistory: 'y',
        email: NCBI_EMAIL,
        tool: TOOL_NAME,
        retmode: 'json'
    });

    if (NCBI_API_KEY) {
        params.append('api_key', NCBI_API_KEY);
    }

    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params.toString()}`);
    const data = await response.json() as any;

    return {
        ids: data.esearchresult?.idlist || [],
        total: parseInt(data.esearchresult?.count || '0')
    };
}

async function fetchDetails(ids: string[]): Promise<string> {
    if (!ids.length) return '';

    const params = new URLSearchParams({
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'xml',
        email: NCBI_EMAIL,
        tool: TOOL_NAME
    });

    if (NCBI_API_KEY) {
        params.append('api_key', NCBI_API_KEY);
    }

    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params.toString()}`);
    return await response.text();
}

interface ArticleData {
    pmid: string;
    title: string;
    abstract: string;
    pubDate: string;
    journal: string;
    authors: string;
    affiliations: string;
    mutations: string[];
    topics: string[];
    treatments: string[];
    diseaseSubtypes: string[];
    hasComplexKaryotype: boolean;
}

function parseArticles(xmlContent: string): ArticleData[] {
    const $ = cheerio.load(xmlContent, { xmlMode: true });
    const articles: ArticleData[] = [];

    $('PubmedArticle').each((_, article) => {
        const pmid = $(article).find('PMID').first().text();
        const articleNode = $(article).find('MedlineCitation > Article');
        const title = articleNode.find('ArticleTitle').text() || 'No Title';
        const abstract = articleNode.find('Abstract > AbstractText').text() || '';

        const pubDateNode = articleNode.find('Journal > JournalIssue > PubDate');
        let pubDateYear = pubDateNode.find('Year').text();
        let pubDateMonth = pubDateNode.find('Month').text();
        let pubDateDay = pubDateNode.find('Day').text();

        if (!pubDateYear) {
            const medlineDate = pubDateNode.find('MedlineDate').text();
            const match = medlineDate.match(/\d{4}/);
            pubDateYear = match ? match[0] : '1900';
        }

        const monthMap: Record<string, string> = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };

        let month = '01';
        if (pubDateMonth) {
            month = /^\d+$/.test(pubDateMonth) ? pubDateMonth.padStart(2, '0') : (monthMap[pubDateMonth] || '01');
        }
        const day = pubDateDay ? pubDateDay.padStart(2, '0') : '01';
        const pubDate = `${pubDateYear}-${month}-${day}`;

        const journal = articleNode.find('Journal > Title').text() || 'Unknown Journal';

        const authorsList: string[] = [];
        const affiliationsList: string[] = [];
        articleNode.find('AuthorList > Author').each((_, el) => {
            const last = $(el).find('LastName').text();
            const initials = $(el).find('Initials').text();
            if (last) authorsList.push(`${last} ${initials}`);
            const aff = $(el).find('AffiliationInfo > Affiliation').text();
            if (aff && !affiliationsList.includes(aff)) affiliationsList.push(aff);
        });

        const fullText = `${title} ${abstract}`;
        const metadata = extractMetadata(fullText);

        articles.push({
            pmid,
            title,
            abstract,
            pubDate,
            journal,
            authors: authorsList.join(', '),
            affiliations: affiliationsList.join(' | '),
            mutations: metadata.mutations,
            topics: metadata.topics,
            treatments: metadata.treatments,
            diseaseSubtypes: metadata.diseaseSubtypes,
            hasComplexKaryotype: metadata.hasComplexKaryotype
        });
    });

    return articles;
}

async function saveArticle(article: ArticleData): Promise<number | null> {
    try {
        // Insert study
        const result = await queryD1(`
            INSERT INTO studies (title, abstract, pub_date, journal, authors, affiliations, disease_subtype, has_complex_karyotype, transplant_context, source_id, source_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(source_id) DO UPDATE SET
                title=excluded.title,
                abstract=excluded.abstract,
                disease_subtype=excluded.disease_subtype
            RETURNING id
        `, [
            article.title,
            article.abstract,
            article.pubDate,
            article.journal,
            article.authors,
            article.affiliations,
            article.diseaseSubtypes.join(','),
            article.hasComplexKaryotype ? 1 : 0,
            0,
            `PMID:${article.pmid}`,
            'pubmed'
        ]);

        const studyId = result.results?.[0]?.id;
        if (!studyId) return null;

        // Clear and insert mutations
        await queryD1('DELETE FROM mutations WHERE study_id = ?', [studyId]);
        for (const mutation of article.mutations) {
            await queryD1('INSERT INTO mutations (study_id, gene_symbol) VALUES (?, ?)', [studyId, mutation]);
            await delay(20);
        }

        // Clear and insert topics
        await queryD1('DELETE FROM study_topics WHERE study_id = ?', [studyId]);
        for (const topic of [...new Set(article.topics)]) {
            await queryD1('INSERT INTO study_topics (study_id, topic_name) VALUES (?, ?)', [studyId, topic]);
            await delay(20);
        }

        // Clear and insert treatments
        await queryD1('DELETE FROM treatments WHERE study_id = ?', [studyId]);
        for (const treatmentCode of [...new Set(article.treatments)]) {
            const treatmentResult = await queryD1('SELECT id FROM ref_treatments WHERE code = ?', [treatmentCode]);
            if (treatmentResult.results?.[0]?.id) {
                await queryD1('INSERT INTO treatments (study_id, treatment_id) VALUES (?, ?)', [studyId, treatmentResult.results[0].id]);
            }
            await delay(20);
        }

        // Insert link
        await queryD1('INSERT OR IGNORE INTO links (study_id, url, link_type) VALUES (?, ?, ?)',
            [studyId, `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`, 'pubmed']);

        return studyId;
    } catch (e: any) {
        console.error(`Error saving PMID:${article.pmid}:`, e.message);
        return null;
    }
}

async function main() {
    const { year, month, limit: userLimit } = parseArgs();
    const searchTerm = buildSearchTerm(year, month);

    console.log('='.repeat(60));
    console.log('LOCAL INGEST');
    console.log('='.repeat(60));
    console.log(`Year: ${year}${month ? `, Month: ${month}` : ''}`);
    console.log(`Search: ${searchTerm}`);
    console.log(`API Key: ${NCBI_API_KEY ? 'YES (10 req/s)' : 'NO (3 req/s)'}`);
    console.log('');

    // Get total count
    console.log('Fetching article count...');
    const { total } = await searchPubmed(searchTerm, 0, 0);
    const maxArticles = userLimit || total;
    console.log(`Found ${total} articles, will ingest up to ${maxArticles}`);
    console.log('');

    let ingested = 0;
    let failed = 0;
    const startTime = Date.now();

    for (let offset = 0; offset < maxArticles; offset += BATCH_SIZE) {
        const batchNum = Math.floor(offset / BATCH_SIZE) + 1;
        const batchSize = Math.min(BATCH_SIZE, maxArticles - offset);

        console.log(`\nBatch ${batchNum}: Fetching ${batchSize} articles (offset ${offset})...`);
        await delay(RATE_LIMIT_DELAY);

        const { ids } = await searchPubmed(searchTerm, batchSize, offset);
        if (ids.length === 0) {
            console.log('No more articles found.');
            break;
        }

        // Deduplicate: Check which PMIDs already exist in our database
        let filteredIds = ids;
        try {
            const placeholders = ids.map(() => '?').join(',');
            const existing = await queryD1(
                `SELECT source_id FROM studies WHERE source_id IN (${placeholders})`,
                ids.map(id => `PMID:${id}`)
            );
            const existingPmids = new Set((existing.results || []).map((r: any) => r.source_id.replace('PMID:', '')));
            filteredIds = ids.filter(id => !existingPmids.has(id));

            if (filteredIds.length < ids.length) {
                console.log(`  Filtered out ${ids.length - filteredIds.length} already existing articles.`);
            }
        } catch (e: any) {
            console.warn('  ⚠️ Failed to check existing articles, proceeding with all:', e.message);
        }

        if (filteredIds.length === 0) {
            continue;
        }

        await delay(RATE_LIMIT_DELAY);
        const xml = await fetchDetails(filteredIds);
        const articles = parseArticles(xml);

        for (const article of articles) {
            const studyId = await saveArticle(article);
            if (studyId) {
                ingested++;
                if (article.mutations.length > 0) {
                    console.log(`  ✓ PMID:${article.pmid} - ${article.mutations.length} mutations`);
                }
            } else {
                failed++;
            }
            await delay(50); // Rate limit D1 writes
        }

        const progress = Math.round(((offset + ids.length) / maxArticles) * 100);
        console.log(`Progress: ${progress}% (${ingested} ingested, ${failed} failed)`);
    }

    const elapsedMinutes = Math.round((Date.now() - startTime) / 60000);

    console.log('');
    console.log('='.repeat(60));
    console.log('INGEST COMPLETE');
    console.log('='.repeat(60));
    console.log(`Articles ingested: ${ingested}`);
    console.log(`Failed: ${failed}`);
    console.log(`Time: ${elapsedMinutes} minutes`);
}

main().catch(err => {
    console.error('Ingest failed:', err);
    process.exit(1);
});
