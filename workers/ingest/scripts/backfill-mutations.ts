/**
 * Backfill Mutations Script
 * 
 * This script re-processes existing studies in the database to extract and populate
 * mutation data using the expanded MUTATION_PATTERNS (ELN 2022 / WHO 2022 standards).
 * 
 * Run this after:
 * 1. Applying schema_mutations.sql to create/update ref_mutations table
 * 2. Updating parsers.ts with new MUTATION_PATTERNS
 * 
 * The script will:
 * - Re-parse all study titles and abstracts
 * - Detect genes using the updated 65-gene pattern set
 * - Update the mutations junction table
 * 
 * Rate Limiting:
 * - Processes studies in batches with delays between batches
 * - Default: 10 studies per batch, 200ms delay (safe for D1 API limits)
 * 
 * Usage:
 *   cd workers/ingest
 *   npx tsx scripts/backfill-mutations.ts
 * 
 * Prerequisites:
 *   - CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables set
 *   - Database schema updated with schema_mutations.sql
 */

import 'dotenv/config';
import { extractMetadata } from '../src/parsers';

// ==========================================
// RATE LIMITING CONFIGURATION
// ==========================================
const BATCH_SIZE = 10;          // Number of studies to process before pausing
const BATCH_DELAY_MS = 200;     // Milliseconds to wait between batches
const REQUEST_DELAY_MS = 50;    // Milliseconds between individual D1 requests

interface D1Response {
    success: boolean;
    result?: any[];
    errors?: any[];
}

const DATABASE_ID = process.env.DATABASE_ID || '6f7d8bb5-1a41-428d-8692-4bc39384a08d';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables must be set');
    process.exit(1);
}

const D1_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DATABASE_ID}`;

/**
 * Delay execution for rate limiting
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function backfillMutations() {
    console.log('Starting mutations backfill (ELN 2022 / WHO 2022 gene set)...');
    console.log(`Rate limiting: ${BATCH_SIZE} studies/batch, ${BATCH_DELAY_MS}ms between batches`);
    console.log('');

    // Fetch all studies
    const studiesResult = await queryD1('SELECT id, title, abstract FROM studies');
    const studies = studiesResult.results;

    console.log(`Found ${studies.length} studies to process`);
    const estimatedTime = Math.ceil(studies.length / BATCH_SIZE) * (BATCH_DELAY_MS / 1000);
    console.log(`Estimated time: ~${Math.ceil(estimatedTime / 60)} minutes`);
    console.log('');

    let processedCount = 0;
    let mutationsAddedCount = 0;
    let studiesWithMutationsCount = 0;
    let skippedCount = 0;

    // Track mutation frequency for summary
    const mutationFrequency: Record<string, number> = {};

    for (const study of studies) {
        const id = study.id;
        const fullText = `${study.title || ''} ${study.abstract || ''}`;

        // Extract metadata using the updated parser
        const metadata = extractMetadata(fullText);

        if (metadata.mutations.length > 0) {
            // Delete existing mutations for this study
            await queryD1('DELETE FROM mutations WHERE study_id = ?', [id]);
            await delay(REQUEST_DELAY_MS);

            // Insert new mutations
            const distinctMutations = [...new Set(metadata.mutations)];

            for (const geneSymbol of distinctMutations) {
                await queryD1(
                    'INSERT INTO mutations (study_id, gene_symbol) VALUES (?, ?)',
                    [id, geneSymbol]
                );
                await delay(REQUEST_DELAY_MS);

                // Track frequency
                mutationFrequency[geneSymbol] = (mutationFrequency[geneSymbol] || 0) + 1;
            }

            mutationsAddedCount += distinctMutations.length;
            studiesWithMutationsCount++;

            if (distinctMutations.length > 5) {
                // Log studies with many mutations for review
                console.log(`Study ${id}: ${distinctMutations.length} mutations - ${distinctMutations.join(', ')}`);
            }
        } else {
            skippedCount++;
        }

        processedCount++;

        // Rate limiting: pause between batches
        if (processedCount % BATCH_SIZE === 0) {
            console.log(`Progress: ${processedCount}/${studies.length} studies processed`);
            await delay(BATCH_DELAY_MS);
        }
    }

    console.log('');
    console.log('='.repeat(50));
    console.log('BACKFILL COMPLETE');
    console.log('='.repeat(50));
    console.log(`Total studies processed: ${processedCount}`);
    console.log(`Studies with mutations: ${studiesWithMutationsCount}`);
    console.log(`Studies without mutations: ${skippedCount}`);
    console.log(`Total mutation tags added: ${mutationsAddedCount}`);
    console.log('');

    // Show top mutations found
    const sortedMutations = Object.entries(mutationFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    console.log('Top 20 Mutations Found:');
    console.log('-'.repeat(30));
    for (const [gene, count] of sortedMutations) {
        console.log(`  ${gene.padEnd(15)} ${count} studies`);
    }
}

backfillMutations().catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
});

