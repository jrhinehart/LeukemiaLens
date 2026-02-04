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
   DATABASE_ID=your_database_id
   WORKER_URL=https://your_worker_name.your_account_id.workers.dev
   ```

3. **The `.env` file is gitignored** and will not be committed.

## Required Variables

| Variable | Description | Used By |
|----------|-------------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | `backfill-production.ts` |
| `CLOUDFLARE_API_TOKEN` | API token with D1 access | `backfill-production.ts` |
| `DATABASE_ID` | D1 database ID | `backfill-production.ts` |
| `WORKER_URL` | Ingest worker URL | `backfill-production.ts` |

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
   --granular - enables granular processing (month by month)

# Load .env and run backfill
npx tsx scripts/backfill-production.ts --local --start-year 2024 --month 7 --granular --with-rag --gpu