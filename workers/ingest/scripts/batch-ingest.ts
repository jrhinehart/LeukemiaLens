/**
 * Batch Ingest Script
 * 
 * Safely ingests a full year of PubMed articles in batches.
 * Respects rate limits and provides progress logging.
 * 
 * Usage:
 *   cd workers/ingest
 *   npx tsx scripts/batch-ingest.ts --year 2025
 * 
 * Options:
 *   --year     Year to ingest (required)
 *   --batch    Batch size (default: 200)
 *   --delay    Delay between batches in ms (default: 2000)
 *   --start    Starting offset (default: 0, useful for resuming)
 */

import 'dotenv/config';

// Configuration
const WORKER_URL = process.env.WORKER_URL || 'https://leukemialens-ingest.jr-rhinehart.workers.dev';
const DEFAULT_BATCH_SIZE = 200;
const DEFAULT_DELAY_MS = 2000; // 2 seconds between batches for safety

interface IngestResult {
    total: number;
    ingested: number;
    offset: number;
    success: boolean;
    error?: string;
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseArgs(): { year: number; batchSize: number; delayMs: number; startOffset: number } {
    const args = process.argv.slice(2);
    let year = 0;
    let batchSize = DEFAULT_BATCH_SIZE;
    let delayMs = DEFAULT_DELAY_MS;
    let startOffset = 0;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--year' && args[i + 1]) {
            year = parseInt(args[i + 1]);
        } else if (args[i] === '--batch' && args[i + 1]) {
            batchSize = parseInt(args[i + 1]);
        } else if (args[i] === '--delay' && args[i + 1]) {
            delayMs = parseInt(args[i + 1]);
        } else if (args[i] === '--start' && args[i + 1]) {
            startOffset = parseInt(args[i + 1]);
        }
    }

    if (!year) {
        console.error('Error: --year is required');
        console.log('Usage: npx tsx scripts/batch-ingest.ts --year 2025');
        process.exit(1);
    }

    return { year, batchSize, delayMs, startOffset };
}

async function fetchBatch(year: number, limit: number, offset: number): Promise<IngestResult> {
    const url = `${WORKER_URL}?year=${year}&limit=${limit}&offset=${offset}`;

    try {
        const response = await fetch(url);
        const text = await response.text();

        // Parse response: "Ingestion for 2025: Found 12345 total. Ingested 200 in this batch (offset 0)."
        const totalMatch = text.match(/Found (\d+) total/);
        const ingestedMatch = text.match(/Ingested (\d+)/);

        return {
            total: totalMatch ? parseInt(totalMatch[1]) : 0,
            ingested: ingestedMatch ? parseInt(ingestedMatch[1]) : 0,
            offset,
            success: response.ok
        };
    } catch (error: any) {
        return {
            total: 0,
            ingested: 0,
            offset,
            success: false,
            error: error.message
        };
    }
}

async function runBatchIngest() {
    const { year, batchSize, delayMs, startOffset } = parseArgs();

    console.log('='.repeat(60));
    console.log(`BATCH INGEST: Year ${year}`);
    console.log('='.repeat(60));
    console.log(`Worker URL: ${WORKER_URL}`);
    console.log(`Batch size: ${batchSize}`);
    console.log(`Delay between batches: ${delayMs}ms`);
    console.log(`Starting offset: ${startOffset}`);
    console.log('');

    // First, get the total count
    console.log('Fetching total article count...');
    const firstResult = await fetchBatch(year, 1, 0);

    if (!firstResult.success) {
        console.error('Failed to get total count:', firstResult.error);
        process.exit(1);
    }

    const totalArticles = firstResult.total;
    console.log(`Total articles found for ${year}: ${totalArticles}`);

    const totalBatches = Math.ceil((totalArticles - startOffset) / batchSize);
    const estimatedMinutes = Math.ceil((totalBatches * delayMs) / 60000);
    console.log(`Batches to process: ${totalBatches}`);
    console.log(`Estimated time: ~${estimatedMinutes} minutes`);
    console.log('');
    console.log('Starting ingestion...');
    console.log('-'.repeat(60));

    let totalIngested = 0;
    let failedBatches = 0;
    const startTime = Date.now();

    for (let offset = startOffset; offset < totalArticles; offset += batchSize) {
        const batchNum = Math.floor((offset - startOffset) / batchSize) + 1;
        const progress = Math.round((offset / totalArticles) * 100);

        process.stdout.write(`[${progress.toString().padStart(3)}%] Batch ${batchNum}/${totalBatches}: offset ${offset}... `);

        const result = await fetchBatch(year, batchSize, offset);

        if (result.success) {
            console.log(`✓ Ingested ${result.ingested} articles`);
            totalIngested += result.ingested;
        } else {
            console.log(`✗ Failed: ${result.error}`);
            failedBatches++;

            // If too many failures, abort
            if (failedBatches > 5) {
                console.error('\nToo many failures. Aborting.');
                console.log(`Resume from offset ${offset} with: --start ${offset}`);
                break;
            }
        }

        // Delay between batches (except for last one)
        if (offset + batchSize < totalArticles) {
            await delay(delayMs);
        }
    }

    const elapsedMs = Date.now() - startTime;
    const elapsedMinutes = Math.round(elapsedMs / 60000);

    console.log('');
    console.log('='.repeat(60));
    console.log('INGEST COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total articles ingested: ${totalIngested}`);
    console.log(`Failed batches: ${failedBatches}`);
    console.log(`Time elapsed: ${elapsedMinutes} minutes`);

    if (failedBatches > 0) {
        console.log('\nNote: Some batches failed. You may want to re-run with --start to retry.');
    }
}

runBatchIngest().catch(err => {
    console.error('Batch ingest failed:', err);
    process.exit(1);
});
