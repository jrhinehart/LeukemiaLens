/**
 * Production Backfill Script
 * 
 * Safely backfills LeukemiaLens database with historical PubMed articles.
 * Respects NCBI rate limits and runs in manageable batches.
 * 
 * Usage:
 *   # Backfill 2000-2022 (before current data), 100 articles per year
 *   npx tsx scripts/backfill-production.ts --start-year 2000 --end-year 2022 --batch-size 100
 *   
 *   # Resume from specific year
 *   npx tsx scripts/backfill-production.ts --start-year 2015 --end-year 2022 --batch-size 100
 *   
 *   # Dry run (see what will be fetched without ingesting)
 *   npx tsx scripts/backfill-production.ts --start-year 2020 --end-year 2020 --dry-run
 */

const WORKER_URL = process.env.WORKER_URL || 'https://leukemialens-ingest.jr-rhinehart.workers.dev';
const DELAY_BETWEEN_YEARS = 5000; // 5 seconds between year batches (conservative)

interface BackfillOptions {
    startYear: number;
    endYear: number;
    batchSize: number;
    dryRun: boolean;
}

interface BackfillProgress {
    totalYears: number;
    completedYears: number;
    failedYears: string[];
    startTime: number;
    currentYear?: number;
}

async function backfillProduction(options: BackfillOptions) {
    const progress: BackfillProgress = {
        totalYears: options.endYear - options.startYear + 1,
        completedYears: 0,
        failedYears: [],
        startTime: Date.now()
    };

    console.log('='.repeat(60));
    console.log('LEUKEMIALENS PRODUCTION BACKFILL');
    console.log('='.repeat(60));
    console.log(`Worker URL: ${WORKER_URL}`);
    console.log(`Year Range: ${options.startYear} - ${options.endYear}`);
    console.log(`Batch Size: ${options.batchSize} articles/year`);
    console.log(`Dry Run: ${options.dryRun ? 'YES' : 'NO'}`);
    console.log(`Total Years: ${progress.totalYears}`);
    console.log('='.repeat(60));

    if (!options.dryRun) {
        console.log('⚠️  Running in PRODUCTION mode. Press Ctrl+C to cancel...');
        console.log('Starting in 5 seconds...\n');
        await sleep(5000);
    }

    for (let year = options.startYear; year <= options.endYear; year++) {
        progress.currentYear = year;

        try {
            console.log(`\n[${year}] Processing year ${year}...`);

            if (options.dryRun) {
                console.log(`  [DRY RUN] Would trigger: ${WORKER_URL}?year=${year}&limit=${options.batchSize}`);
                await sleep(100); // Minimal delay for dry run
            } else {
                const response = await fetch(`${WORKER_URL}?year=${year}&limit=${options.batchSize}`);
                const text = await response.text();

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${text}`);
                }

                console.log(`  [${year}] ✓ ${response.status} - ${text}`);
                progress.completedYears++;

                // Conservative delay between years
                if (year < options.endYear) {
                    console.log(`  [${year}] Waiting ${DELAY_BETWEEN_YEARS}ms before next year...`);
                    await sleep(DELAY_BETWEEN_YEARS);
                }
            }

            // Progress report every 5 years
            if (progress.completedYears % 5 === 0 && progress.completedYears > 0) {
                printProgress(progress);
            }

        } catch (error: any) {
            console.error(`  [${year}] ✗ Failed: ${error.message}`);
            progress.failedYears.push(`${year}: ${error.message}`);

            // Continue on error but log it
            console.log(`  [${year}] Continuing to next year after error...`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('BACKFILL COMPLETE');
    printProgress(progress);

    if (progress.failedYears.length > 0) {
        console.log('\n⚠️  Failed Years:');
        progress.failedYears.forEach(failure => console.log(`  - ${failure}`));
        console.log('\nYou can re-run the script for failed years to retry.');
    }

    console.log('='.repeat(60));
}

function printProgress(progress: BackfillProgress) {
    const elapsed = Date.now() - progress.startTime;
    const elapsedMin = Math.floor(elapsed / 60000);
    const percentComplete = Math.round((progress.completedYears / progress.totalYears) * 100);

    console.log('\n--- Progress Report ---');
    console.log(`  Completed: ${progress.completedYears}/${progress.totalYears} years (${percentComplete}%)`);
    console.log(`  Failed: ${progress.failedYears.length}`);
    console.log(`  Elapsed Time: ${elapsedMin} minutes`);
    if (progress.currentYear) {
        console.log(`  Current Year: ${progress.currentYear}`);
    }
    console.log('----------------------\n');
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// CLI argument parsing
const args = process.argv.slice(2);
const options: BackfillOptions = {
    startYear: 2000,
    endYear: 2022,
    batchSize: 100,
    dryRun: false
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start-year' && args[i + 1]) options.startYear = parseInt(args[i + 1]);
    if (args[i] === '--end-year' && args[i + 1]) options.endYear = parseInt(args[i + 1]);
    if (args[i] === '--batch-size' && args[i + 1]) options.batchSize = parseInt(args[i + 1]);
    if (args[i] === '--dry-run') options.dryRun = true;
}

// Validation
if (options.startYear > options.endYear) {
    console.error('Error: start-year must be <= end-year');
    process.exit(1);
}

if (options.batchSize < 1 || options.batchSize > 500) {
    console.error('Error: batch-size must be between 1-500');
    process.exit(1);
}

backfillProduction(options).catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
