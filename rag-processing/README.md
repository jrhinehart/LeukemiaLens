# RAG Processing Stack

Docker-based document processing pipeline for LeukemiaLens RAG system.

## Overview

This stack processes PDF documents from R2, extracts text, chunks it semantically, generates embeddings, and uploads to Cloudflare Vectorize.

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your credentials
nano .env

# 3. Run the processor (one-time)
docker-compose up processor

# 4. Or run with cron scheduling
docker-compose up scheduler
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ R2 Bucket   │────▶│ PDF Parser  │────▶│ Text        │────▶│ Embedding   │
│ (Documents) │     │ (PyMuPDF)   │     │ Chunker     │     │ Generator   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │ Cloudflare  │
                                                            │ Vectorize   │
                                                            └─────────────┘
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Yes |
| `CLOUDFLARE_API_TOKEN` | API token with D1/R2/Vectorize access | Yes |
| `DATABASE_ID` | D1 database ID | Yes |
| `API_BASE_URL` | LeukemiaLens API URL | Yes |
| `BATCH_SIZE` | Documents per run (default: 10) | No |
| `EMBEDDING_MODEL` | Model name (default: all-MiniLM-L6-v2) | No |

### Resource Limits

The processor is configured for:
- **Memory**: 4GB maximum
- **CPU**: 4 cores
- **Processing rate**: ~10-20 documents/hour

## Commands

### Process pending documents
```bash
docker-compose run --rm processor
```

### Schedule recurring processing
```bash
# Run at 2 AM daily
docker-compose up -d scheduler
```

### Check logs
```bash
docker-compose logs -f processor
```

### Clean up
```bash
docker-compose down
docker system prune -f
```

## Pipeline Steps

1. **Fetch**: Get pending documents from D1 that haven't been processed
2. **Download**: Retrieve PDF from R2 bucket
3. **Parse**: Extract text using PyMuPDF with page boundaries
4. **Chunk**: Split into 500-800 token chunks with 100 token overlap
5. **Embed**: Generate 384-dim vectors using sentence-transformers
6. **Upload**: Push chunks to D1 and vectors to Vectorize
7. **Update**: Mark document as 'ready' in D1

## Troubleshooting

### Out of memory
Reduce `BATCH_SIZE` in .env or increase Docker memory limit.

### Slow processing
This is CPU-only embedding. For faster processing, consider using Cloudflare Workers AI for embeddings instead.

### Connection errors
Check that your API token has the correct permissions and the API URL is accessible.

## Deployment to Unraid

### Step 1: Copy files to Unraid

```bash
# From your local machine
scp -r rag-processing/ unraid:/mnt/user/appdata/leukemialens-rag/
```

### Step 2: Create environment file

```bash
# On Unraid
cd /mnt/user/appdata/leukemialens-rag
cp .env.example .env
nano .env
```

Fill in your credentials:
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
DATABASE_ID=6f7d8bb5-1a41-428d-8692-4bc39384a08d
API_BASE_URL=https://leukemialens-api.jr-rhinehart.workers.dev
BATCH_SIZE=10
```

### Step 3: Build and test

```bash
docker-compose build
docker-compose run --rm processor
```

### Step 4: Enable scheduled processing

```bash
# Start scheduler (runs at 2 AM daily by default)
docker-compose up -d scheduler

# Check scheduler logs
docker-compose logs -f scheduler
```

### Step 5: Manual runs

```bash
# Process pending documents on-demand
docker-compose run --rm processor
```

## File Structure

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Container orchestration |
| `Dockerfile` | Python 3.11 image with dependencies |
| `requirements.txt` | Python dependencies |
| `process_documents.py` | Main orchestration script |
| `pdf_parser.py` | PDF text extraction (PyMuPDF) |
| `chunker.py` | Semantic text chunking |
| `embedder.py` | Embedding generation (all-MiniLM-L6-v2) |
| `.env.example` | Environment template |

## Related Commands

### Fetch new documents first (run locally)

Before processing, you may want to fetch new PDFs from PMC:

```bash
cd workers/ingest
npx tsx scripts/fetch-pmc-fulltext.ts --limit 100 --format pdf
```

### Check processing stats

```bash
curl https://leukemialens-api.jr-rhinehart.workers.dev/api/rag/stats
```

### List documents

```bash
curl "https://leukemialens-api.jr-rhinehart.workers.dev/api/documents?status=pending"
curl "https://leukemialens-api.jr-rhinehart.workers.dev/api/documents?status=ready"
```
