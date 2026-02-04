/**
 * Production Backfill Script
 * 
 * Safely backfills LeukemiaLens database with historical PubMed articles.
 * Supports both Worker-based and local execution modes.
 * 
 * MODES:
 * - Worker mode (default): Calls the deployed Cloudflare Worker
 * - Local mode (--local): Runs locally without Worker timeout limits
 * 
 * NCBI API RESTRICTIONS:
 * - 3 requests/sec without API key
 * - 10 requests/sec with API key
 * - Large backfills (>100 requests) should run between 9 PM and 5 AM US Eastern Time.
 * 
 * Usage:
 *   # Worker mode (default) - limited by Worker timeouts
 *   npx tsx scripts/backfill-production.ts --start-year 2024 --month 1 --batch-size 25
 *   
 *   # Local mode - no timeout limits, uses D1 REST API directly
 *   npx tsx scripts/backfill-production.ts --local --start-year 2024 --month 1 --batch-size 100
 *   
 *   # Monthly granularity (recommended for large datasets)
 *   npx tsx scripts/backfill-production.ts --local --start-year 2020 --end-year 2023 --granular
 * 
 *   # Resume from specific offset
 *   npx tsx scripts/backfill-production.ts --local --start-year 2024 --month 1 --offset 500
 * 
 *   # Limit total articles per segment
 *   npx tsx scripts/backfill-production.ts --local --start-year 2024 --month 1 --limit 500
 * 
 *   # Enable RAG: Also fetch PMC full-text docs for newly ingested articles
 *   npx tsx scripts/backfill-production.ts --local --start-year 2024 --month 1 --with-rag
 * 
 * Environment variables (required for --local mode, in .env):
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN  
 *   DATABASE_ID
 *   NCBI_API_KEY (optional, increases rate limit to 10 req/s)
 *   NCBI_EMAIL
 */

import 'dotenv/config';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { extractMetadata } from '../src/parsers';

// ==========================================
// CONFIGURATION
// ==========================================
const WORKER_URL = process.env.WORKER_URL || 'https://leukemialens-ingest.jr-rhinehart.workers.dev';
const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'jr.rhinehart@gmail.com';
const TOOL_NAME = 'LeukemiaLens-Backfill';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

// Rate limiting
const RATE_LIMIT_DELAY = NCBI_API_KEY ? 100 : 350; // ms between NCBI requests

interface BackfillOptions {
    startYear: number;
    endYear: number;
    batchSize: number;
    offset: number;
    month?: number;
    dryRun: boolean;
    granular: boolean;
    limit?: number;
    useAI: boolean;
    local: boolean;
    withRag: boolean;  // Trigger RAG document fetch after backfill
    withGpu: boolean;  // Trigger GPU backfill after document fetch
    workers: number;   // Number of parallel workers for GPU processing
    includeErrors: boolean;  // Include documents in error state for reprocessing
}

interface BackfillProgress {
    totalSegments: number;
    completedSegments: number;
    failedSegments: string[];
    articlesIngested: number;
    articlesFailed: number;
    failedPmids: string[];  // Track individual failed PMIDs
    startTime: number;
    currentSegment?: string;
    ragCompleted: number;    // Segments with RAG completed
    gpuCompleted: number;    // Segments with GPU completed
    completedSegmentLabels: Set<string>; // Track unique labels of completed segments
}

