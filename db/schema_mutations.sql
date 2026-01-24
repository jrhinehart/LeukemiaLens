-- ==========================================
-- MUTATIONS REFERENCE SCHEMA
-- Based on ELN 2022 (AML) and WHO 2022 (ALL) Standards
-- ==========================================

-- Drop existing ref_mutations and recreate with enhanced schema
DROP TABLE IF EXISTS ref_mutations;

CREATE TABLE ref_mutations (
  id INTEGER PRIMARY KEY,
  gene_symbol TEXT UNIQUE NOT NULL,    -- Standard gene symbol (HGNC)
  name TEXT,                           -- Full gene name
  category TEXT,                       -- Functional category
  risk_class TEXT,                     -- ELN risk: 'Favorable', 'Intermediate', 'Adverse', or NULL
  disease_relevance TEXT,              -- 'AML', 'ALL', 'MDS', 'CML', 'Multiple'
  display_order INTEGER DEFAULT 0
);

-- Index for efficient queries
CREATE INDEX idx_ref_mutations_category ON ref_mutations(category);
CREATE INDEX idx_ref_mutations_risk ON ref_mutations(risk_class);
CREATE INDEX idx_ref_mutations_disease ON ref_mutations(disease_relevance);

-- ==========================================
-- ELN 2022 FAVORABLE RISK MUTATIONS
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
('NPM1', 'Nucleophosmin 1', 'Transcription Factor', 'Favorable', 'AML', 1),
('CEBPA', 'CCAAT Enhancer Binding Protein Alpha', 'Transcription Factor', 'Favorable', 'AML', 2);

-- ==========================================
-- ELN 2022 INTERMEDIATE RISK MUTATIONS
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
('FLT3', 'FMS-Like Tyrosine Kinase 3', 'Kinase', 'Intermediate', 'AML', 10),
('FLT3-ITD', 'FLT3 Internal Tandem Duplication', 'Kinase', 'Intermediate', 'AML', 11),
('FLT3-TKD', 'FLT3 Tyrosine Kinase Domain', 'Kinase', 'Intermediate', 'AML', 12);

-- ==========================================
-- ELN 2022 ADVERSE RISK MUTATIONS
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
-- Tumor Suppressor
('TP53', 'Tumor Protein P53', 'Tumor Suppressor', 'Adverse', 'Multiple', 20),
-- Myelodysplasia-Related Gene Mutations (MDS-related)
('ASXL1', 'ASXL Transcriptional Regulator 1', 'Epigenetic', 'Adverse', 'Multiple', 21),
('BCOR', 'BCL6 Corepressor', 'Epigenetic', 'Adverse', 'AML', 22),
('EZH2', 'Enhancer of Zeste 2', 'Epigenetic', 'Adverse', 'Multiple', 23),
('RUNX1', 'RUNX Family Transcription Factor 1', 'Transcription Factor', 'Adverse', 'AML', 24),
('SF3B1', 'Splicing Factor 3b Subunit 1', 'Splicing', 'Adverse', 'Multiple', 25),
('SRSF2', 'Serine and Arginine Rich Splicing Factor 2', 'Splicing', 'Adverse', 'Multiple', 26),
('STAG2', 'Stromal Antigen 2', 'Cohesin', 'Adverse', 'AML', 27),
('U2AF1', 'U2 Small Nuclear RNA Auxiliary Factor 1', 'Splicing', 'Adverse', 'Multiple', 28),
('ZRSR2', 'Zinc Finger CCCH-Type RNA Binding Motif And Serine/Arginine Rich 2', 'Splicing', 'Adverse', 'Multiple', 29);

-- ==========================================
-- FUSION GENES (AML/ALL)
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
-- AML Favorable Fusions
('RUNX1-RUNX1T1', 't(8;21) RUNX1::RUNX1T1', 'Fusion', 'Favorable', 'AML', 30),
('CBFB-MYH11', 'inv(16)/t(16;16) CBFB::MYH11', 'Fusion', 'Favorable', 'AML', 31),
('PML-RARA', 't(15;17) PML::RARA', 'Fusion', 'Favorable', 'AML', 32),
-- AML Adverse Fusions
('BCR-ABL1', 't(9;22) BCR::ABL1', 'Fusion', 'Adverse', 'Multiple', 33),
('KMT2A', 'KMT2A (MLL) Rearranged', 'Fusion', 'Adverse', 'Multiple', 34),
('DEK-NUP214', 't(6;9) DEK::NUP214', 'Fusion', 'Adverse', 'AML', 35),
('MECOM', 'MECOM (EVI1) Rearranged', 'Fusion', 'Adverse', 'AML', 36),
('NUP98', 'NUP98 Rearranged', 'Fusion', 'Adverse', 'AML', 37),
-- ALL Fusions
('ETV6-RUNX1', 't(12;21) ETV6::RUNX1', 'Fusion', 'Favorable', 'ALL', 38),
('TCF3-PBX1', 't(1;19) TCF3::PBX1', 'Fusion', NULL, 'ALL', 39),
('TCF3-HLF', 't(17;19) TCF3::HLF', 'Fusion', 'Adverse', 'ALL', 40);

