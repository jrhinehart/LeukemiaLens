/**
 * Backfill Treatments Script
 * 
 * This script re-processes existing studies in the database to extract and populate
 * treatment data. Run this after applying schema_treatments.sql to tag articles
 * that were ingested before treatment extraction was implemented.
 * 
 * Usage:
 *   npx tsx scripts/backfill-treatments.ts
 */

import 'dotenv/config';
import { extractMetadata } from '../src/parsers';

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

async function backfillTreatments() {
    console.log('Starting treatment backfill...');

    // Fetch all studies
    const studiesResult = await queryD1('SELECT id, title, abstract FROM studies');
    const studies = studiesResult.results;

    console.log(`Found ${studies.length} studies to process`);

    let processedCount = 0;
    let treatmentsAddedCount = 0;
    let skippedCount = 0;

    for (const study of studies) {
        const id = study.id;
        const fullText = `${study.title || ''} ${study.abstract || ''}`;

        // Extract metadata using the same parser as ingestion
        const metadata = extractMetadata(fullText);

        if (metadata.treatments.length > 0) {
            // Delete existing treatments for this study (if any)
            await queryD1('DELETE FROM treatments WHERE study_id = ?', [id]);

            // Look up treatment IDs from ref_treatments
            const distinctTreatments = [...new Set(metadata.treatments)];
            const treatmentIds: number[] = [];

            for (const treatmentCode of distinctTreatments) {
                try {
                    const result = await queryD1(
                        'SELECT id FROM ref_treatments WHERE code = ?',
                        [treatmentCode]
                    );

                    if (result.results && result.results.length > 0 && result.results[0].id) {
                        treatmentIds.push(result.results[0].id);
                    } else {
                        console.warn(`  Treatment code '${treatmentCode}' not found in ref_treatments for study ${id}`);
                    }
                } catch (lookupError: any) {
                    console.warn(`  Error looking up treatment '${treatmentCode}':`, lookupError.message);
                }
            }

            // Insert treatment associations
            if (treatmentIds.length > 0) {
                for (const treatmentId of treatmentIds) {
                    await queryD1(
                        'INSERT INTO treatments (study_id, treatment_id) VALUES (?, ?)',
                        [id, treatmentId]
                    );
                }
                treatmentsAddedCount += treatmentIds.length;
                console.log(`Study ${id}: Added ${treatmentIds.length} treatments: ${distinctTreatments.join(', ')}`);
            }
        } else {
            skippedCount++;
        }

        processedCount++;
        if (processedCount % 10 === 0) {
            console.log(`Progress: ${processedCount}/${studies.length} studies processed`);
        }
    }

    console.log(`\nBackfill complete!`);
    console.log(`Processed: ${processedCount} studies`);
    console.log(`Treatments added: ${treatmentsAddedCount}`);
    console.log(`Studies with no treatments: ${skippedCount}`);
}

backfillTreatments().catch(err => {
    console.error('Backfill failed:', err);
    process.exit(1);
});
