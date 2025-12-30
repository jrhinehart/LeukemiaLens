/**
 * Backfill Publication Dates Script
 * 
 * This script fetches proper publication dates from PubMed for all existing studies
 * that have the default "YYYY-01-01" date format. It will update them with the actual
 * year-month-day from PubMed XML.
 * 
 * Usage:
 *   npx tsx scripts/backfill-dates.ts
 */

import 'dotenv/config';
import * as cheerio from 'cheerio';

interface D1Response {
    success: boolean;
    result?: any[];
    errors?: any[];
}

const DATABASE_ID = process.env.DATABASE_ID || '6f7d8bb5-1a41-428d-8692-4bc39384a08d';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const NCBI_API_KEY = process.env.NCBI_API_KEY;
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'your-email@example.com';

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables must be set');
    process.exit(1);
}

const D1_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DATABASE_ID}`;

// Rate limiter for NCBI API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const RATE_LIMIT_MS = NCBI_API_KEY ? 100 : 334; // 10/sec with key, 3/sec without

async function queryD1(sql: string, params: any[] = []): Promise<any> {
    const response = await fetch(`${D1_API_BASE}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params })
    });

    const data = await response.json() as D1Response;
    if (!data.success) {
        throw new Error(`D1 Query failed: ${JSON.stringify(data.errors)}`);
    }
    if (!data.result || data.result.length === 0) {
        throw new Error('D1 Query returned no results');
    }
    return data.result[0];
}

async function fetchPubMedDate(pmid: string): Promise<string | null> {
    try {
        const params = new URLSearchParams({
            db: 'pubmed',
            id: pmid,
            retmode: 'xml',
            email: NCBI_EMAIL,
            tool: 'LeukemiaLens'
        });

        if (NCBI_API_KEY) {
            params.append('api_key', NCBI_API_KEY);
        }

        const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params.toString()}`);
        const xmlContent = await response.text();

        const $ = cheerio.load(xmlContent, { xmlMode: true });
        const articleNode = $('MedlineCitation > Article');
        const pubDateNode = articleNode.find('Journal > JournalIssue > PubDate');

        let pubDateYear = pubDateNode.find('Year').text();
        let pubDateMonth = pubDateNode.find('Month').text();
        let pubDateDay = pubDateNode.find('Day').text();

        if (!pubDateYear) {
            const medlineDate = pubDateNode.find('MedlineDate').text();
            const match = medlineDate.match(/\d{4}/);
            pubDateYear = match ? match[0] : null;
        }

        if (!pubDateYear) return null;

        // Convert month name to number if needed
        const monthMap: Record<string, string> = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };

        let month = '01';
        if (pubDateMonth) {
            if (/^\d+$/.test(pubDateMonth)) {
                month = pubDateMonth.padStart(2, '0');
            } else {
                month = monthMap[pubDateMonth] || '01';
            }
        }

        const day = pubDateDay ? pubDateDay.padStart(2, '0') : '01';
        return `${pubDateYear}-${month}-${day}`;

    } catch (error: any) {
        console.error(`Error fetching date for PMID ${pmid}:`, error.message);
        return null;
    }
}

async function backfillDates() {
    console.log('Starting publication date backfill...');
    console.log(`Rate limit: ${NCBI_API_KEY ? '10' : '3'} requests/second`);

    // Fetch all studies with Jan 1 dates (likely incorrect)
    const studiesResult = await queryD1(
        "SELECT id, source_id, pub_date FROM studies WHERE source_id LIKE 'PMID:%' AND pub_date LIKE '%-01-01'"
    );
    const studies = studiesResult.results;

    console.log(`Found ${studies.length} studies with Jan 1 dates to update`);

    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const study of studies) {
        const pmid = study.source_id.replace('PMID:', '');

        // Fetch correct date from PubMed
        const correctDate = await fetchPubMedDate(pmid);

        if (correctDate && correctDate !== study.pub_date) {
            try {
                await queryD1(
                    'UPDATE studies SET pub_date = ? WHERE id = ?',
                    [correctDate, study.id]
                );
                updatedCount++;
                console.log(`Study ${study.id} (PMID:${pmid}): ${study.pub_date} → ${correctDate}`);
            } catch (updateError: any) {
                console.error(`Error updating study ${study.id}:`, updateError.message);
                errorCount++;
            }
        } else if (!correctDate) {
            console.warn(`Could not fetch date for PMID:${pmid}`);
            errorCount++;
        }

        processedCount++;
        if (processedCount % 10 === 0) {
            console.log(`Progress: ${processedCount}/${studies.length} studies processed`);
        }

        // Rate limiting
        await delay(RATE_LIMIT_MS);
    }

    console.log(`\nBackfill complete!`);
    console.log(`Processed: ${processedCount} studies`);
    console.log(`Updated: ${updatedCount} dates`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Unchanged: ${processedCount - updatedCount - errorCount}`);
}

backfillDates().catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
