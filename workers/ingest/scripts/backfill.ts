// import { fetch } from 'undici'; // using global fetch (Node 18+)

let WORKER_URL = "http://localhost:8787";

async function runBackfill(startYear: number, endYear: number, workerUrl?: string) {
    if (workerUrl) WORKER_URL = workerUrl;
    console.log(`Starting backfill from ${startYear} to ${endYear} against ${WORKER_URL}...`);

    for (let year = startYear; year <= endYear; year++) {
        console.log(`Triggering ingest for ${year}...`);
        try {
            const response = await fetch(`${WORKER_URL}?year=${year}`);
            const text = await response.text();
            console.log(`Response for ${year}: ${response.status} - ${text}`);
        } catch (e) {
            console.error(`Failed to trigger for ${year}:`, e);
        }

        // Wait a bit to avoid rate limits if any
        await new Promise(r => setTimeout(r, 5000));
    }

    console.log("Backfill trigger complete.");
}

// Check if running directly
if (require.main === module) {
    const start = process.argv[2] ? parseInt(process.argv[2]) : 2023;
    const end = process.argv[3] ? parseInt(process.argv[3]) : 2023;
    const url = process.argv[4];
    runBackfill(start, end, url);
}
