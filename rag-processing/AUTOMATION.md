# RAG Pipeline Automation

## Quick Start

### Manual Test
```powershell
cd "D:\Antigrav workspace\LeukemiaLens\rag-processing"
.\rag-nightly.ps1 -Limit 20 -DryRun  # Preview
.\rag-nightly.ps1 -Limit 20          # Run with 20 docs
```

### Install Task Scheduler Job
```powershell
schtasks /create /XML "LeukemiaLens-RAG-Nightly.xml" /TN "LeukemiaLens\RAG-Nightly"
```

---

## How It Works

### Nightly Desktop Processing (2 AM)
1. **Phase 1: Document Discovery** — Runs `fetch-pmc-fulltext.ts` to find new PMC OA documents
2. **Phase 2: GPU Processing** — Runs `backfill_gpu.py` to process pending documents

### Cloudflare Worker (Continuous)
- **Ingest Worker** runs daily at midnight (cron)
- Ingests new articles from PubMed
- Generates abstract embeddings via Workers AI

---

## Files

| File | Purpose |
|------|---------|
| `rag-nightly.ps1` | Main orchestration script |
| `LeukemiaLens-RAG-Nightly.xml` | Task Scheduler import file |
| `backfill_gpu.py` | GPU-accelerated document processing |
| `logs/` | Timestamped log files |

---

## Logs

Logs are written to `rag-processing/logs/`:
- `rag-nightly_YYYY-MM-DD_HH-mm-ss.log` — Main orchestration log
- `fetch_stdout_*.log` — Document fetch output
- `backfill_stdout_*.log` — GPU backfill output
