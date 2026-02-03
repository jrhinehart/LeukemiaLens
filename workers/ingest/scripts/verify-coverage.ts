/**
 * Verify Coverage Accuracy
 * 
 * Compares PubMed counts to actual database counts to debug coverage discrepancies.
 */

import 'dotenv/config';

const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'jr.rhinehart@gmail.com';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

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
    if (!data.success) throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
    return data.result[0];
}

async function getPubmedCount(year: number, month: number): Promise<number> {
    const lastDay = new Date(year, month, 0).getDate();
    const monthStr = month.toString().padStart(2, '0');
    const term = `(Leukemia[Title/Abstract]) AND ("${year}/${monthStr}/01"[Date - Publication] : "${year}/${monthStr}/${lastDay}"[Date - Publication])`;

    const params = new URLSearchParams({
        db: 'pubmed', term, retmax: '0', rettype: 'count',
        email: NCBI_EMAIL, tool: 'LeukemiaLens-Verify', retmode: 'json'
    });
    if (NCBI_API_KEY) params.append('api_key', NCBI_API_KEY);

    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params.toString()}`);
    const data = await response.json() as any;
    return parseInt(data.esearchresult?.count || '0');
}

async function main() {
    const year = parseInt(process.argv[2]) || 2024;
    const month = parseInt(process.argv[3]) || 3;
    const monthStr = month.toString().padStart(2, '0');

    console.log(`\nVerifying coverage for ${year}-${monthStr}...\n`);

    // 1. Get PubMed count (what we want to capture)
    const pubmedCount = await getPubmedCount(year, month);
    console.log(`PubMed reports: ${pubmedCount} articles with "Leukemia" in title/abstract`);

    // 2. Get coverage_metrics value (what we stored)
    const metricsResult = await queryD1(
        'SELECT pubmed_total FROM coverage_metrics WHERE year = ? AND month = ?',
        [year, month]
    );
    const storedPubmed = metricsResult.results?.[0]?.pubmed_total || 'NOT FOUND';
    console.log(`coverage_metrics stored: ${storedPubmed}`);

    // 3. Get actual studies count for this month
    const studiesResult = await queryD1(
        `SELECT COUNT(*) as count FROM studies 
         WHERE pub_date >= ? AND pub_date < ?`,
        [`${year}-${monthStr}-01`, `${year}-${month === 12 ? monthStr : (month + 1).toString().padStart(2, '0')}-01`]
    );
    const dbCount = studiesResult.results?.[0]?.count || 0;
    console.log(`Database has: ${dbCount} studies for this month`);

    // 4. Calculate coverage
    const coverage = pubmedCount > 0 ? ((dbCount / pubmedCount) * 100).toFixed(1) : 'N/A';
    console.log(`\nActual coverage: ${coverage}%`);

    // 5. Check if counts match
    if (storedPubmed !== pubmedCount) {
        console.log(`\n⚠️  Coverage metric mismatch! Stored ${storedPubmed} but PubMed now reports ${pubmedCount}`);
    }

    // 6. Sample check - get some PMIDs from PubMed and see if they exist in DB
    console.log(`\n--- Sample Check ---`);
    const sampleParams = new URLSearchParams({
        db: 'pubmed',
        term: `(Leukemia[Title/Abstract]) AND ("${year}/${monthStr}/01"[Date - Publication] : "${year}/${monthStr}/${new Date(year, month, 0).getDate()}"[Date - Publication])`,
        retmax: '20', retstart: '0', email: NCBI_EMAIL, tool: 'LeukemiaLens-Verify', retmode: 'json'
    });
    if (NCBI_API_KEY) sampleParams.append('api_key', NCBI_API_KEY);

    const sampleRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${sampleParams.toString()}`);
    const sampleData = await sampleRes.json() as any;
    const sampleIds = sampleData.esearchresult?.idlist || [];

    // Check how many of these exist in DB
    if (sampleIds.length > 0) {
        const placeholders = sampleIds.map(() => '?').join(',');
        const existResult = await queryD1(
            `SELECT source_id FROM studies WHERE source_id IN (${placeholders})`,
            sampleIds.map((id: string) => `PMID:${id}`)
        );
        const existCount = existResult.results?.length || 0;
        console.log(`Of first 20 PubMed results, ${existCount} exist in DB (${((existCount / 20) * 100).toFixed(0)}%)`);

        if (existCount < 20) {
            const existingIds = new Set((existResult.results || []).map((r: any) => r.source_id.replace('PMID:', '')));
            const missing = sampleIds.filter((id: string) => !existingIds.has(id));
            console.log(`Missing PMIDs: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
        }
    }
}

main().catch(console.error);