-- ==========================================
-- KINASE/SIGNALING PATHWAY MUTATIONS
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
('KIT', 'KIT Proto-Oncogene', 'Kinase', NULL, 'AML', 50),
('JAK2', 'Janus Kinase 2', 'Kinase', NULL, 'Multiple', 51),
('KRAS', 'KRAS Proto-Oncogene', 'Signaling', NULL, 'Multiple', 52),
('NRAS', 'NRAS Proto-Oncogene', 'Signaling', NULL, 'Multiple', 53),
('BRAF', 'B-Raf Proto-Oncogene', 'Signaling', NULL, 'Multiple', 54),
('CBL', 'CBL Proto-Oncogene', 'Signaling', NULL, 'Multiple', 55),
('NF1', 'Neurofibromin 1', 'Signaling', NULL, 'Multiple', 56),
('PTPN11', 'Protein Tyrosine Phosphatase Non-Receptor Type 11', 'Signaling', NULL, 'Multiple', 57),
('CSF3R', 'Colony Stimulating Factor 3 Receptor', 'Signaling', NULL, 'Multiple', 58);

-- ==========================================
-- EPIGENETIC MODIFIERS
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
('DNMT3A', 'DNA Methyltransferase 3 Alpha', 'Epigenetic', NULL, 'Multiple', 60),
('TET2', 'Tet Methylcytosine Dioxygenase 2', 'Epigenetic', NULL, 'Multiple', 61),
('IDH1', 'Isocitrate Dehydrogenase 1', 'Metabolic', NULL, 'AML', 62),
('IDH2', 'Isocitrate Dehydrogenase 2', 'Metabolic', NULL, 'AML', 63),
('KDM6A', 'Lysine Demethylase 6A', 'Epigenetic', NULL, 'Multiple', 64),
('SETBP1', 'SET Binding Protein 1', 'Epigenetic', NULL, 'Multiple', 65);

-- ==========================================
-- TRANSCRIPTION FACTORS
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
('GATA2', 'GATA Binding Protein 2', 'Transcription Factor', NULL, 'AML', 70),
('WT1', 'Wilms Tumor 1', 'Transcription Factor', NULL, 'AML', 71),
('ETV6', 'ETS Variant Transcription Factor 6', 'Transcription Factor', NULL, 'Multiple', 72),
('PHF6', 'PHD Finger Protein 6', 'Transcription Factor', NULL, 'Multiple', 73),
('IKZF1', 'IKAROS Family Zinc Finger 1', 'Transcription Factor', 'Adverse', 'ALL', 74),
('PAX5', 'Paired Box 5', 'Transcription Factor', NULL, 'ALL', 75),
('CREBBP', 'CREB Binding Protein', 'Transcription Factor', NULL, 'ALL', 76);

-- ==========================================
-- ALL-SPECIFIC MUTATIONS
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
('NOTCH1', 'Notch Receptor 1', 'Signaling', 'Favorable', 'ALL', 80),
('FBXW7', 'F-Box And WD Repeat Domain Containing 7', 'Signaling', 'Favorable', 'ALL', 81),
('CRLF2', 'Cytokine Receptor Like Factor 2', 'Signaling', 'Adverse', 'ALL', 82),
('IL7R', 'Interleukin 7 Receptor', 'Signaling', NULL, 'ALL', 83),
('CDKN2A', 'Cyclin Dependent Kinase Inhibitor 2A', 'Tumor Suppressor', NULL, 'ALL', 84),
('CDKN2B', 'Cyclin Dependent Kinase Inhibitor 2B', 'Tumor Suppressor', NULL, 'ALL', 85),
('RB1', 'RB Transcriptional Corepressor 1', 'Tumor Suppressor', NULL, 'ALL', 86);

-- ==========================================
-- ADDITIONAL RECOMMENDED GENES (ELN 2022)
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
('ANKRD26', 'Ankyrin Repeat Domain 26', 'Other', NULL, 'AML', 90),
('BCORL1', 'BCL6 Corepressor Like 1', 'Epigenetic', NULL, 'AML', 91),
('DDX41', 'DEAD-Box Helicase 41', 'Other', NULL, 'AML', 92),
('PPM1D', 'Protein Phosphatase Mg2+/Mn2+ Dependent 1D', 'Signaling', NULL, 'Multiple', 93),
('RAD21', 'RAD21 Cohesin Complex Component', 'Cohesin', NULL, 'AML', 94),
('SMC1A', 'Structural Maintenance Of Chromosomes 1A', 'Cohesin', NULL, 'AML', 95),
('SMC3', 'Structural Maintenance Of Chromosomes 3', 'Cohesin', NULL, 'AML', 96);

-- ==========================================
-- T-ALL SPECIFIC MUTATIONS
-- ==========================================
INSERT INTO ref_mutations (gene_symbol, name, category, risk_class, disease_relevance, display_order) VALUES
('TAL1', 'TAL BHLH Transcription Factor 1', 'Transcription Factor', NULL, 'ALL', 100),
('TLX1', 'T Cell Leukemia Homeobox 1', 'Transcription Factor', NULL, 'ALL', 101),
('TLX3', 'T Cell Leukemia Homeobox 3', 'Transcription Factor', NULL, 'ALL', 102),
('LMO1', 'LIM Domain Only 1', 'Transcription Factor', NULL, 'ALL', 103),
('LMO2', 'LIM Domain Only 2', 'Transcription Factor', NULL, 'ALL', 104),
('PTEN', 'Phosphatase And Tensin Homolog', 'Tumor Suppressor', NULL, 'ALL', 105);
