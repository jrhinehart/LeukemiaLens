/**
 * PMC Full-Text Fetch Script
 * 
 * Fetches full-text PDFs and XML from PMC Open Access for articles in the database.
 * Downloads files from PMC FTP and uploads to R2 via API.
 * 
 * Usage:
 *   cd workers/ingest
 *   npx tsx scripts/fetch-pmc-fulltext.ts [options]
 * 
 * Options:
 *   --limit N        Maximum number of articles to process (default: 100)
 *   --year YYYY      Filter by publication year
 *   --month M        Filter by publication month (1-12, requires --year)
 *   --dry-run        Check availability without downloading
 *   --from-date      Only process articles from this date (YYYY-MM-DD)
 * 
 * Environment variables (in .env):
 *   CLOUDFLARE_ACCOUNT_ID
 *   CLOUDFLARE_API_TOKEN  
 *   DATABASE_ID
 *   API_BASE_URL (optional, defaults to production)
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

// Config
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;
const API_BASE_URL = process.env.API_BASE_URL || 'https://leukemialens-api.jr-rhinehart.workers.dev';
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'jr.rhinehart@gmail.com';
const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const TOOL_NAME = 'LeukemiaLens';

// Rate limiting
const RATE_LIMIT_DELAY = NCBI_API_KEY ? 100 : 350; // ms between requests

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !DATABASE_ID) {
    console.error('Missing environment variables. Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, DATABASE_ID');
    process.exit(1);
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

interface Options {
    limit: number;
    year?: number;
    month?: number;
    dryRun: boolean;
    fromDate?: string;
}

function parseArgs(): Options {
    const args = process.argv.slice(2);
    const options: Options = {
        limit: 100,
        dryRun: false
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--limit' && args[i + 1]) {
            options.limit = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--year' && args[i + 1]) {
            options.year = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--month' && args[i + 1]) {
            options.month = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--dry-run') {
            options.dryRun = true;
        } else if (args[i] === '--from-date' && args[i + 1]) {
            options.fromDate = args[i + 1];
            i++;
        }
    }

    return options;
}

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
    if (!data.success) {
        throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
    }
    return data.result[0];
}

interface StudyRecord {
    id: number;
    source_id: string;
    title: string;
    pub_date: string;
}

interface PMCConversionResult {
    pmid: string;
    pmcid: string | null;
    doi?: string;
    error?: string;
}

interface PMCOARecord {
    pmcid: string;
    citation: string;
    license: string;
    retracted: boolean;
    links: {
        format: 'pdf' | 'tgz';
        href: string;
        updated: string;
    }[];
}

interface PMCOACheckResult {
    available: boolean;
    pmcid?: string;
    record?: PMCOARecord;
    error?: string;
}

// Batch convert PMIDs to PMCIDs using NCBI ID Converter API
// API supports up to 200 IDs per request
async function batchConvertPmidsToPmcids(pmids: string[]): Promise<Map<string, PMCConversionResult>> {
    const results = new Map<string, PMCConversionResult>();

    // Process in chunks of 200 (API limit)
    const chunkSize = 200;
    for (let i = 0; i < pmids.length; i += chunkSize) {
        const chunk = pmids.slice(i, i + chunkSize);

        try {
            // Build URL with NCBI credentials
            let url = `https://pmc.ncbi.nlm.nih.gov/tools/idconv/api/v1/articles/?ids=${chunk.join(',')}&format=json&email=${encodeURIComponent(NCBI_EMAIL)}&tool=${TOOL_NAME}`;
            if (NCBI_API_KEY) {
                url += `&api_key=${NCBI_API_KEY}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                // Mark all as failed
                chunk.forEach(pmid => results.set(pmid, { pmid, pmcid: null, error: 'API error' }));
                continue;
            }

            const responseText = await response.text();

            // API returns concatenated JSON objects: {status}{record1}{record2}
            // Split on }{ and reconstruct valid JSON objects
            const jsonObjects = responseText.split('}{').map((part, index, arr) => {
                if (arr.length === 1) return part; // Only one object, already complete
                if (index === 0) return part + '}';  // First object
                if (index === arr.length - 1) return '{' + part;  // Last object
                return '{' + part + '}';  // Middle objects
            });
            for (const jsonStr of jsonObjects) {
                try {
                    const data = JSON.parse(jsonStr);

                    // If it's the status object, it might have a 'records' array
                    if (data.records && Array.isArray(data.records)) {
                        for (const record of data.records) {
                            const pmid = record['requested-id']?.toString() || record.pmid?.toString();
                            if (!pmid) continue;

                            if (record.errmsg) {
                                results.set(pmid, { pmid, pmcid: null, error: record.errmsg });
                            } else if (record.pmcid) {
                                results.set(pmid, { pmid, pmcid: record.pmcid, doi: record.doi });
                            }
                        }
                    }

                    // Also handle individual record objects (if concatenated)
                    const pmid = data['requested-id']?.toString() || data.pmid?.toString();
                    if (pmid && data.status !== 'ok') {
                        if (data.errmsg) {
                            results.set(pmid, { pmid, pmcid: null, error: data.errmsg });
                        } else if (data.pmcid) {
                            results.set(pmid, { pmid, pmcid: data.pmcid, doi: data.doi });
                        }
                    }
                } catch { /* skip unparseable objects */ }
            }

            // Small delay between chunks to respect rate limits
            if (i + chunkSize < pmids.length) {
                await delay(RATE_LIMIT_DELAY);
            }
        } catch (e: any) {
            chunk.forEach(pmid => results.set(pmid, { pmid, pmcid: null, error: e.message }));
        }
    }

    return results;
}

