/**
 * Quick script to get database statistics from D1
 * Run with: npx tsx get-db-stats.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from workers/ingest directory
config({ path: resolve(__dirname, 'workers/ingest/.env') });

const DATABASE_ID = process.env.DATABASE_ID || 'b5ee24c9-52bc-44c8-993d-fb45c1f68d4d';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables must be set');
    process.exit(1);
}

const D1_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DATABASE_ID}`;

async function executeQuery(sql: string): Promise<any> {
    const response = await fetch(`${D1_API_BASE}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result[0];
}

async function getDatabaseStats() {
    console.log('📊 LeukemiaLens Database Statistics\n');
    console.log('='.repeat(50));

    // Main tables
    const studiesCount = await executeQuery('SELECT COUNT(*) as count FROM studies');
    console.log(`\n📚 Studies (Articles):        ${studiesCount.results[0].count.toLocaleString()}`);

    // Junction tables
    const mutationsCount = await executeQuery('SELECT COUNT(*) as count FROM mutations');
    console.log(`🧬 Mutation Records:          ${mutationsCount.results[0].count.toLocaleString()}`);

    const topicsCount = await executeQuery('SELECT COUNT(*) as count FROM study_topics');
    console.log(`🏷️  Study Topics:              ${topicsCount.results[0].count.toLocaleString()}`);

    const treatmentsCount = await executeQuery('SELECT COUNT(*) as count FROM treatments');
    console.log(`💊 Treatment Records:         ${treatmentsCount.results[0].count.toLocaleString()}`);

    console.log('\n' + '='.repeat(50));
    console.log('📖 Ontology/Reference Tables\n');

    // Ontology tables
    const refDiseases = await executeQuery('SELECT COUNT(*) as count FROM ref_diseases');
    console.log(`🦠 Reference Diseases:        ${refDiseases.results[0].count.toLocaleString()}`);

    const refMutations = await executeQuery('SELECT COUNT(*) as count FROM ref_mutations');
    console.log(`🧬 Reference Mutations:       ${refMutations.results[0].count.toLocaleString()}`);

    const refTreatments = await executeQuery('SELECT COUNT(*) as count FROM ref_treatments');
    console.log(`💊 Reference Treatments:      ${refTreatments.results[0].count.toLocaleString()}`);

    console.log('\n' + '='.repeat(50));
    console.log('📊 Unique Counts\n');

    // Unique values
    const uniqueMutations = await executeQuery('SELECT COUNT(DISTINCT gene_symbol) as count FROM mutations');
    console.log(`🧬 Unique Mutations Found:    ${uniqueMutations.results[0].count.toLocaleString()}`);

    const uniqueTopics = await executeQuery('SELECT COUNT(DISTINCT topic_name) as count FROM study_topics');
    console.log(`🏷️  Unique Topics:             ${uniqueTopics.results[0].count.toLocaleString()}`);

    console.log('\n' + '='.repeat(50));
    console.log('📅 Date Range\n');

    const dateRange = await executeQuery('SELECT MIN(pub_date) as min_date, MAX(pub_date) as max_date FROM studies WHERE pub_date IS NOT NULL');
    console.log(`📆 Oldest Article:            ${dateRange.results[0].min_date}`);
    console.log(`📆 Newest Article:            ${dateRange.results[0].max_date}`);

    console.log('\n' + '='.repeat(50));
}

getDatabaseStats().catch(console.error);