interface ArticleData {
    pmid: string;
    title: string;
    abstract: string;
    pubDate: string;
    journal: string;
    authors: string;
    affiliations: string;
    mutations: string[];
    topics: string[];
    treatments: string[];
    diseaseSubtypes: string[];
    hasComplexKaryotype: boolean;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function printProgress(progress: BackfillProgress) {
    const elapsed = Date.now() - progress.startTime;
    const elapsedMin = Math.floor(elapsed / 60000);
    const percentComplete = Math.round((progress.completedSegments / progress.totalSegments) * 100);

    console.log('\n--- Progress Report ---');
    console.log(`  Segments: ${progress.completedSegments}/${progress.totalSegments} (${percentComplete}%)`);
    console.log(`  Articles: ${progress.articlesIngested} ingested, ${progress.articlesFailed} failed`);
    if (progress.ragCompleted > 0 || progress.gpuCompleted > 0) {
        console.log(`  RAG: ${progress.ragCompleted} segments, GPU: ${progress.gpuCompleted} segments`);
    }
    console.log(`  Elapsed Time: ${elapsedMin} minutes`);
    if (progress.currentSegment) {
        console.log(`  Current: ${progress.currentSegment}`);
    }
    if (progress.failedSegments.length > 0) {
        console.log(`  Failed Segments: ${progress.failedSegments.length}`);
    }
    console.log('----------------------\n');
}

// ==========================================
// UTILITIES
// ==========================================
async function fetchWithRetry(url: string, init?: RequestInit, maxRetries: number = 3): Promise<Response> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, init);

            // NCBI rate limit or server error
            if (response.status === 429 || response.status >= 500) {
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`  ⚠️ Request failed (${response.status} ${response.statusText}), retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
                    await sleep(delay);
                    continue;
                }
            }

            return response;
        } catch (error: any) {
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`  ⚠️ Network error (${error.message}), retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
                await sleep(delay);
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
}

// ==========================================
// STATE MANAGEMENT (Checkpointing)
// ==========================================
const STATE_FILE = path.join(__dirname, '../backfill-state.json');

class StateManager {
    static load(): Partial<BackfillOptions> & { completed: string[] } {
        if (!fs.existsSync(STATE_FILE)) return { completed: [] };
        try {
            const data = fs.readFileSync(STATE_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.warn('  ⚠️ Failed to load state file:', e);
            return { completed: [] };
        }
    }

    static save(options: BackfillOptions, progress: BackfillProgress) {
        try {
            const data = {
                startYear: options.startYear,
                endYear: options.endYear,
                granular: options.granular,
                month: options.month,
                withRag: options.withRag,
                withGpu: options.withGpu,
                completed: Array.from(progress.completedSegmentLabels),
                lastUpdate: new Date().toISOString()
            };
            fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('  ⚠️ Failed to save state file:', e);
        }
    }

    static clear() {
        if (fs.existsSync(STATE_FILE)) {
            fs.unlinkSync(STATE_FILE);
            console.log('  ♻️ Progress state cleared.');
        }
    }
}

// ==========================================
// D1 REST API (Local Mode)
// ==========================================
async function queryD1(sql: string, params: any[] = []): Promise<any> {
    const response = await fetchWithRetry(
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

// ==========================================
// PubMed API (Local Mode)
// ==========================================
function buildSearchTerm(year: number, month?: number): string {
    if (month) {
        const lastDay = new Date(year, month, 0).getDate();
        const monthStr = month.toString().padStart(2, '0');
        return `(Leukemia[Title/Abstract]) AND ("${year}/${monthStr}/01"[Date - Publication] : "${year}/${monthStr}/${lastDay}"[Date - Publication])`;
    }
    return `(Leukemia[Title/Abstract]) AND ("${year}/01/01"[Date - Publication] : "${year}/12/31"[Date - Publication])`;
}

async function searchPubmed(term: string, limit: number, offset: number): Promise<{ ids: string[], total: number }> {
    const params = new URLSearchParams({
        db: 'pubmed',
        term,
        retmax: limit.toString(),
        retstart: offset.toString(),
        usehistory: 'y',
        email: NCBI_EMAIL,
        tool: TOOL_NAME,
        retmode: 'json'
    });

    if (NCBI_API_KEY) {
        params.append('api_key', NCBI_API_KEY);
    }

    const response = await fetchWithRetry(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?${params.toString()}`);
    const data = await response.json() as any;

    return {
        ids: data.esearchresult?.idlist || [],
        total: parseInt(data.esearchresult?.count || '0')
    };
}

async function fetchDetails(ids: string[]): Promise<string> {
    if (!ids.length) return '';

    const params = new URLSearchParams({
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'xml',
        email: NCBI_EMAIL,
        tool: TOOL_NAME
    });

    if (NCBI_API_KEY) {
        params.append('api_key', NCBI_API_KEY);
    }

    const response = await fetchWithRetry(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params.toString()}`);
    return await response.text();
}

function parseArticles(xmlContent: string): ArticleData[] {
    const $ = cheerio.load(xmlContent, { xmlMode: true });
    const articles: ArticleData[] = [];

    $('PubmedArticle').each((_, article) => {
        const pmid = $(article).find('PMID').first().text();
        const articleNode = $(article).find('MedlineCitation > Article');
        const title = articleNode.find('ArticleTitle').text() || 'No Title';
        const abstract = articleNode.find('Abstract > AbstractText').text() || '';

        const pubDateNode = articleNode.find('Journal > JournalIssue > PubDate');
        let pubDateYear = pubDateNode.find('Year').text();
        let pubDateMonth = pubDateNode.find('Month').text();
        let pubDateDay = pubDateNode.find('Day').text();

        if (!pubDateYear) {
            const medlineDate = pubDateNode.find('MedlineDate').text();
            const match = medlineDate.match(/\d{4}/);
            pubDateYear = match ? match[0] : '1900';
        }

        const monthMap: Record<string, string> = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };

        let month = '01';
        if (pubDateMonth) {
            month = /^\d+$/.test(pubDateMonth) ? pubDateMonth.padStart(2, '0') : (monthMap[pubDateMonth] || '01');
        }
        const day = pubDateDay ? pubDateDay.padStart(2, '0') : '01';
        const pubDate = `${pubDateYear}-${month}-${day}`;

        const journal = articleNode.find('Journal > Title').text() || 'Unknown Journal';

        const authorsList: string[] = [];
        const affiliationsList: string[] = [];
        articleNode.find('AuthorList > Author').each((_, el) => {
            const last = $(el).find('LastName').text();
            const initials = $(el).find('Initials').text();
            if (last) authorsList.push(`${last} ${initials}`);
            const aff = $(el).find('AffiliationInfo > Affiliation').text();
            if (aff && !affiliationsList.includes(aff)) affiliationsList.push(aff);
        });

        const fullText = `${title} ${abstract}`;
        const metadata = extractMetadata(fullText);

        articles.push({
            pmid,
            title,
            abstract,
            pubDate,
            journal,
            authors: authorsList.join(', '),
            affiliations: affiliationsList.join(' | '),
            mutations: metadata.mutations,
            topics: metadata.topics,
            treatments: metadata.treatments,
            diseaseSubtypes: metadata.diseaseSubtypes,
            hasComplexKaryotype: metadata.hasComplexKaryotype
        });
    });

    return articles;
}

async function saveArticleWithRetry(article: ArticleData, maxRetries: number = 3): Promise<number | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await saveArticleCore(article);
            return result;
        } catch (e: any) {
            const isRetryable = e.message?.includes('7500') || e.message?.includes('internal error');
            if (isRetryable && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
                console.log(`  ⚠️ PMID:${article.pmid} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay / 1000}s...`);
                await sleep(delay);
            } else {
                console.error(`Error saving PMID:${article.pmid}:`, e.message);
                return null;
            }
        }
    }
    return null;
}

