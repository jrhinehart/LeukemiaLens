/**
 * Backfill Topics Script
 * 
 * This script re-processes existing studies in the database to extract and populate
 * the study_topics table. Run this after adding the study_topics table to populate
 * topics for articles that were ingested before topic extraction was implemented.
 * 
 * Usage:
 *   npx tsx scripts/backfill-topics.ts
 */

import { extractMetadata } from '../src/parsers';

const DATABASE_ID = process.env.DATABASE_ID || '6f7d8bb5-1a41-428d-8692-4bc39384a08d';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables must be set');
    process.exit(1);
}

const D1_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${DATABASE_ID}`;

async function queryD1(sql: string, params: any[] = []): Promise<any> {
    const response = await fetch(`${D1_API_BASE}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params })
    });

    const data = await response.json();
    if (!data.success) {
        throw new Error(`D1 Query failed: ${JSON.stringify(data.errors)}`);
    }
    return data.result[0];
}

async function backfillTopics() {
    console.log('Starting topic backfill...');

    // Fetch all studies
    const studiesResult = await queryD1('SELECT id, title, abstract FROM studies');
    const studies = studiesResult.results;

    console.log(`Found ${studies.length} studies to process`);

    let processedCount = 0;
    let topicsAddedCount = 0;

    for (const study of studies) {
        const id = study.id;
        const fullText = `${study.title || ''} ${study.abstract || ''}`;

        // Extract metadata using the same parser as ingestion
        const metadata = extractMetadata(fullText);

        if (metadata.topics.length > 0) {
            // Delete existing topics for this study (if any)
            await queryD1('DELETE FROM study_topics WHERE study_id = ?', [id]);

            // Insert new topics
            const distinctTopics = [...new Set(metadata.topics)];
            for (const topic of distinctTopics) {
                await queryD1('INSERT INTO study_topics (study_id, topic_name) VALUES (?, ?)', [id, topic]);
                topicsAddedCount++;
            }

            console.log(`Study ${id}: Added ${distinctTopics.length} topics: ${distinctTopics.join(', ')}`);
        }

        processedCount++;
        if (processedCount % 10 === 0) {
            console.log(`Progress: ${processedCount}/${studies.length} studies processed`);
        }
    }

    console.log(`\nBackfill complete!`);
    console.log(`Processed: ${processedCount} studies`);
    console.log(`Topics added: ${topicsAddedCount}`);
}

backfillTopics().catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
