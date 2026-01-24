---
description: PubMed data ingestion and backfill pipeline
domain: workers/ingest/*, scripts/*
owner: Data Ingestion Agent
---

# Data Ingestion Pipeline

## Scope & Ownership

This agent owns the **data ingestion system** that populates the database from PubMed. Primary files:

- `workers/ingest/src/index.ts` - Scheduled Worker for automated ingestion
- `workers/ingest/src/parsers.ts` - Mutation, disease, treatment extraction
- `scripts/backfill-production.ts` - Historical data backfill
- `scripts/batch-ingest.ts` - Batch processing utilities
- `scripts/local-ingest.ts` - Local development ingestion

## Architecture

```
PubMed E-utilities API
        │
        ▼
┌───────────────────────┐
│  Ingest Worker        │
│  (CRON scheduled)     │
│                       │
│  1. Fetch articles    │
│  2. Parse metadata    │
│  3. Extract tags      │
│  4. Write to D1       │
└───────────────────────┘
        │
        ▼
    D1 Database
```

## Extraction Patterns

### Mutations (65+ genes)
Regex patterns match gene symbols in title/abstract:
- Standalone: `\bNPM1\b`, `\bFLT3\b`
- With context: `FLT3-ITD`, `NPM1 mutation`
- Fusions: `BCR-ABL1`, `PML-RARA`

Categories:
- **Favorable**: NPM1 (without FLT3-ITD), CEBPA biallelic
- **Intermediate**: FLT3-ITD, DNMT3A, NPM1 with FLT3
- **Adverse**: TP53, RUNX1, ASXL1, complex karyotype

### Diseases
Pattern matching for disease abbreviations and full names:
- AML, ALL, CML, CLL, MDS, MPN, MM, DLBCL

### Study Topics
Keyword matching for research areas:
- CAR-T, Cell Therapy, Immunotherapy
- Clinical Trials, Data Science/AI

### Treatments
Match drug names and protocol abbreviations:
- 7+3, FLAG-IDA, VEN-AZA
- Venetoclax, Azacitidine, Midostaurin

## NCBI Best Practices

> [!IMPORTANT]
> Follow NCBI guidelines to avoid IP blocks:
> - Use NCBI API key (10 req/sec vs 3 req/sec)
> - Run large backfills during off-peak hours (9PM-5AM ET)
> - Identify as "LeukemiaLens" in tool parameter
> - Chunk requests (100-500 per batch)

## Scripts

### Production Backfill (Recommended)
```bash
# Local mode - no Worker timeout limits
npx tsx scripts/backfill-production.ts \
    --local \
    --start-year 2024 \
    --end-year 2024 \
    --batch-size 100

# Specific month
npx tsx scripts/backfill-production.ts \
    --local \
    --start-year 2025 \
    --end-year 2025 \
    --month 2

# Resume from offset
npx tsx scripts/backfill-production.ts \
    --local \
    --offset 500 \
    --batch-size 100
```

### Environment Variables (Local Mode)
```
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
DATABASE_ID=your-d1-database-id
NCBI_API_KEY=your-ncbi-key (optional)
```

## Database Schema

### Core Tables
- `studies` - Article metadata (PMID, title, abstract, dates)
- `mutations` - Junction: study_id → gene_symbol
- `study_topics` - Junction: study_id → topic
- `treatments` - Junction: study_id → treatment

### Tracking Fields
- `extraction_method` - 'regex' or 'ai'
- `processed_at` - Timestamp of ingestion

## CRON Schedule

Worker configured for scheduled execution:
```toml
[triggers]
crons = ["0 6 * * *"]  # Daily at 6 AM UTC
```

Ingests articles from last 2 months with `MAX_RESULTS=500`.

## Expansion Ideas

- [ ] AI-powered extraction (compare with regex)
- [ ] Full-text PDF parsing for deeper extraction
- [ ] Institution/affiliation extraction
- [ ] Funding source detection
- [ ] ClinicalTrials.gov integration

## Testing Checklist

- [ ] Extraction patterns match expected genes
- [ ] No duplicate PMIDs inserted
- [ ] Rate limits respected
- [ ] Graceful handling of API errors
- [ ] Proper date parsing across formats