async function saveArticleCore(article: ArticleData): Promise<number> {
    const processedAt = new Date().toISOString();

    // Insert study
    const result = await queryD1(`
        INSERT INTO studies (title, abstract, pub_date, journal, authors, affiliations, disease_subtype, has_complex_karyotype, transplant_context, source_id, source_type, extraction_method, processed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(source_id) DO UPDATE SET
            title=excluded.title,
            abstract=excluded.abstract,
            disease_subtype=excluded.disease_subtype,
            extraction_method=excluded.extraction_method,
            processed_at=excluded.processed_at
        RETURNING id
    `, [
        article.title,
        article.abstract,
        article.pubDate,
        article.journal,
        article.authors,
        article.affiliations,
        article.diseaseSubtypes.join(','),
        article.hasComplexKaryotype ? 1 : 0,
        0,
        `PMID:${article.pmid}`,
        'pubmed',
        'regex',  // Local backfill always uses regex
        processedAt
    ]);

    const studyId = result.results?.[0]?.id;
    if (!studyId) throw new Error('No study ID returned');

    // Clear and insert mutations
    await queryD1('DELETE FROM mutations WHERE study_id = ?', [studyId]);
    for (const mutation of article.mutations) {
        await queryD1('INSERT INTO mutations (study_id, gene_symbol) VALUES (?, ?)', [studyId, mutation]);
        await sleep(20);
    }

    // Clear and insert topics
    await queryD1('DELETE FROM study_topics WHERE study_id = ?', [studyId]);
    for (const topic of [...new Set(article.topics)]) {
        await queryD1('INSERT INTO study_topics (study_id, topic_name) VALUES (?, ?)', [studyId, topic]);
        await sleep(20);
    }

    // Clear and insert treatments
    await queryD1('DELETE FROM treatments WHERE study_id = ?', [studyId]);
    for (const treatmentCode of [...new Set(article.treatments)]) {
        const treatmentResult = await queryD1('SELECT id FROM ref_treatments WHERE code = ?', [treatmentCode]);
        if (treatmentResult.results?.[0]?.id) {
            await queryD1('INSERT INTO treatments (study_id, treatment_id) VALUES (?, ?)', [studyId, treatmentResult.results[0].id]);
        }
        await sleep(20);
    }

    // Insert link
    await queryD1('INSERT OR IGNORE INTO links (study_id, url, link_type) VALUES (?, ?, ?)',
        [studyId, `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`, 'pubmed']);

    return studyId;
}

