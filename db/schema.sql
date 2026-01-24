-- Core Table: Studies
-- Stores the main metadata for each article/study.
CREATE TABLE studies (
  id INTEGER PRIMARY KEY, -- Auto-incrementing internal ID
  title TEXT NOT NULL,
  abstract TEXT,
  pub_date TEXT, -- ISO format YYYY-MM-DD
  journal TEXT,
  authors TEXT, -- Compact string or JSON array if needed, keeping simple text for now
  affiliations TEXT, -- Added for institution filtering
  
  -- Extracted Metadata Fields
  disease_subtype TEXT, -- e.g., 'AML', 'ALL', 'CML'
  has_complex_karyotype INTEGER DEFAULT 0, -- Boolean (0 or 1)
  transplant_context INTEGER DEFAULT 0, -- Boolean: 1 if related to transplant
  
  -- Source Metadata
  source_id TEXT UNIQUE, -- e.g., 'PMID:12345' or 'NCT12345'
  source_type TEXT -- 'pubmed' or 'clinicaltrials'
);

-- Indexing for performance
CREATE INDEX idx_studies_pub_date ON studies(pub_date DESC);
CREATE INDEX idx_studies_disease ON studies(disease_subtype);
CREATE INDEX idx_studies_complex_karyotype ON studies(has_complex_karyotype) WHERE has_complex_karyotype = 1;
CREATE INDEX idx_studies_transplant ON studies(transplant_context) WHERE transplant_context = 1;


-- Junction Table: Mutations
-- mutations found in the study
CREATE TABLE mutations (
  id INTEGER PRIMARY KEY,
  study_id INTEGER NOT NULL,
  gene_symbol TEXT NOT NULL,
  FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE CASCADE
);
CREATE INDEX idx_mutations_gene ON mutations(gene_symbol);
CREATE INDEX idx_mutations_study ON mutations(study_id);

-- Junction Table: Cytogenetics
-- cytogenetic abnormalities found
CREATE TABLE cytogenetics (
  id INTEGER PRIMARY KEY,
  study_id INTEGER NOT NULL,
  abnormality TEXT NOT NULL,
  FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE CASCADE
);
CREATE INDEX idx_cytogenetics_abnormality ON cytogenetics(abnormality);
CREATE INDEX idx_cytogenetics_study ON cytogenetics(study_id);

-- Junction Table: MRD Methods
-- Minimal Residual Disease methods mentioned
CREATE TABLE mrd_methods (
  id INTEGER PRIMARY KEY,
  study_id INTEGER NOT NULL,
  method_name TEXT NOT NULL,
  FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE CASCADE
);
CREATE INDEX idx_mrd_method ON mrd_methods(method_name);
CREATE INDEX idx_mrd_study ON mrd_methods(study_id);

-- Junction Table: Study Topics
-- Topics/Tags extracted from the text
CREATE TABLE study_topics (
  id INTEGER PRIMARY KEY,
  study_id INTEGER NOT NULL,
  topic_name TEXT NOT NULL,
  FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE CASCADE
);
CREATE INDEX idx_study_topics_name ON study_topics(topic_name);
CREATE INDEX idx_study_topics_study ON study_topics(study_id);

-- Links Table
-- External links to the full text or source
CREATE TABLE links (
  id INTEGER PRIMARY KEY,
  study_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  link_type TEXT, -- 'pubmed', 'doi', 'clinicaltrials', etc.
  FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE CASCADE,
  UNIQUE(study_id, url) -- Prevent duplicate links per study
);
CREATE INDEX idx_links_study ON links(study_id);

-- ==========================================
-- ONTOLOGY / REFERENCE TABLES
-- ==========================================

-- Reference: Diseases
-- Authoritative list of diseases for filtering and normalization.
CREATE TABLE ref_diseases (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g., 'AML'
  name TEXT NOT NULL, -- e.g., 'Acute Myeloid Leukemia'
  display_order INTEGER DEFAULT 0
);

