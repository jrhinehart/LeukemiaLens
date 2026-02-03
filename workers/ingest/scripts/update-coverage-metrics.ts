/**
 * Update Coverage Metrics
 * 
 * Populates the coverage_metrics table with accurate PubMed totals
 * for any month that doesn't have data yet.
 * 
 * Usage:
 *   npx tsx scripts/update-coverage-metrics.ts
 *   npx tsx scripts/update-coverage-metrics.ts --start-year 2020 --end-year 2025
 *   npx tsx scripts/update-coverage-metrics.ts --force  # Re-fetch all months
 */

import 'dotenv/config';

const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'jr.rhinehart@gmail.com';
const TOOL_NAME = 'LeukemiaLens-CoverageCheck';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

const RATE_LIMIT_DELAY = NCBI_API_KEY ? 100 : 350;

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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

async function getPubmedCount(year: number, month: number): Promise<number> {
    const lastDay = new Date(year, month, 0).getDate();
    const monthStr = month.toString().padStart(2, '0');
    const term = `(Leukemia[Title/Abstract]) AND ("${year}/${monthStr}/01"[Date - Publication] : "${year}/${monthStr}/${lastDay}"[Date - Publication])`;

    const params = new URLSearchParams({
        db: 'pubmed',
        term,
        retmax: '0',
        rettype: 'count',
        email: NCBI_EMAIL,
        tool: TOOL_NAME,
        retmode: 'json'
    });

    if (NCBI_API_KEY) {
        params.append('api_key', NCBI_API_KEY);
    }

    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params.toString()}`);
    const data = await response.json() as any;

    return parseInt(data.esearchresult?.count || '0');
}

async function main() {
    // Validate env
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !DATABASE_ID) {
        console.error('Error: Requires CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and DATABASE_ID in .env');
        process.exit(1);
    }

    // Parse args
    const args = process.argv.slice(2);
    let startYear = 2015;
    let endYear = new Date().getFullYear();
    let forceRefresh = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--start-year' && args[i + 1]) startYear = parseInt(args[i + 1]);
        if (args[i] === '--end-year' && args[i + 1]) endYear = parseInt(args[i + 1]);
        if (args[i] === '--force') forceRefresh = true;
    }

    console.log('='.repeat(50));
    console.log('UPDATE COVERAGE METRICS');
    console.log('='.repeat(50));
    console.log(`Year Range: ${startYear} - ${endYear}`);
    console.log(`Force Refresh: ${forceRefresh ? 'YES' : 'NO'}`);
    console.log(`API Key: ${NCBI_API_KEY ? 'YES' : 'NO'}`);
    console.log('='.repeat(50));
    console.log('');

    // Get existing metrics
    let existingMetrics = new Set<string>();
    if (!forceRefresh) {
        try {
            const result = await queryD1('SELECT year, month FROM coverage_metrics');
            if (result.results) {
                result.results.forEach((r: any) => {
                    existingMetrics.add(`${r.year}-${r.month}`);
                });
            }
            console.log(`Found ${existingMetrics.size} existing entries.`);
        } catch (e) {
            console.log('No existing metrics found (table may be empty).');
        }
    }

    let updated = 0;
    let skipped = 0;

    for (let year = startYear; year <= endYear; year++) {
        // Determine last month to process
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const lastMonth = (year === currentYear) ? currentMonth : 12;

        for (let month = 1; month <= lastMonth; month++) {
            const key = `${year}-${month}`;

            if (!forceRefresh && existingMetrics.has(key)) {
                skipped++;
                continue;
            }

            await sleep(RATE_LIMIT_DELAY);

            try {
                const count = await getPubmedCount(year, month);

                await queryD1(
                    `INSERT INTO coverage_metrics (year, month, pubmed_total, last_updated)
                     VALUES (?, ?, ?, ?)
                     ON CONFLICT(year, month) DO UPDATE SET
                     pubmed_total = excluded.pubmed_total,
                     last_updated = excluded.last_updated`,
                    [year, month, count, new Date().toISOString()]
                );

                console.log(`✓ ${year}-${month.toString().padStart(2, '0')}: ${count.toLocaleString()} articles`);
                updated++;
            } catch (e: any) {
                console.error(`✗ ${year}-${month.toString().padStart(2, '0')}: ${e.message}`);
            }
        }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log(`Done! Updated: ${updated}, Skipped: ${skipped}`);
    console.log('='.repeat(50));
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