// Wrapper for backward compatibility  
async function saveArticle(article: ArticleData): Promise<number | null> {
    return saveArticleWithRetry(article);
}


// ==========================================
// POST-INGEST STEPS (RAG + GPU per segment)
// ==========================================
async function runPostIngestSteps(options: BackfillOptions, progress: BackfillProgress, year: number, month?: number, dryRun: boolean = false) {
    const { execSync } = await import('child_process');
    const segmentLabel = month ? `${year}-${month.toString().padStart(2, '0')}` : `${year}`;

    // RAG DOCUMENT FETCH
    if (options.withRag && !dryRun) {
        console.log(`\n  [${segmentLabel}] Step 2/3: Running RAG document fetch...`);

        let fetchCmd = `npx tsx scripts/fetch-pmc-fulltext.ts --year ${year}`;
        if (month) {
            fetchCmd += ` --month ${month}`;
        }
        fetchCmd += ` --limit ${options.limit || 5000}`;

        try {
            execSync(fetchCmd, {
                cwd: path.join(__dirname, '..'),
                stdio: 'inherit'
            });
            progress.ragCompleted++;
            console.log(`  [${segmentLabel}] ✅ RAG document fetch complete!`);
        } catch (err: any) {
            console.error(`  [${segmentLabel}] ⚠️ RAG document fetch failed:`, err.message);
        }
    }

    // GPU VECTORIZATION
    if (options.withGpu && !dryRun) {
        console.log(`\n  [${segmentLabel}] Step 3/3: Running GPU vectorization...`);

        let gpuCmd = `python ../../rag-processing/backfill_gpu.py`;
        gpuCmd += ` --workers ${options.workers}`;
        gpuCmd += ` --resume`;
        gpuCmd += ` --limit 0`; // Unlimited processing
        if (options.includeErrors) {
            gpuCmd += ` --include-errors`;
        }

        try {
            execSync(gpuCmd, {
                cwd: path.join(__dirname, '..'),
                stdio: 'inherit'
            });
            progress.gpuCompleted++;
            console.log(`  [${segmentLabel}] ✅ GPU vectorization complete!`);
        } catch (err: any) {
            console.error(`  [${segmentLabel}] ⚠️ GPU vectorization failed:`, err.message);
        }
    }

    // Segment completion summary
    console.log(`\n  [${segmentLabel}] ✅ SEGMENT COMPLETE`);
}

