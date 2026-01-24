---
description: RAG document ingestion and query pipeline
domain: TBD (new services), workers/api (query endpoints)
owner: RAG Pipeline Agent
---

# RAG Pipeline Development

## Scope & Ownership

This agent owns the **Retrieval-Augmented Generation (RAG) pipeline** for document ingestion and intelligent querying. This is a **planned feature** - infrastructure is being designed.

## Architecture Vision

```
Document Sources              Local Processing               Cloud Services
      │                            │                              │
      ▼                            ▼                              ▼
┌──────────────┐           ┌───────────────┐            ┌─────────────────┐
│ PDF Uploads  │──────────▶│ Unraid Docker │───────────▶│ Cloudflare R2   │
│ Research     │           │ Stack         │            │ (Document Store)│
│ Papers       │           │               │            └─────────────────┘
└──────────────┘           │ • PDF Parser  │                    │
                           │ • Chunker     │                    ▼
                           │ • Embeddings  │            ┌─────────────────┐
                           │   (CPU-only)  │            │ Cloudflare D1   │
                           └───────────────┘            │ (Metadata/Index)│
                                   │                    └─────────────────┘
                                   │                            │
                                   ▼                            ▼
                           ┌───────────────┐            ┌─────────────────┐
                           │ Vector Index  │◀──────────▶│ Query Worker    │
                           │ (FAISS/Local) │            │ + Claude API    │
                           └───────────────┘            └─────────────────┘
```

## Planned Components

### 1. Document Ingestion (Unraid Docker)

**PDF Parser Container**
- Tool: `pdfplumber` or `Apache Tika`
- Output: Plain text with page boundaries
- Memory: ~1GB

**Text Chunker**
- Strategy: Semantic chunking (paragraphs/sections)
- Chunk size: 500-1000 tokens with 100-token overlap
- Metadata: page number, section header, source doc

**Embedding Generator**
- Model: `all-MiniLM-L6-v2` (CPU-optimized, ~90MB)
- Alternative: `nomic-embed-text` via Ollama
- Output: 384-dim vectors

### 2. Storage

**R2 (Documents)**
- Original PDFs: `documents/{user_id}/{doc_id}.pdf`
- Extracted text: `documents/{user_id}/{doc_id}.txt`

**D1 (Metadata)**
```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    filename TEXT,
    upload_date TEXT,
    page_count INTEGER,
    chunk_count INTEGER,
    status TEXT  -- 'processing', 'ready', 'error'
);

CREATE TABLE chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT,
    chunk_index INTEGER,
    content TEXT,
    page_number INTEGER,
    embedding_key TEXT  -- Reference to vector index
);
```

### 3. Query Pipeline

**Worker Endpoint** (`POST /api/rag/query`)
```typescript
interface RAGQueryRequest {
    query: string;
    documentIds?: string[];  // Scope to specific docs
    topK?: number;           // Number of chunks to retrieve
}

interface RAGQueryResponse {
    answer: string;
    sources: Array<{
        documentId: string;
        chunkId: string;
        content: string;
        relevanceScore: number;
    }>;
}
```

**Flow:**
1. Generate query embedding (local or Workers AI)
2. Vector similarity search against index
3. Retrieve top-K chunks
4. Send to Claude with retrieved context
5. Return answer with source citations

## Resource Constraints (Unraid)

Based on ROADMAP notes:
- **RAM**: ~30% headroom available (~4-8GB for RAG stack)
- **CPU**: Low baseline, can burst for processing
- **No GPU**: CPU-only embedding models

**Docker Limits:**
```bash
--memory=4G --cpus=2.0
--cpuset-cpus="4-7"  # Isolate cores for RAG
```

## Implementation Phases

### Phase 1: Document Upload
- [ ] R2 bucket setup for document storage
- [ ] Upload endpoint in API Worker
- [ ] Document metadata in D1

### Phase 2: Local Processing Stack
- [ ] Docker Compose for Unraid
- [ ] PDF extraction container
- [ ] Chunking service
- [ ] Embedding generation

### Phase 3: Vector Index
- [ ] FAISS index on Unraid
- [ ] Sync mechanism with D1 metadata
- [ ] Query interface

### Phase 4: Query Integration
- [ ] `/api/rag/query` endpoint
- [ ] Claude integration via AI Gateway
- [ ] Source citation formatting
- [ ] Frontend query UI

## Claude Integration

Using hosted Claude (per ROADMAP):
- **Endpoint**: Cloudflare AI Gateway or direct Anthropic API
- **Model**: Claude 3.5 Sonnet for reasoning
- **Context window**: Use for RAG context injection
- **Rate limits**: TBD based on plan

## Testing Checklist

- [ ] PDF parsing extracts clean text
- [ ] Chunking maintains semantic coherence
- [ ] Embeddings generate in reasonable time
- [ ] Vector search returns relevant chunks
- [ ] Claude responses cite sources accurately
- [ ] Memory usage stays within limits
