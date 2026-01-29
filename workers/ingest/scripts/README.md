# Environment Variables for Ingest Scripts

To avoid committing sensitive values to git, we use environment variables for configuration.

## Setup

1. **Copy the example file:**
   ```bash
   cd workers/ingest
   cp .env.example .env
   ```

2. **Fill in your values in `.env`:**
   ```bash
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_api_token
   DATABASE_ID=6f7d8bb5-1a41-428d-8692-4bc39384a08d
   WORKER_URL=https://leukemialens-ingest.jr-rhinehart.workers.dev
   ```

3. **The `.env` file is gitignored** and will not be committed.

## Required Variables

| Variable | Description | Used By |
|----------|-------------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | `backfill-topics.ts` |
| `CLOUDFLARE_API_TOKEN` | API token with D1 access | `backfill-topics.ts` |
| `DATABASE_ID` | D1 database ID | `backfill-topics.ts` |
| `WORKER_URL` | Ingest worker URL | `backfill-production.ts`, `backfill.ts` |

## Usage

Scripts will automatically load from `.env` file or use the provided defaults.

```bash
# Load .env and run backfill
npx tsx scripts/backfill-production.ts --start-year 2000 --end-year 2005
```

### Full RAG Backfill (Recommended for large datasets)

   Backfill Production DB and kick off Full-text Fetching and GPU Processing.
   --with-rag - enables RAG processing
   --gpu - enables GPU processing

```bash
# Load .env and run backfill
npx tsx scripts/backfill-production.ts --local --start-year 2025 --month 4 --with-rag --gpu
```