// ==========================================
// LOCAL MODE EXECUTION
// ==========================================
async function backfillLocal(options: BackfillOptions, progress: BackfillProgress) {
    for (let year = options.startYear; year <= options.endYear; year++) {
        const startMonth = options.month || 1;
        const endMonth = options.month || (options.granular ? 12 : 1);

        for (let m = startMonth; m <= endMonth; m++) {
            const segmentLabel = options.granular || options.month
                ? `${year}-${m.toString().padStart(2, '0')}`
                : `${year}`;

            if (progress.completedSegmentLabels.has(segmentLabel)) {
                console.log(`  ⏩ Skipping [${segmentLabel}] (already completed)`);
                progress.completedSegments++;
                continue;
            }

            progress.currentSegment = segmentLabel;

            console.log(`\n[${segmentLabel}] Step 1/3: Starting article ingestion...`);

            const searchTerm = buildSearchTerm(year, options.granular || options.month ? m : undefined);

            try {
                // Get total count first
                await sleep(RATE_LIMIT_DELAY);
                const { total } = await searchPubmed(searchTerm, 0, 0);

                // Update coverage_metrics in D1
                if (options.local && (options.granular || options.month)) {
                    try {
                        const mStr = m.toString().padStart(2, '0');
                        await queryD1(
                            `INSERT INTO coverage_metrics (year, month, pubmed_total, last_updated)
                                VALUES (?, ?, ?, ?)
                                ON CONFLICT(year, month) DO UPDATE SET
                                pubmed_total = excluded.pubmed_total,
                                last_updated = excluded.last_updated`,
                            [year, m, total, new Date().toISOString()]
                        );
                        console.log(`  [Coverage] Updated metrics for ${year}-${mStr}: ${total}`);
                    } catch (coverageErr: any) {
                        console.warn(`  ⚠️ Failed to update coverage metrics: ${coverageErr.message}`);
                    }
                }

                const maxArticles = options.limit ? Math.min(total, options.limit) : total;

                console.log(`  Found ${total} articles, will ingest up to ${maxArticles}`);

                let currentOffset = options.offset;

                while (currentOffset < maxArticles) {
                    const batchSize = Math.min(options.batchSize, maxArticles - currentOffset);
                    await sleep(RATE_LIMIT_DELAY);
                    const { ids } = await searchPubmed(searchTerm, batchSize, currentOffset);

                    if (ids.length === 0) {
                        console.log('  No more articles found.');
                        break;
                    }

                    // Deduplicate: Check which PMIDs already exist in our database
                    let filteredIds = ids;
                    if (options.local) {
                        try {
                            const placeholders = ids.map(() => '?').join(',');
                            const existing = await queryD1(
                                `SELECT source_id FROM studies WHERE source_id IN (${placeholders})`,
                                ids.map(id => `PMID:${id}`)
                            );
                            const existingPmids = new Set((existing.results || []).map((r: any) => r.source_id.replace('PMID:', '')));
                            filteredIds = ids.filter(id => !existingPmids.has(id));

                            if (filteredIds.length < ids.length) {
                                console.log(`  Filtered out ${ids.length - filteredIds.length} already existing articles.`);
                            }
                        } catch (e: any) {
                            console.warn('  ⚠️ Failed to check existing articles, proceeding with all:', e.message);
                        }
                    }

                    if (filteredIds.length === 0) {
                        currentOffset += ids.length;
                        continue;
                    }

                    await sleep(RATE_LIMIT_DELAY);
                    const xml = await fetchDetails(filteredIds);
                    const articles = parseArticles(xml);

                    for (const article of articles) {
                        const studyId = await saveArticle(article);
                        if (studyId) {
                            progress.articlesIngested++;
                            if (article.mutations.length > 3) {
                                console.log(`    ✓ PMID:${article.pmid} - ${article.mutations.length} mutations`);
                            }
                        } else {
                            progress.articlesFailed++;
                            progress.failedPmids.push(article.pmid);
                        }
                        await sleep(50); // Rate limit D1 writes
                    }

                    currentOffset += ids.length;
                    const segmentProgress = Math.round((currentOffset / maxArticles) * 100);
                    console.log(`  [${segmentLabel}] ${segmentProgress}% complete (${currentOffset}/${maxArticles})`);
                }

            } catch (error: any) {
                console.error(`  [${segmentLabel}] ✗ Error: ${error.message}`);
                progress.failedSegments.push(`${segmentLabel}: ${error.message}`);
            }

            // Run RAG + GPU for this month before moving to next
            const monthForPostIngest = options.granular || options.month ? m : undefined;
            await runPostIngestSteps(options, progress, year, monthForPostIngest, options.dryRun);

            progress.completedSegmentLabels.add(segmentLabel);
            StateManager.save(options, progress);
            progress.completedSegments++;
        }

        // Print progress every year or at end
        if (year === options.endYear || (year - options.startYear + 1) % 5 === 0) {
            printProgress(progress);
        }
    }
}

