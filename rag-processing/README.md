# RAG Processing Stack

Docker-based document processing pipeline for LeukemiaLens RAG system.

## Overview

This stack processes PDF documents from R2, extracts text, chunks it semantically, generates embeddings using **BAAI/bge-base-en-v1.5** (768 dimensions), and uploads to Cloudflare Vectorize.

## Embedding Model

All components use **`bge-base-en-v1.5`** (768 dimensions) for consistency:
- **Local backfill**: `sentence-transformers` with GPU acceleration
- **Cloud ingestion**: Workers AI `@cf/baai/bge-base-en-v1.5`
- **Query search**: Workers AI `@cf/baai/bge-base-en-v1.5`

## Quick Start (Local GPU Backfill)

```bash
# 1. Install PyTorch with CUDA support
pip install torch --index-url https://download.pytorch.org/whl/cu121

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env with your credentials
nano .env

# 5. Run the GPU-optimized backfill
python backfill_gpu.py --limit 100
```

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      LOCAL GPU BACKFILL                                   │
│  ┌───────────┐    ┌───────────┐    ┌────────────┐    ┌───────────────┐  │
│  │   PDFs    │───▶│  Chunker  │───▶│  GPU       │───▶│  Vectorize    │  │
│  │  from R2  │    │  (Python) │    │  Embedder  │    │  (768-dim)    │  │
│  └───────────┘    └───────────┘    └────────────┘    └───────────────┘  │
│                                          │                               │
│                           ~1000 embeddings/sec on GPU                    │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    CLOUD INGESTION (Automatic)                            │
│  ┌───────────┐    ┌───────────┐    ┌────────────┐    ┌───────────────┐  │
│  │  PubMed   │───▶│  Ingest   │───▶│  Workers   │───▶│  Vectorize    │  │
│  │  Articles │    │  Worker   │    │  AI Embed  │    │  (768-dim)    │  │
│  └───────────┘    └───────────┘    └────────────┘    └───────────────┘  │
│                                          │                               │
│                           Runs daily via cron trigger                    │
└──────────────────────────────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Yes |
| `CLOUDFLARE_API_TOKEN` | API token with D1/R2/Vectorize access | Yes |
| `DATABASE_ID` | D1 database ID | Yes |
| `API_BASE_URL` | LeukemiaLens API URL | Yes |
| `GPU_BATCH_SIZE` | Embeddings per batch on GPU (default: 128) | No |
| `CPU_BATCH_SIZE` | Embeddings per batch on CPU (default: 32) | No |

## GPU Backfill Commands

### Process pending documents
```bash
python backfill_gpu.py --limit 1000
```

### Resume from checkpoint
```bash
python backfill_gpu.py --resume --limit 500
```

### Dry run (list documents)
```bash
python backfill_gpu.py --dry-run --limit 20
```

### Clear checkpoint and start fresh
```bash
python backfill_gpu.py --clear-checkpoint
```

## Pipeline Steps

1. **Fetch**: Get pending documents from D1 that haven't been processed
2. **Download**: Retrieve PDF from R2 bucket
3. **Parse**: Extract text using PyMuPDF with page boundaries
4. **Chunk**: Split into 500-800 token chunks with 100 token overlap
5. **Embed**: Generate 768-dim vectors using bge-base-en-v1.5 (GPU accelerated)
6. **Upload**: Push chunks to R2 and vectors to Vectorize
7. **Update**: Mark document as 'ready' in D1

## Troubleshooting

### Out of memory
Reduce `GPU_BATCH_SIZE` in .env or use CPU-only mode.

### Slow processing on GPU
Ensure CUDA is properly installed: `python -c "import torch; print(torch.cuda.is_available())"`

### Connection errors
Check that your API token has the correct permissions and the API URL is accessible.

## Deployment to Local Machine

### Step 1: Copy files to local machine

```bash
# From your local machine
scp -r rag-processing/ /mnt/user/appdata/leukemialens-rag/
```

### Step 2: Create environment file

```bash
# On local machine
cd /mnt/user/appdata/leukemialens-rag
cp .env.example .env
nano .env
```

Fill in your credentials:
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
DATABASE_ID=your_database_id
API_BASE_URL=https://your_api_base_url.your_account_id.workers.dev
```

### Step 3: Run the backfill

```bash
cd /mnt/user/appdata/leukemialens-rag
pip install -r requirements.txt
python backfill_gpu.py --limit 100
```

## File Structure

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Container orchestration |
| `Dockerfile` | Python 3.11 image with dependencies |
| `requirements.txt` | Python dependencies |
| `process_documents.py` | Legacy orchestration script |
| `backfill_gpu.py` | **GPU-optimized batch processing** |
| `pdf_parser.py` | PDF text extraction (PyMuPDF) |
| `chunker.py` | Semantic text chunking |
| `embedder.py` | **GPU-accelerated embeddings (bge-base-en-v1.5)** |
| `.env.example` | Environment template |

## Vectorize Index Setup

The Vectorize index must use 768 dimensions to match bge-base-en-v1.5:

```bash
# Delete existing index
npx wrangler vectorize delete rag-chunks

# Create new index with 768 dimensions
npx wrangler vectorize create rag-chunks --dimensions 768 --metric cosine
```

## Related Commands

### Check processing stats

```bash
curl https://leukemialens-api.jr-rhinehart.workers.dev/api/rag/stats
```

### Test RAG search

```bash
curl -X POST https://leukemialens-api.jr-rhinehart.workers.dev/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{"query": "FLT3 mutation treatment", "topK": 5}'
```

### List documents

```bash
curl "https://leukemialens-api.jr-rhinehart.workers.dev/api/documents?status=pending"
curl "https://leukemialens-api.jr-rhinehart.workers.dev/api/documents?status=ready"
```
