---
description: RAG document ingestion and query pipeline
---

# RAG Pipeline Development

## Scope & Ownership

This agent owns the **Retrieval-Augmented Generation (RAG) pipeline** for document ingestion and intelligent querying.

**Current Status**: Phase 1 Complete ✅ | Phase 2 In Planning

## Architecture Vision

```
Document Sources              Local Processing               Cloud Services
      │                            │                              │
      ▼                            ▼                              ▼
┌──────────────┐           ┌───────────────┐            ┌─────────────────┐
│ PMC Open     │──────────▶│ Unraid Docker │───────────▶│ Cloudflare R2   │
│ Access PDFs  │           │ Stack         │            │ (Document Store)│
│              │           │               │            └─────────────────┘
└──────────────┘           │ • PDF Parser  │                    │
                           │ • Chunker     │                    ▼
                           │ • Embeddings  │            ┌─────────────────┐
                           │   (CPU-only)  │            │ Cloudflare D1   │
                           └───────────────┘            │ (Metadata/Index)│
                                   │                    └─────────────────┘
                                   │                            │
                                   ▼                            ▼
                           ┌───────────────┐            ┌─────────────────┐
                           │ Vectorize     │◀──────────▶│ Query Worker    │
                           │ (CF Native)   │            │ + Claude API    │
                           └───────────────┘            └─────────────────┘
```

---

## ✅ Phase 1: Document Upload (COMPLETE)

**Completed 2026-01-24**

### What Was Built

1. **R2 Bucket**: `leukemialens-documents`
   - Path structure: `pmc/{PMCID}/{filename}.pdf`

2. **D1 Schema**: `documents` table with full metadata tracking

3. **API Endpoints** (9 new):
   | Endpoint | Method | Purpose |
   |----------|--------|---------|
   | `/api/pmc/check/:pmcid` | GET | Check PMC OA availability |
   | `/api/pmc/convert/:pmid` | GET | PMID → PMCID conversion |
   | `/api/documents/upload` | POST | Upload to R2 |
   | `/api/documents` | GET | List with filters |
   | `/api/documents/:id` | GET | Get metadata |
   | `/api/documents/:id/content` | GET | Download file |
   | `/api/documents/:id/status` | PATCH | Update status |
   | `/api/rag/stats` | GET | Pipeline statistics |

4. **Local Fetch Script**: `workers/ingest/scripts/fetch-pmc-fulltext.ts`
   ```bash
   npx tsx scripts/fetch-pmc-fulltext.ts --limit 100 --format pdf
   ```

### PMC Coverage Results

| Metric | Value |
|--------|-------|
| Articles with PMCID | ~20-30% |
| In Open Access | ~100% of those |
| Has PDF | ~100% of OA |

---

## 🔄 Phase 2: Local Processing Stack (IN PROGRESS)

### Overview

Build a Docker-based processing pipeline on Unraid to:
1. Extract text from PDFs
2. Chunk text semantically
3. Generate embeddings (CPU-only)
4. Upload chunks + embeddings to Cloudflare

### Components

#### 2.1 PDF Extraction Container

**Option A: PyMuPDF (Recommended)**
- Fastest pure-Python PDF library
- Handles complex layouts well
- Small memory footprint (~200MB)

**Option B: Apache Tika**
- More robust for edge cases
- Larger footprint (~500MB)
- REST API interface

```dockerfile
# Dockerfile.pdf-parser
FROM python:3.11-slim
RUN pip install pymupdf
COPY pdf_parser.py /app/
WORKDIR /app
CMD ["python", "pdf_parser.py"]
```

#### 2.2 Text Chunking Service

**Strategy**: Semantic chunking with overlap
- Target: 500-800 tokens per chunk
- Overlap: 100 tokens
- Preserve: section headers, page numbers

```python
# Chunking approach
def chunk_document(text: str, max_tokens: int = 600) -> List[Chunk]:
    # 1. Split by section headers first
    # 2. Further split long sections by paragraphs
    # 3. Merge short paragraphs
    # 4. Add overlap between chunks
```

#### 2.3 Embedding Generator