// ==========================================
// WORKER MODE EXECUTION
// ==========================================
async function backfillWorker(options: BackfillOptions, progress: BackfillProgress) {
    for (let year = options.startYear; year <= options.endYear; year++) {
        const startMonth = options.month || 1;
        const endMonth = options.month || (options.granular ? 12 : 1);

        for (let m = startMonth; m <= endMonth; m++) {
            const segmentLabel = options.granular || options.month
                ? `${year}-${m.toString().padStart(2, '0')}`
                : `${year}`;

            if (progress.completedSegmentLabels.has(segmentLabel)) {
                console.log(`  ⏩ Skipping [${segmentLabel}] (already completed)`);
                progress.completedSegments++;
                continue;
            }

            progress.currentSegment = segmentLabel;

            console.log(`\n[${segmentLabel}] Starting Worker ingestion...`);

            let currentOffset = options.offset;
            let totalForSegment = Infinity;
            let stopLoop = false;

            while (!stopLoop && currentOffset < totalForSegment) {
                try {
                    const url = new URL(WORKER_URL);
                    url.searchParams.set('year', year.toString());
                    if (options.granular || options.month) url.searchParams.set('month', m.toString());
                    url.searchParams.set('limit', options.batchSize.toString());
                    url.searchParams.set('offset', currentOffset.toString());
                    if (options.useAI) url.searchParams.set('useAI', 'true');

                    if (options.dryRun) {
                        console.log(`  [DRY RUN] Would trigger: ${url.toString()}`);
                        stopLoop = true;
                    } else {
                        const response = await fetch(url.toString());
                        const text = await response.text();

                        if (!response.ok) throw new Error(`HTTP ${response.status}: ${text}`);

                        const totalMatch = text.match(/Found (\d+) total/);
                        const ingestedMatch = text.match(/Ingested (\d+)/);

                        if (totalMatch) {
                            totalForSegment = parseInt(totalMatch[1]);
                            if (options.limit && totalForSegment > options.limit) {
                                totalForSegment = options.limit;
                            }
                        }

                        const ingested = ingestedMatch ? parseInt(ingestedMatch[1]) : 0;
                        progress.articlesIngested += ingested;
                        console.log(`  [${segmentLabel}] ✓ Offset ${currentOffset}: Ingested ${ingested}`);

                        if (ingested === 0 || currentOffset + ingested >= totalForSegment) {
                            stopLoop = true;
                        } else {
                            currentOffset += ingested;
                            const delay = 2000;
                            console.log(`  Waiting ${delay}ms...`);
                            await sleep(delay);
                        }
                    }
                } catch (error: any) {
                    console.error(`  [${segmentLabel}] ✗ Failed at offset ${currentOffset}: ${error.message}`);
                    progress.failedSegments.push(`${segmentLabel} @ offset ${currentOffset}: ${error.message}`);
                    stopLoop = true;
                }
            }

            if (!stopLoop || currentOffset >= totalForSegment) {
                progress.completedSegmentLabels.add(segmentLabel);
                StateManager.save(options, progress);
            }
            progress.completedSegments++;
        }

        if (year === options.endYear || (year - options.startYear + 1) % 5 === 0) {
            printProgress(progress);
        }
    }
}

