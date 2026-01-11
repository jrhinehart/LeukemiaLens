/**
 * Compare Regex vs AI Parsing
 * 
 * Fetches an article and compares metadata extracted via regex patterns
 * versus the AI-powered extraction from the deployed Worker.
 * 
 * Usage:
 *   npx tsx scripts/compare-parsing.ts --pmid 39711880
 *   npx tsx scripts/compare-parsing.ts --pmid 38204493 --useAI
 */

import 'dotenv/config';
import * as cheerio from 'cheerio';
import { extractMetadata } from '../src/parsers';

const NCBI_API_KEY = process.env.NCBI_API_KEY || '';
const NCBI_EMAIL = process.env.NCBI_EMAIL || 'jr.rhinehart@gmail.com';
const WORKER_URL = process.env.WORKER_URL || 'https://leukemialens-ingest.jr-rhinehart.workers.dev';
const API_URL = 'https://leukemialens-api.jr-rhinehart.workers.dev';

interface Article {
    title: string;
    abstract: string;
}

interface ExtractionResult {
    mutations: string[];
    diseaseSubtypes: string[];
    topics: string[];
    treatments: string[];
}

async function fetchArticle(pmid: string): Promise<Article> {
    const params = new URLSearchParams({
        db: 'pubmed',
        id: pmid,
        retmode: 'xml',
        email: NCBI_EMAIL,
        tool: 'LeukemiaLens-Compare'
    });

    if (NCBI_API_KEY) {
        params.append('api_key', NCBI_API_KEY);
    }

    const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params.toString()}`);
    const xmlContent = await response.text();

    const $ = cheerio.load(xmlContent, { xmlMode: true });
    const articleNode = $('MedlineCitation > Article');
    const title = articleNode.find('ArticleTitle').text() || 'No Title';
    const abstract = articleNode.find('Abstract > AbstractText').text() || '';

    return { title, abstract };
}

async function fetchFromDatabase(pmid: string): Promise<ExtractionResult | null> {
    try {
        const response = await fetch(`${API_URL}/api/search?q=PMID:${pmid}&limit=1`);
        const data = await response.json() as any[];

        if (data && data.length > 0) {
            const article = data[0];
            return {
                mutations: article.mutations || [],
                diseaseSubtypes: article.disease_subtype ? article.disease_subtype.split(',').filter(Boolean) : [],
                topics: [], // Topics aren't returned in search currently
                treatments: (article.treatments || []).map((t: any) => t.code || t.name)
            };
        }
    } catch (e) {
        console.log('  (Article not in database yet)');
    }
    return null;
}

async function triggerAIIngestion(pmid: string): Promise<boolean> {
    console.log(`\nTriggering AI ingestion for PMID:${pmid}...`);

    // Build a search term for the specific PMID
    const searchTerm = `${pmid}[PMID]`;
    const url = `${WORKER_URL}?term=${encodeURIComponent(searchTerm)}&limit=1&useAI=true`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        console.log(`Worker response: ${text}`);
        return response.ok;
    } catch (e: any) {
        console.error(`Failed to trigger AI ingestion: ${e.message}`);
        return false;
    }
}

function printResults(label: string, result: ExtractionResult) {
    console.log(`\n--- ${label} ---`);
    console.log(`Mutations:  ${result.mutations.length > 0 ? result.mutations.join(', ') : '(none)'}`);
    console.log(`Diseases:   ${result.diseaseSubtypes.length > 0 ? result.diseaseSubtypes.join(', ') : '(none)'}`);
    console.log(`Topics:     ${result.topics.length > 0 ? result.topics.join(', ') : '(none)'}`);
    console.log(`Treatments: ${result.treatments.length > 0 ? result.treatments.join(', ') : '(none)'}`);
}

function printComparison(label: string, regex: string[], ai: string[]) {
    const regexSet = new Set(regex.map(s => s.toUpperCase()));
    const aiSet = new Set(ai.map(s => s.toUpperCase()));

    const onlyRegex = regex.filter(x => !aiSet.has(x.toUpperCase()));
    const onlyAI = ai.filter(x => !regexSet.has(x.toUpperCase()));
    const both = regex.filter(x => aiSet.has(x.toUpperCase()));

    console.log(`\n${label}:`);
    if (both.length > 0) console.log(`  Both found:    ${both.join(', ')}`);
    if (onlyRegex.length > 0) console.log(`  Regex only:    ${onlyRegex.join(', ')}`);
    if (onlyAI.length > 0) console.log(`  AI only:       ${onlyAI.join(', ')}`);
    if (both.length === 0 && onlyRegex.length === 0 && onlyAI.length === 0) {
        console.log(`  (no entities found)`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    let pmid = '39711880';
    let useAI = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--pmid' && args[i + 1]) {
            pmid = args[i + 1];
        }
        if (args[i] === '--useAI' || args[i] === '--use-ai') {
            useAI = true;
        }
    }

    console.log('======================================================================');
    console.log('PARSING COMPARISON: Regex vs AI');
    console.log('======================================================================');
    console.log(`PMID: ${pmid}`);
    console.log(`Mode: ${useAI ? 'Regex + AI (via Worker)' : 'Regex only'}`);

    // Fetch article from PubMed
    console.log('\nFetching article from PubMed...');
    const { title, abstract } = await fetchArticle(pmid);
    const fullText = `${title} ${abstract}`;

    console.log(`\nTitle: ${title.substring(0, 80)}${title.length > 80 ? '...' : ''}`);
    console.log(`Abstract: ${abstract.length} characters`);

    // Regex extraction (local)
    const regexResult = extractMetadata(fullText);
    printResults('REGEX EXTRACTION (local)', regexResult);

    if (useAI) {
        // First check if article is already in database
        console.log('\nChecking database for existing AI extraction...');
        let dbResult = await fetchFromDatabase(pmid);

        if (!dbResult) {
            // Trigger AI ingestion via Worker
            const success = await triggerAIIngestion(pmid);
            if (success) {
                // Wait a moment for processing
                console.log('Waiting for ingestion to complete...');
                await new Promise(r => setTimeout(r, 3000));
                dbResult = await fetchFromDatabase(pmid);
            }
        }

        if (dbResult) {
            printResults('AI EXTRACTION (from database)', dbResult);

            // Comparison
            console.log('\n======================================================================');
            console.log('COMPARISON: What each method found');
            console.log('======================================================================');

            printComparison('Mutations', regexResult.mutations, dbResult.mutations);
            printComparison('Diseases', regexResult.diseaseSubtypes, dbResult.diseaseSubtypes);
            printComparison('Treatments', regexResult.treatments, dbResult.treatments);

            // Summary
            const regexTotal = regexResult.mutations.length + regexResult.diseaseSubtypes.length + regexResult.treatments.length;
            const aiTotal = dbResult.mutations.length + dbResult.diseaseSubtypes.length + dbResult.treatments.length;

            console.log('\n======================================================================');
            console.log('SUMMARY');
            console.log('======================================================================');
            console.log(`Regex found:  ${regexTotal} entities`);
            console.log(`AI found:     ${aiTotal} entities`);
            console.log(`Difference:   ${aiTotal - regexTotal >= 0 ? '+' : ''}${aiTotal - regexTotal}`);
        } else {
            console.log('\nCould not retrieve AI extraction results from database.');
            console.log('The article may not have been ingested yet, or the Worker may have timed out.');
        }
    } else {
        console.log('\n(Run with --useAI to compare with AI extraction via Worker)');
    }
}

main().catch(err => {
    console.error('Comparison failed:', err);
    process.exit(1);
});