**Model**: `all-MiniLM-L6-v2`
- 384-dimensional vectors
- ~90MB model size
- CPU-optimized with ONNX runtime
- ~50-100 embeddings/sec on CPU

**Alternative**: Cloudflare Workers AI `@cf/baai/bge-base-en-v1.5`
- No local compute needed
- 768-dimensional vectors
- Rate limits apply

#### 2.4 Docker Compose Stack

```yaml
# docker-compose.yml (for Unraid)
version: '3.8'

services:
  pdf-parser:
    build: ./pdf-parser
    volumes:
      - ./input:/input
      - ./output:/output
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '2.0'

  embeddings:
    build: ./embeddings
    volumes:
      - ./output:/input
      - ./vectors:/output
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '2.0'

  uploader:
    build: ./uploader
    environment:
      - API_BASE_URL=${API_BASE_URL}
      - CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}
    volumes:
      - ./vectors:/input
```

### Phase 2 Tasks

- [ ] Create `rag-processing/` directory structure
- [ ] Implement PDF parser container
- [ ] Implement chunking logic
- [ ] Implement embedding generator
- [ ] Create orchestration script
- [ ] Add chunks table to D1 schema
- [ ] Add `/api/documents/:id/chunks` endpoint
- [ ] Test end-to-end on Unraid

### Resource Allocation (Unraid)

```bash
# Docker limits per container
--memory=2G --cpus=2.0
--cpuset-cpus="4-7"  # Isolate 4 cores for RAG
```

**Expected throughput**: 10-20 PDFs/hour with CPU embeddings

---

## 📋 Phase 3: Vector Index (PLANNED)

### Cloudflare Vectorize

Use Cloudflare's native vector database:
- 768 or 384 dimensions (matches embedding model)
- Automatic scaling
- Integrated with Workers

```typescript
// Vector index creation
const index = await env.VECTORIZE.create('rag-chunks', {
  dimensions: 384,
  metric: 'cosine'
});

// Upsert vectors
await index.upsert([{
  id: chunkId,
  values: embedding,
  metadata: { documentId, pageNumber }
}]);
```

### D1 Chunks Table

```sql
CREATE TABLE chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER,
    token_count INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
);
```

---

## 📋 Phase 4: Query Integration (PLANNED)

### RAG Query Endpoint

```typescript
// POST /api/rag/query
interface RAGQueryRequest {
    query: string;
    documentIds?: string[];  // Scope to specific docs
    topK?: number;           // Default: 5
}

interface RAGQueryResponse {
    answer: string;
    sources: Array<{
        documentId: string;
        chunkId: string;
        content: string;
        relevanceScore: number;
        citation: string;  // "Author et al., Journal 2024"
    }>;
    model: string;
    tokensUsed: number;
}
```

### Query Flow

1. Generate query embedding (Workers AI or local)
2. Vector similarity search (Vectorize)
3. Retrieve top-K chunks from D1
4. Build context prompt with citations
5. Send to Claude 3.5 Sonnet
6. Format response with source links

---

## Testing Checklist

### Phase 1 ✅
- [x] R2 bucket created and accessible
- [x] Document upload endpoint works
- [x] PMC OA API integration tested
- [x] Local fetch script downloads PDFs
- [x] Documents tracked in D1

### Phase 2
- [ ] PDF parsing extracts clean text
- [ ] Section headers detected correctly
- [ ] Chunking maintains semantic coherence
- [ ] Embeddings generate in reasonable time (~100/sec)
- [ ] Memory usage stays within 4GB limit

### Phase 3
- [ ] Vectorize index created
- [ ] Upsert/query operations work
- [ ] Similarity search returns relevant results

### Phase 4
- [ ] Query endpoint responds correctly
- [ ] Claude receives proper context
- [ ] Citations link back to documents
- [ ] Response time < 5 seconds

---

## Files

| File | Purpose |
|------|---------|
| `workers/api/src/rag-types.ts` | TypeScript types |
| `workers/api/src/index.ts` | API endpoints |
| `workers/ingest/scripts/fetch-pmc-fulltext.ts` | PMC fetcher |
| `db/schema.sql` | Documents table |
| `rag-processing/` | Docker stack (Phase 2) |