// ==========================================
// MAIN EXECUTION
// ==========================================
async function backfillProduction(options: BackfillOptions) {
    // Validation for local mode
    if (options.local) {
        if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !DATABASE_ID) {
            console.error('Error: Local mode requires CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and DATABASE_ID in .env');
            process.exit(1);
        }
    }

    if (options.useAI && options.batchSize > 5) {
        console.log(`💡 AI mode: Reducing batch size from ${options.batchSize} to 5`);
        options.batchSize = 5;
    }

    // Calculate total segments
    const years = options.endYear - options.startYear + 1;
    const monthsPerYear = options.granular ? 12 : 1;
    const totalSegments = options.month ? years : years * monthsPerYear;

    const progress: BackfillProgress = {
        totalSegments,
        completedSegments: 0,
        failedSegments: [],
        articlesIngested: 0,
        articlesFailed: 0,
        failedPmids: [],
        startTime: Date.now(),
        ragCompleted: 0,
        gpuCompleted: 0,
        completedSegmentLabels: new Set<string>()
    };

    // Load state
    const savedState = StateManager.load();
    if (savedState.completed?.length) {
        console.log(`  ℹ️ Resuming from saved state (${savedState.completed.length} segments already done)`);
        savedState.completed.forEach(s => progress.completedSegmentLabels.add(s));
    }

    console.log('='.repeat(60));
    console.log('LEUKEMIALENS PRODUCTION BACKFILL');
    console.log('='.repeat(60));
    console.log(`Mode:       ${options.local ? 'LOCAL (Direct D1 API)' : 'WORKER'}`);
    if (!options.local) console.log(`Worker URL: ${WORKER_URL}`);
    console.log(`Year Range: ${options.startYear} - ${options.endYear}`);
    if (options.month) console.log(`Month:      ${options.month}`);
    console.log(`Granularity: ${options.granular ? 'MONTHLY' : 'YEARLY'}`);
    console.log(`Batch Size: ${options.batchSize} articles`);
    if (options.offset > 0) console.log(`Start Offset: ${options.offset}`);
    if (options.limit) console.log(`Limit:      ${options.limit} articles per segment`);
    console.log(`RAG Fetch:  ${options.withRag ? 'YES' : 'NO'}`);
    console.log(`GPU Vector: ${options.withGpu ? 'YES' : 'NO'}`);
    if (options.withGpu) console.log(`Workers:    ${options.workers}`);
    console.log(`API Key:    ${NCBI_API_KEY ? 'YES (10 req/s)' : 'NO (3 req/s)'}`);
    console.log('='.repeat(60));

    if (!options.dryRun) {
        console.log('⚠️  Running in PRODUCTION mode. Press Ctrl+C to cancel...');
        console.log('Starting in 3 seconds...\n');
        await sleep(3000);
    }

    // Graceful shutdown handler
    process.on('SIGINT', () => {
        console.log('\n\n🛑 Interrupted! Saving state...');
        StateManager.save(options, progress);
        process.exit(0);
    });

    try {
        // Execute in appropriate mode
        if (options.local) {
            await backfillLocal(options, progress);
        } else {
            await backfillWorker(options, progress);
        }
    } catch (e: any) {
        console.error('\n❌ CRITICAL ERROR during backfill:', e.message);
        StateManager.save(options, progress);
    }

    console.log('\n' + '='.repeat(60));
    console.log('BACKFILL COMPLETE');
    printProgress(progress);

    if (progress.completedSegmentLabels.size > 0) {
        console.log('  Finished segments:', Array.from(progress.completedSegmentLabels).join(', '));
    }

    // Cleanup state if fully complete
    if (progress.completedSegments === progress.totalSegments && progress.failedSegments.length === 0) {
        StateManager.clear();
    }

    if (progress.failedSegments.length > 0) {
        console.log('\n⚠️  Failed Segments:');
        progress.failedSegments.forEach(failure => console.log(`  - ${failure}`));
    }

    // Write failed PMIDs to log file for later re-ingestion
    if (options.local && progress.failedPmids.length > 0) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logDir = path.join(__dirname, '../logs');
        const logFile = path.join(logDir, `failed-pmids-${timestamp}.txt`);

        // Ensure logs directory exists
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        // Write PMIDs, one per line
        fs.writeFileSync(logFile, progress.failedPmids.join('\n') + '\n');
        console.log(`\n📝 Failed PMIDs written to: ${logFile}`);
        console.log(`   Re-ingest with: npx tsx scripts/reingest-failed.ts ${progress.failedPmids.join(' ')}`);
    }

    // ============================================
    // RAG DOCUMENT FETCH (Optional - batch mode)
    // ============================================
    // Skip batch RAG if local mode with granular - already ran per-segment
    const ranPerSegment = options.local && (options.granular || options.month);
    if (options.withRag && !options.dryRun && !ranPerSegment) {
        console.log('\n' + '='.repeat(60));
        console.log('TRIGGERING RAG DOCUMENT FETCH (BATCH)');
        console.log('='.repeat(60));

        let fetchLimit = options.limit || Math.max(progress.articlesIngested, 1000);
        let fetchCmd = `npx tsx scripts/fetch-pmc-fulltext.ts --limit ${fetchLimit}`;

        // Pass date filters if we were running for a specific segment
        if (options.startYear === options.endYear) {
            fetchCmd += ` --year ${options.startYear}`;
            if (options.month) {
                fetchCmd += ` --month ${options.month}`;
            }
        }

        console.log(`Running: ${fetchCmd}`);

        const { execSync } = await import('child_process');
        try {
            execSync(fetchCmd, {
                cwd: path.join(__dirname, '..'),
                stdio: 'inherit'
            });
            console.log('\n✅ RAG document fetch complete!');
        } catch (err: any) {
            console.error('\n⚠️ RAG document fetch failed:', err.message);
        }
    }

    // ============================================
    // GPU BACKFILL (Optional - batch mode)
    // ============================================
    // Skip batch GPU if local mode with granular - already ran per-segment
    if (options.withGpu && !options.dryRun && !ranPerSegment) {
        console.log('\n' + '='.repeat(60));
        console.log('TRIGGERING GPU VECTORIZATION (BATCH)');
        console.log('='.repeat(60));

        let gpuCmd = `python ../../rag-processing/backfill_gpu.py`;

        gpuCmd += ` --workers ${options.workers}`;
        gpuCmd += ` --resume`;
        gpuCmd += ` --limit 0`; // Unlimited processing
        if (options.includeErrors) {
            gpuCmd += ` --include-errors`;
        }

        console.log(`Running: ${gpuCmd}`);

        const { execSync } = await import('child_process');
        try {
            execSync(gpuCmd, {
                cwd: path.join(__dirname, '..'),
                stdio: 'inherit'
            });
            console.log('\n✅ GPU vectorization complete!');
        } catch (err: any) {
            console.error('\n⚠️ GPU vectorization failed:', err.message);
        }
    }
}

