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
 *   --limit N        Maximum number of articles to process (default: 10)
 *   --format pdf|xml Preferred format (default: pdf, falls back to xml if not available)
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

// Rate limiting
const RATE_LIMIT_DELAY = 500; // ms between requests to avoid overwhelming PMC

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !DATABASE_ID) {
    console.error('Missing environment variables. Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, DATABASE_ID');
    process.exit(1);
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

interface Options {
    limit: number;
    format: 'pdf' | 'xml';
    dryRun: boolean;
    fromDate?: string;
}

function parseArgs(): Options {
    const args = process.argv.slice(2);
    const options: Options = {
        limit: 10,
        format: 'pdf',
        dryRun: false
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--limit' && args[i + 1]) {
            options.limit = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--format' && args[i + 1]) {
            options.format = args[i + 1] as 'pdf' | 'xml';
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

// Convert PMID to PMCID using local API or direct NCBI call
async function convertPmidToPmcid(pmid: string): Promise<PMCConversionResult> {
    try {
        // Use NCBI ID Converter API directly
        const response = await fetch(
            `https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?ids=${pmid}&format=json`
        );

        if (!response.ok) {
            return { pmid, pmcid: null, error: 'Conversion API error' };
        }

        const data = await response.json() as any;
        const record = data.records?.[0];

        if (!record || record.status === 'error') {
            return {
                pmid,
                pmcid: null,
                error: record?.errmsg || 'No PMC ID found'
            };
        }

        return {
            pmid: record.pmid,
            pmcid: record.pmcid || null,
            doi: record.doi
        };
    } catch (e: any) {
        return { pmid, pmcid: null, error: e.message };
    }
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
        const base64Content = fileContent.toString('base64');
        const filename = path.basename(filePath);

        const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                pmcid,
                pmid,
                studyId,
                filename,
                source: 'pmc_oa',
                format,
                license,
                content: base64Content
            })
        });

        const result = await response.json() as any;
        return result.success === true;
    } catch (e: any) {
        console.error(`  Upload error: ${e.message}`);
        return false;
    }
}

async function main() {
    const options = parseArgs();

    console.log('='.repeat(60));
    console.log('PMC FULL-TEXT FETCH');
    console.log('='.repeat(60));
    console.log(`Limit: ${options.limit}`);
    console.log(`Preferred format: ${options.format}`);
    console.log(`Dry run: ${options.dryRun}`);
    if (options.fromDate) {
        console.log(`From date: ${options.fromDate}`);
    }
    console.log('');

    // Get studies that don't have documents yet
    let query = `
        SELECT s.id, s.source_id, s.title, s.pub_date 
        FROM studies s
        LEFT JOIN documents d ON d.study_id = s.id
        WHERE d.id IS NULL
        AND s.source_id LIKE 'PMID:%'
    `;
    const params: any[] = [];

    if (options.fromDate) {
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

    for (const study of studies) {
        processed++;
        const pmid = study.source_id.replace('PMID:', '');
        console.log(`\n[${processed}/${studies.length}] PMID:${pmid}`);
        console.log(`  Title: ${study.title.substring(0, 60)}...`);

        // Step 1: Convert PMID to PMCID
        await delay(RATE_LIMIT_DELAY);
        const conversion = await convertPmidToPmcid(pmid);

        if (!conversion.pmcid) {
            console.log(`  ❌ No PMCID found`);
            continue;
        }

        withPmcid++;
        console.log(`  ✓ PMCID: ${conversion.pmcid}`);

        // Step 2: Check PMC Open Access
        await delay(RATE_LIMIT_DELAY);
        const oaCheck = await checkPmcOA(conversion.pmcid);

        if (!oaCheck.available || !oaCheck.record) {
            console.log(`  ❌ Not in Open Access: ${oaCheck.error}`);
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

        // Step 3: Download preferred format
        let downloadLink = options.format === 'pdf' ? pdfLink : tgzLink;
        let actualFormat: 'pdf' | 'xml' = options.format;

        // Fallback if preferred not available
        if (!downloadLink) {
            downloadLink = pdfLink || tgzLink;
            actualFormat = pdfLink ? 'pdf' : 'xml';
        }

        if (!downloadLink) {
            console.log(`  ❌ No download link available`);
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
            conversion.pmcid,
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
    console.log(`Studies processed: ${processed}`);
    console.log(`With PMCID: ${withPmcid} (${Math.round(withPmcid / processed * 100)}%)`);
    console.log(`In Open Access: ${inOpenAccess} (${Math.round(inOpenAccess / processed * 100)}%)`);
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