// Check PMC OA availability
async function checkPmcOA(pmcid: string): Promise<PMCOACheckResult> {
    try {
        const response = await fetch(
            `https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.fcgi?id=${pmcid}`
        );

        if (!response.ok) {
            return { available: false, error: `API returned ${response.status}` };
        }

        const xmlText = await response.text();

        // Check for error
        if (xmlText.includes('<error')) {
            const errorMatch = xmlText.match(/<error[^>]*>([^<]*)<\/error>/);
            return {
                available: false,
                pmcid,
                error: errorMatch?.[1] || 'Not in Open Access'
            };
        }

        // Parse record
        const recordMatch = xmlText.match(
            /<record[^>]*id="([^"]+)"[^>]*citation="([^"]+)"[^>]*license="([^"]+)"[^>]*retracted="([^"]+)"[^>]*>/
        );

        if (!recordMatch) {
            return { available: false, pmcid, error: 'Could not parse response' };
        }

        // Extract links
        const links: PMCOARecord['links'] = [];
        const linkRegex = /<link[^>]*format="([^"]+)"[^>]*updated="([^"]+)"[^>]*href="([^"]+)"[^>]*\/>/g;
        let linkMatch;
        while ((linkMatch = linkRegex.exec(xmlText)) !== null) {
            links.push({
                format: linkMatch[1] as 'pdf' | 'tgz',
                updated: linkMatch[2],
                href: linkMatch[3]
            });
        }

        return {
            available: true,
            pmcid,
            record: {
                pmcid: recordMatch[1],
                citation: recordMatch[2],
                license: recordMatch[3],
                retracted: recordMatch[4] === 'yes',
                links
            }
        };
    } catch (e: any) {
        return { available: false, pmcid, error: e.message };
    }
}

// Download file from FTP URL (converted to HTTPS)
async function downloadFile(ftpUrl: string, destPath: string): Promise<boolean> {
    try {
        // Convert FTP URL to HTTPS
        // ftp://ftp.ncbi.nlm.nih.gov/pub/pmc/... -> https://ftp.ncbi.nlm.nih.gov/pub/pmc/...
        const httpsUrl = ftpUrl.replace('ftp://', 'https://');

        const response = await fetch(httpsUrl);
        if (!response.ok || !response.body) {
            console.error(`  Download failed: ${response.status}`);
            return false;
        }

        // Ensure directory exists
        const dir = path.dirname(destPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Stream to file
        const fileStream = fs.createWriteStream(destPath);
        await pipeline(Readable.fromWeb(response.body as any), fileStream);

        return true;
    } catch (e: any) {
        console.error(`  Download error: ${e.message}`);
        return false;
    }
}

// Upload document to API
async function uploadDocument(
    filePath: string,
    pmcid: string,
    pmid: string,
    studyId: number,
    format: 'pdf' | 'xml',
    license: string
): Promise<boolean> {
    try {
        const fileContent = fs.readFileSync(filePath);
        const fileSizeMB = fileContent.length / (1024 * 1024);

        if (fileSizeMB > 95) {
            console.error(`  Skipping upload: file too large for Worker limits (${fileSizeMB.toFixed(2)} MB)`);
            return false;
        }

        const filename = path.basename(filePath);

        const formData = new FormData();
        const blob = new Blob([fileContent]);

        formData.append('file', blob, filename);
        formData.append('metadata', JSON.stringify({
            pmcid,
            pmid,
            studyId,
            filename,
            source: 'pmc_oa',
            format,
            license
        }));

        const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`  Upload failed (${response.status}): ${errorText.substring(0, 100)}`);
            return false;
        }

        const result = await response.json() as any;
        return result.success === true;
    } catch (e: any) {
        console.error(`  Upload error: ${e.message}`);
        return false;
    }
}