// ==========================================
// CLI ARGUMENT PARSING
// ==========================================
const args = process.argv.slice(2);
const options: BackfillOptions = {
    startYear: 0,
    endYear: 0,
    batchSize: 100,
    offset: 0,
    dryRun: false,
    granular: false,
    useAI: false,
    local: false,
    withRag: false,
    withGpu: false,
    workers: 4,
    includeErrors: false
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--start-year' && args[i + 1]) options.startYear = parseInt(args[i + 1]);
    if (args[i] === '--end-year' && args[i + 1]) options.endYear = parseInt(args[i + 1]);
    if (args[i] === '--batch-size' && args[i + 1]) options.batchSize = parseInt(args[i + 1]);
    if (args[i] === '--offset' && args[i + 1]) options.offset = parseInt(args[i + 1]);
    if (args[i] === '--month' && args[i + 1]) options.month = parseInt(args[i + 1]);
    if (args[i] === '--limit' && args[i + 1]) options.limit = parseInt(args[i + 1]);
    if (args[i] === '--dry-run') options.dryRun = true;
    if (args[i] === '--granular') options.granular = true;
    if (args[i] === '--use-ai') options.useAI = true;
    if (args[i] === '--local') options.local = true;
    if (args[i] === '--with-rag') options.withRag = true;
    if (args[i] === '--gpu') options.withGpu = true;
    if (args[i] === '--workers' && args[i + 1]) options.workers = parseInt(args[i + 1]);
    if (args[i] === '--include-errors') options.includeErrors = true;
}

// Handle defaults
if (options.startYear === 0) options.startYear = 2000;
if (options.endYear === 0) options.endYear = (options.startYear > 2022 || options.startYear === 0) ? options.startYear : 2022;
if (options.endYear === 0) options.endYear = options.startYear;

// Validation
if (options.startYear > options.endYear) {
    console.error('Error: start-year must be <= end-year');
    process.exit(1);
}

if (options.batchSize < 0 || options.batchSize > 1000) {
    console.error('Error: batch-size must be between 0-1000');
    process.exit(1);
}

backfillProduction(options).catch(err => {
    console.error('Backfill execution failed:', err);
    process.exit(1);
});