-- Seed Diseases
INSERT INTO ref_diseases (code, name, display_order) VALUES 
('AML', 'Acute Myeloid Leukemia', 1),
('ALL', 'Acute Lymphoblastic Leukemia', 2),
('CML', 'Chronic Myeloid Leukemia', 3),
('CLL', 'Chronic Lymphocytic Leukemia', 4),
('MDS', 'Myelodysplastic Syndromes', 5),
('MPN', 'Myeloproliferative Neoplasms', 6),
('DLBCL', 'Diffuse Large B-Cell Lymphoma', 7),
('MM', 'Multiple Myeloma', 8);

-- Reference: Mutations
-- Authoritative list of mutations to track and filter by.
CREATE TABLE ref_mutations (
  id INTEGER PRIMARY KEY,
  gene_symbol TEXT UNIQUE NOT NULL, -- e.g., 'FLT3'
  name TEXT, -- Optional full name
  category TEXT -- Optional: 'Kinase', 'Epigenetic', etc.
);

-- Seed Mutations (Top tracked)
INSERT INTO ref_mutations (gene_symbol, category) VALUES
('FLT3', 'Kinase'),
('NPM1', 'Transcription Factor'),
('IDH1', 'Metabolic'),
('IDH2', 'Metabolic'),
('TP53', 'Tumor Suppressor'),
('KIT', 'Kinase'),
('CEBPA', 'Transcription Factor'),
('RUNX1', 'Transcription Factor'),
('ASXL1', 'Epigenetic'),
('DNMT3A', 'Epigenetic'),
('TET2', 'Epigenetic'),
('KRAS', 'Signaling'),
('NRAS', 'Signaling'),
('WT1', 'Transcription Factor'),
('BCR-ABL1', 'Fusion'),
('PML-RARA', 'Fusion'),
('SF3B1', 'Splicing'),
('GATA2', 'Transcription Factor');

-- Table for tracking API usage and rate limiting
CREATE TABLE IF NOT EXISTS api_usage (
  ip TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0,
  last_reset INTEGER
);

-- ==========================================
-- RAG PIPELINE TABLES
-- ==========================================

-- Documents table for RAG pipeline
-- Stores metadata for documents uploaded to R2 for RAG processing
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,              -- UUID
    pmcid TEXT,                       -- PMC ID if from PMC Open Access
    pmid TEXT,                        -- PubMed ID reference (links to studies.source_id)
    study_id INTEGER,                 -- FK to studies table if linked
    user_id TEXT,                     -- For user-uploaded docs (future Clerk integration)
    filename TEXT NOT NULL,
    source TEXT NOT NULL,             -- 'pmc_oa', 'user_upload', 'manual'
    format TEXT NOT NULL,             -- 'pdf', 'xml', 'txt'
    license TEXT,                     -- CC BY, CC BY-NC, etc.
    r2_key TEXT NOT NULL,             -- Path in R2 bucket
    file_size INTEGER,
    page_count INTEGER,
    chunk_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',    -- 'pending', 'processing', 'ready', 'error'
    error_message TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    processed_at TEXT,
    FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_documents_pmcid ON documents(pmcid);
CREATE INDEX IF NOT EXISTS idx_documents_pmid ON documents(pmid);
CREATE INDEX IF NOT EXISTS idx_documents_study ON documents(study_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);

-- Chunks table for RAG pipeline
-- Stores text chunks from documents with references to vector embeddings
CREATE TABLE IF NOT EXISTS chunks (
    id TEXT PRIMARY KEY,              -- UUID
    document_id TEXT NOT NULL,        -- FK to documents
    chunk_index INTEGER NOT NULL,     -- Order within document
    content TEXT NOT NULL,            -- Chunk text content
    start_page INTEGER,               -- Starting page in source doc
    end_page INTEGER,                 -- Ending page in source doc
    section_header TEXT,              -- Section header if detected
    token_count INTEGER,              -- Estimated token count
    embedding_id TEXT,                -- Reference to Vectorize index
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chunks_document ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks(embedding_id);