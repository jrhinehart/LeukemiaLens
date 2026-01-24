/**
 * RAG Pipeline Type Definitions
 * Types for document storage, PMC OA API responses, and RAG queries
 */

// ==========================================
// Document Types
// ==========================================

export interface Document {
    id: string;
    pmcid?: string;
    pmid?: string;
    studyId?: number;
    userId?: string;
    filename: string;
    source: DocumentSource;
    format: DocumentFormat;
    license?: string;
    r2Key: string;
    fileSize?: number;
    pageCount?: number;
    chunkCount: number;
    status: DocumentStatus;
    errorMessage?: string;
    createdAt: string;
    processedAt?: string;
}

export type DocumentSource = 'pmc_oa' | 'user_upload' | 'manual';
export type DocumentFormat = 'pdf' | 'xml' | 'txt';
export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface DocumentUploadRequest {
    pmcid?: string;
    pmid?: string;
    studyId?: number;
    filename: string;
    source: DocumentSource;
    format: DocumentFormat;
    license?: string;
    fileSize?: number;
    // Base64-encoded file content for direct upload
    content?: string;
}

export interface DocumentUploadResponse {
    success: boolean;
    document?: Document;
    uploadUrl?: string;  // Pre-signed URL for large file uploads
    error?: string;
}

// ==========================================
// PMC Open Access API Types
// ==========================================

export interface PMCOARecord {
    pmcid: string;
    citation: string;
    license: string;
    retracted: boolean;
    links: PMCOALink[];
}

export interface PMCOALink {
    format: 'pdf' | 'tgz';
    href: string;
    updated: string;
}

export interface PMCOACheckResponse {
    available: boolean;
    pmcid?: string;
    record?: PMCOARecord;
    error?: string;
}

// ==========================================
// PMID to PMCID Conversion Types
// ==========================================

export interface PMIDConversionResult {
    pmid: string;
    pmcid?: string;
    error?: string;
}

// ==========================================
// Document Listing Types
// ==========================================

export interface DocumentListQuery {
    status?: DocumentStatus;
    source?: DocumentSource;
    limit?: number;
    offset?: number;
}

export interface DocumentListResponse {
    documents: Document[];
    total: number;
    limit: number;
    offset: number;
}

// ==========================================
// Chunk Types (Phase 2)
// ==========================================

export interface DocumentChunk {
    id: string;
    documentId: string;
    chunkIndex: number;
    content: string;
    startPage?: number;
    endPage?: number;
    sectionHeader?: string;
    tokenCount?: number;
    embeddingId?: string;  // Reference to Vectorize index
    createdAt?: string;
}

export interface ChunkWithEmbedding extends DocumentChunk {
    embedding: number[];  // 384-dim vector
}

export interface BatchChunkRequest {
    documentId: string;
    chunks: Array<{
        id: string;
        chunkIndex: number;
        content: string;
        startPage?: number;
        endPage?: number;
        sectionHeader?: string;
        tokenCount?: number;
        embedding: number[];  // 384-dim vector
    }>;
}

export interface BatchChunkResponse {
    success: boolean;
    chunksCreated: number;
    vectorsUpserted: number;
    error?: string;
}

// ==========================================
// Future: RAG Query Types (Phase 4)
// ==========================================

export interface RAGQueryRequest {
    query: string;
    documentIds?: string[];  // Scope to specific docs
    topK?: number;           // Number of chunks to retrieve
}

export interface RAGQueryResponse {
    answer: string;
    sources: RAGSource[];
}

export interface RAGSource {
    documentId: string;
    chunkId: string;
    content: string;
    relevanceScore: number;
    citation?: string;
}
