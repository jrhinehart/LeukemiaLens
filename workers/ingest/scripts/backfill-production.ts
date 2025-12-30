/**
 * Production Backfill Script
 * 
 * Safely backfills LeukemiaLens database with historical PubMed articles.
 * Respects NCBI rate limits and runs in manageable batches.
 * 
 * NCBI API RESTRICTIONS:
 * - 3 requests/sec without API key
 * - 10 requests/sec with API key
 * - Large backfills (>100 requests) should run between 9 PM and 5 AM US Eastern Time.
 * 
 * Usage:
 *   # Backfill 2000-2022, 100 articles per year (Default)
 *   npx tsx scripts/backfill-production.ts --start-year 2000 --end-year 2022 --batch-size 100
 *   
 *   # Monthly granularity (recommended for large datasets)
 *   npx tsx scripts/backfill-production.ts --start-year 2023 --granular --batch-size 500
 * 
 *   # Resume from specific offset
 *   npx tsx scripts/backfill-production.ts --start-year 2023 --granular --offset 500
 */

const WORKER_URL = process.env.WORKER_URL || 'https://leukemialens-ingest.jr-rhinehart.workers.dev';

interface BackfillOptions {
    startYear: number;
    endYear: number;
    batchSize: number;
    offset: number;
    month?: number;
    dryRun: boolean;
    granular: boolean;
}

interface BackfillProgress {
    totalYears: number;
    completedYears: number;
    failedYears: string[];
    startTime: number;
    currentYear?: number;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function printProgress(progress: BackfillProgress) {
    const elapsed = Date.now() - progress.startTime;
    const elapsedMin = Math.floor(elapsed / 60000);
    const percentComplete = Math.round((progress.completedYears / progress.totalYears) * 100);

    console.log('\n--- Progress Report ---');
    console.log(`  Completed: ${progress.completedYears}/${progress.totalYears} segments (${percentComplete}%)`);
    console.log(`  Failed: ${progress.failedYears.length}`);
    console.log(`  Elapsed Time: ${elapsedMin} minutes`);
    if (progress.currentYear) {
        console.log(`  Current Year: ${progress.currentYear}`);
    }
    console.log('----------------------\n');
}

async function backfillProduction(options: BackfillOptions) {
    const years = options.endYear - options.startYear + 1;
    const progress: BackfillProgress = {
        totalYears: years,
        completedYears: 0,
        failedYears: [],
        startTime: Date.now()
    };

    console.log('='.repeat(60));
    console.log('LEUKEMIALENS PRODUCTION BACKFILL');
    console.log('='.repeat(60));
    console.log(`Worker URL: ${WORKER_URL}`);
    console.log(`Year Range: ${options.startYear} - ${options.endYear}`);
    if (options.month) console.log(`Month:      ${options.month}`);
    console.log(`Mode:       ${options.granular ? 'MONTHLY (Granular)' : 'YEARLY'}`);
    console.log(`Batch Size: ${options.batchSize} articles per segment`);
    if (options.offset > 0) console.log(`Offset:     ${options.offset}`);
    console.log('='.repeat(60));

    if (!options.dryRun) {
        console.log('⚠️  Running in PRODUCTION mode. Press Ctrl+C to cancel...');
        console.log('Starting in 3 seconds...\n');
        await sleep(3000);
    }

    for (let year = options.startYear; year <= options.endYear; year++) {
        const startMonth = options.month || 1;
        const endMonth = options.month || (options.granular ? 12 : 1);

        for (let m = startMonth; m <= endMonth; m++) {
            const displayMonth = (options.granular || options.month) ? `-${m.toString().padStart(2, '0')}` : '';
            console.log(`\n[${year}${displayMonth}] Processing...`);

            try {
                const url = new URL(WORKER_URL);
                url.searchParams.set('year', year.toString());
                if (options.granular || options.month) url.searchParams.set('month', m.toString());
                url.searchParams.set('limit', options.batchSize.toString());
                if (options.offset > 0) url.searchParams.set('offset', options.offset.toString());

                if (options.dryRun) {
                    console.log(`  [DRY RUN] Would trigger: ${url.toString()}`);
                } else {
                    const response = await fetch(url.toString());
                    const text = await response.text();

                    if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);

                    console.log(`  [${year}${displayMonth}] ✓ ${text}`);

                    // Delay between requests to be extra safe
                    const delay = (options.granular || options.month) ? 2000 : 5000;
                    if (year < options.endYear || m < endMonth) {
                        console.log(`  [${year}${displayMonth}] Waiting ${delay}ms...`);
                        await sleep(delay);
                    }
                }
            } catch (error: any) {
                console.error(`  [${year}${displayMonth}] ✗ Failed: ${error.message}`);
                progress.failedYears.push(`${year}${displayMonth}: ${error.message}`);
            }
        }
        progress.completedYears++;
        progress.currentYear = year;
        if (progress.completedYears % 5 === 0) printProgress(progress);
    }

    console.log('\n' + '='.repeat(60));
    console.log('BACKFILL COMPLETE');
    printProgress(progress);

    if (progress.failedYears.length > 0) {
        console.log('\n⚠️  Failed Segments:');
        progress.failedYears.forEach(failure => console.log(`  - ${failure}`));
    }
}

// CLI argument parsing
const args = process.argv.slice(2);
const options: BackfillOptions = {
    startYear: 2000,
    endYear: 2022,
    batchSize: 100,
    offset: 0,
    dryRun: false,
    granular: false
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start-year' && args[i + 1]) options.startYear = parseInt(args[i + 1]);
    if (args[i] === '--end-year' && args[i + 1]) options.endYear = parseInt(args[i + 1]);
    if (args[i] === '--batch-size' && args[i + 1]) options.batchSize = parseInt(args[i + 1]);
    if (args[i] === '--offset' && args[i + 1]) options.offset = parseInt(args[i + 1]);
    if (args[i] === '--month' && args[i + 1]) options.month = parseInt(args[i + 1]);
    if (args[i] === '--dry-run') options.dryRun = true;
    if (args[i] === '--granular') options.granular = true;
}

// Validation
if (options.startYear > options.endYear) {
    console.error('Error: start-year must be <= end-year');
    process.exit(1);
}

if (options.batchSize < 0 || options.batchSize > 1000) {
    console.error('Error: batch-size must be between 0-1000 (Set to 0 for count-only mode)');
    process.exit(1);
}

backfillProduction(options).catch(err => {
    console.error('Backfill execution failed:', err);
    process.exit(1);
});