// Record a skipped article in the database to avoid redundant checks
async function recordSkip(
    pmid: string | null,
    pmcid: string | null,
    studyId: number,
    reason: string
): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pmcid,
                pmid,
                studyId,
                filename: 'skipped.txt',
                source: 'pmc_oa',
                format: 'txt',
                license: 'none',
                status: 'skipped'
            })
        });

        if (!response.ok) {
            console.error(`  Failed to record skip for ${pmid || pmcid}: ${response.status}`);
            return false;
        }

        return true;
    } catch (e: any) {
        console.error(`  Error recording skip: ${e.message}`);
        return false;
    }
}

async function main() {
    const options = parseArgs();

    console.log('='.repeat(60));
    console.log('PMC FULL-TEXT FETCH');
    console.log('='.repeat(60));
    console.log(`Limit: ${options.limit}`);
    if (options.year) {
        console.log(`Year: ${options.year}${options.month ? '-' + options.month.toString().padStart(2, '0') : ''}`);
    }
    console.log(`Dry run: ${options.dryRun}`);
    if (options.fromDate) {
        console.log(`From date: ${options.fromDate}`);
    }
    console.log('');

    // Get studies that don't have documents yet
    // Improved query to exclude both study_id matches AND matches on PMID/PMCID in the documents table
    let query = `
        SELECT s.id, s.source_id, s.title, s.pub_date 
        FROM studies s
        WHERE s.source_id LIKE 'PMID:%'
        AND NOT EXISTS (SELECT 1 FROM documents d WHERE d.study_id = s.id)
        AND NOT EXISTS (SELECT 1 FROM documents d WHERE d.pmid = REPLACE(s.source_id, 'PMID:', ''))
        AND NOT EXISTS (SELECT 1 FROM documents d WHERE d.pmcid = s.source_id)
    `;
    const params: any[] = [];

    // Year/month filtering
    if (options.year) {
        if (options.month) {
            const monthStr = options.month.toString().padStart(2, '0');
            const lastDay = new Date(options.year, options.month, 0).getDate();
            query += ` AND s.pub_date >= ? AND s.pub_date <= ?`;
            params.push(`${options.year}-${monthStr}-01`);
            params.push(`${options.year}-${monthStr}-${lastDay}`);
        } else {
            query += ` AND s.pub_date >= ? AND s.pub_date <= ?`;
            params.push(`${options.year}-01-01`);
            params.push(`${options.year}-12-31`);
        }
    } else if (options.fromDate) {
        query += ` AND s.pub_date >= ?`;
        params.push(options.fromDate);
    }

    query += ` ORDER BY s.pub_date DESC LIMIT ?`;
    params.push(options.limit);

    console.log('Fetching studies without documents...');
    const studiesResult = await queryD1(query, params);
    const studies: StudyRecord[] = studiesResult.results || [];

    console.log(`Found ${studies.length} studies to process\n`);

    // Stats
    let processed = 0;
    let withPmcid = 0;
    let inOpenAccess = 0;
    let hasPdf = 0;
    let hasXml = 0;
    let downloaded = 0;
    let uploaded = 0;

    // Temp directory for downloads
    const tempDir = path.join(process.cwd(), 'temp_downloads');
    if (!options.dryRun && !fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Step 1: Batch convert all PMIDs to PMCIDs (single API call per 200)
    console.log('Converting PMIDs to PMCIDs (batch)...');
    const pmids = studies.map(s => s.source_id.replace('PMID:', '').trim());
    const pmcidMap = await batchConvertPmidsToPmcids(pmids);

    for (const study of studies) {
        processed++;
        const pmid = study.source_id.replace('PMID:', '').trim();
        const conversion = pmcidMap.get(pmid);

        console.log(`\n[${processed}/${studies.length}] PMID:${pmid}`);
        console.log(`  Title: ${study.title.substring(0, 60)}...`);

        if (!conversion || !conversion.pmcid) {
            console.log(`  ❌ No PMCID found: ${conversion?.error || 'No PMCID found'}`);
            if (!options.dryRun) {
                await recordSkip(pmid, null, study.id, conversion?.error || 'No PMCID found');
            }
            continue;
        }

        withPmcid++;
        console.log(`  ✓ PMCID: ${conversion.pmcid}`);

        // Step 2: Check PMC Open Access
        await delay(RATE_LIMIT_DELAY);
        const oaCheck = await checkPmcOA(conversion.pmcid!);

        if (!oaCheck.available || !oaCheck.record) {
            console.log(`  ❌ Not in Open Access: ${oaCheck.error}`);
            if (!options.dryRun) {
                await recordSkip(pmid, conversion.pmcid!, study.id, oaCheck.error || 'Not in Open Access');
            }
            continue;
        }

        inOpenAccess++;
        console.log(`  ✓ Open Access: ${oaCheck.record.license}`);

        // Check available formats
        const pdfLink = oaCheck.record.links.find(l => l.format === 'pdf');
        const tgzLink = oaCheck.record.links.find(l => l.format === 'tgz');

        if (pdfLink) hasPdf++;
        if (tgzLink) hasXml++;

        console.log(`  Available: ${pdfLink ? 'PDF ' : ''}${tgzLink ? 'XML(tgz)' : ''}`);

        if (options.dryRun) {
            continue;
        }

        // Step 3: Download - prefer PDF, fallback to XML
        let downloadLink = pdfLink || tgzLink;
        let actualFormat: 'pdf' | 'xml' = pdfLink ? 'pdf' : 'xml';

        if (!downloadLink) {
            console.log(`  ❌ No download link available`);
            await recordSkip(pmid, conversion.pmcid!, study.id, 'No download links available');
            continue;
        }

        const ext = actualFormat === 'pdf' ? 'pdf' : 'tar.gz';
        const tempFile = path.join(tempDir, `${conversion.pmcid}.${ext}`);

        console.log(`  Downloading ${actualFormat}...`);
        const downloadSuccess = await downloadFile(downloadLink.href, tempFile);

        if (!downloadSuccess) {
            continue;
        }

        downloaded++;
        const fileSize = fs.statSync(tempFile).size;
        console.log(`  ✓ Downloaded: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

        // Step 4: Upload to API
        console.log(`  Uploading to R2...`);
        const uploadSuccess = await uploadDocument(
            tempFile,
            conversion.pmcid!,
            pmid,
            study.id,
            actualFormat,
            oaCheck.record.license
        );

        if (uploadSuccess) {
            uploaded++;
            console.log(`  ✓ Uploaded successfully`);
        } else {
            console.log(`  ❌ Upload failed`);
            // Record as skipped so we don't keep trying to upload oversized/problematic files
            await recordSkip(pmid, conversion.pmcid!, study.id, 'Upload failed (oversized or server error)');
        }

        // Clean up temp file
        try {
            fs.unlinkSync(tempFile);
        } catch { }
    }

    // Clean up temp directory
    if (!options.dryRun && fs.existsSync(tempDir)) {
        try {
            fs.rmdirSync(tempDir);
        } catch { }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Studies processed: ${studies.length}`);
    console.log(`With PMCID: ${withPmcid} (${Math.round(withPmcid / studies.length * 100)}%)`);
    console.log(`In Open Access: ${inOpenAccess} (${Math.round(inOpenAccess / studies.length * 100)}%)`);
    console.log(`Has PDF: ${hasPdf}`);
    console.log(`Has XML: ${hasXml}`);
    if (!options.dryRun) {
        console.log(`Downloaded: ${downloaded}`);
        console.log(`Uploaded: ${uploaded}`);
    }
}

main().catch(err => {
    console.error('Fetch failed:', err);
    process.exit(1);
});
