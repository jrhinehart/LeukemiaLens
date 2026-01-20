/**
 * Re-ingest Failed PMIDs Script
 * 
 * Re-ingests specific PMIDs that failed during a backfill run.
 * Uses the same local D1 API approach as the main backfill script.
 * 
 * Usage:
 *   # From command line arguments:
 *   npx tsx scripts/reingest-failed.ts 41234501 39665206
 * 
 *   # From a log file (one PMID per line):
 *   npx tsx scripts/reingest-failed.ts --file ../logs/failed-pmids-2025-01-19.txt
 */

import 'dotenv/config';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { extractMetadata } from '../src/parsers';

const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'jr.rhinehart@gmail.com';
const TOOL_NAME = 'LeukemiaLens-Reingest';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

const RATE_LIMIT_DELAY = NCBI_API_KEY ? 100 : 350;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadPmidsFromFile(filePath: string): string[] {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        console.error(`Error: File not found: ${resolvedPath}`);
        process.exit(1);
    }
    const content = fs.readFileSync(resolvedPath, 'utf-8');
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && /^\d+$/.test(line));
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

async function saveArticle(article: ArticleData, maxRetries: number = 3): Promise<number | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const processedAt = new Date().toISOString();

            const result = await queryD1(`
                INSERT INTO studies (title, abstract, pub_date, journal, authors, affiliations, disease_subtype, has_complex_karyotype, transplant_context, source_id, source_type, extraction_method, processed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source_id) DO UPDATE SET
                    title=excluded.title,
                    abstract=excluded.abstract,
                    disease_subtype=excluded.disease_subtype,
                    extraction_method=excluded.extraction_method,
                    processed_at=excluded.processed_at
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
                'pubmed',
                'regex',
                processedAt
            ]);

            const studyId = result.results?.[0]?.id;
            if (!studyId) throw new Error('No study ID returned');

            // Clear and insert mutations
            await queryD1('DELETE FROM mutations WHERE study_id = ?', [studyId]);
            for (const mutation of article.mutations) {
                await queryD1('INSERT INTO mutations (study_id, gene_symbol) VALUES (?, ?)', [studyId, mutation]);
                await sleep(20);
            }

            // Clear and insert topics
            await queryD1('DELETE FROM study_topics WHERE study_id = ?', [studyId]);
            for (const topic of [...new Set(article.topics)]) {
                await queryD1('INSERT INTO study_topics (study_id, topic_name) VALUES (?, ?)', [studyId, topic]);
                await sleep(20);
            }

            // Clear and insert treatments
            await queryD1('DELETE FROM treatments WHERE study_id = ?', [studyId]);
            for (const treatmentCode of [...new Set(article.treatments)]) {
                const treatmentResult = await queryD1('SELECT id FROM ref_treatments WHERE code = ?', [treatmentCode]);
                if (treatmentResult.results?.[0]?.id) {
                    await queryD1('INSERT INTO treatments (study_id, treatment_id) VALUES (?, ?)', [studyId, treatmentResult.results[0].id]);
                }
                await sleep(20);
            }

            // Insert link
            await queryD1('INSERT OR IGNORE INTO links (study_id, url, link_type) VALUES (?, ?, ?)',
                [studyId, `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`, 'pubmed']);

            return studyId;
        } catch (e: any) {
            const isRetryable = e.message?.includes('7500') || e.message?.includes('internal error');
            if (isRetryable && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`  ⚠️ PMID:${article.pmid} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay / 1000}s...`);
                await sleep(delay);
            } else {
                console.error(`  ✗ Error saving PMID:${article.pmid}:`, e.message);
                return null;
            }
        }
    }
    return null;
}

async function main() {
    const args = process.argv.slice(2);
    let pmids: string[] = [];

    // Check for --file argument
    const fileArgIndex = args.indexOf('--file');
    if (fileArgIndex !== -1 && args[fileArgIndex + 1]) {
        const filePath = args[fileArgIndex + 1];
        console.log(`Loading PMIDs from file: ${filePath}`);
        pmids = loadPmidsFromFile(filePath);
    } else {
        // Use command-line arguments as PMIDs
        pmids = args.filter(arg => /^\d+$/.test(arg));
    }

    if (pmids.length === 0) {
        console.error('Usage:');
        console.error('  npx tsx scripts/reingest-failed.ts <PMID1> <PMID2> ...');
        console.error('  npx tsx scripts/reingest-failed.ts --file <path-to-log-file>');
        process.exit(1);
    }

    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !DATABASE_ID) {
        console.error('Error: Missing required environment variables (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, DATABASE_ID)');
        process.exit(1);
    }

    console.log('='.repeat(50));
    console.log('REINGEST FAILED PMIDS');
    console.log('='.repeat(50));
    console.log(`PMIDs to process: ${pmids.length} total`);
    if (pmids.length <= 10) {
        console.log(`  ${pmids.join(', ')}`);
    } else {
        console.log(`  ${pmids.slice(0, 5).join(', ')} ... ${pmids.slice(-5).join(', ')}`);
    }
    console.log(`API Key: ${NCBI_API_KEY ? 'YES' : 'NO'}`);
    console.log('='.repeat(50));

    let success = 0;
    let failed = 0;

    // Fetch details for all PMIDs at once
    console.log('\nFetching article details from PubMed...');
    await sleep(RATE_LIMIT_DELAY);
    const xml = await fetchDetails(pmids);
    const articles = parseArticles(xml);

    console.log(`Found ${articles.length} articles\n`);

    for (const article of articles) {
        console.log(`Processing PMID:${article.pmid} - "${article.title.substring(0, 60)}..."`);
        const studyId = await saveArticle(article);
        if (studyId) {
            console.log(`  ✓ Saved as study ID ${studyId}`);
            if (article.mutations.length > 0) {
                console.log(`    Mutations: ${article.mutations.join(', ')}`);
            }
            success++;
        } else {
            failed++;
        }
        await sleep(100);
    }

    console.log('\n' + '='.repeat(50));
    console.log('REINGEST COMPLETE');
    console.log(`  Success: ${success}`);
    console.log(`  Failed: ${failed}`);
    console.log('='.repeat(50));
}

main().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
