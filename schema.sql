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
  FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE CASCADE
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