-- ==========================================
-- TREATMENT FILTER SCHEMA
-- ==========================================

-- Reference: Treatments
-- Authoritative list of treatment protocols and individual drugs
CREATE TABLE ref_treatments (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- e.g., 'FLAG-IDA', 'FLUDARABINE'
  name TEXT NOT NULL, -- e.g., 'FLAG-IDA Protocol', 'Fludarabine'
  type TEXT NOT NULL CHECK(type IN ('protocol', 'drug')), -- 'protocol' or 'drug'
  description TEXT, -- Optional description
  display_order INTEGER DEFAULT 0
);

-- Reference: Treatment Components
-- Maps protocols to their component drugs
CREATE TABLE ref_treatment_components (
  id INTEGER PRIMARY KEY,
  protocol_id INTEGER NOT NULL, -- FK to ref_treatments where type='protocol'
  drug_id INTEGER NOT NULL, -- FK to ref_treatments where type='drug'
  FOREIGN KEY(protocol_id) REFERENCES ref_treatments(id) ON DELETE CASCADE,
  FOREIGN KEY(drug_id) REFERENCES ref_treatments(id) ON DELETE CASCADE,
  UNIQUE(protocol_id, drug_id) -- Prevent duplicate mappings
);

CREATE INDEX idx_treatment_components_protocol ON ref_treatment_components(protocol_id);
CREATE INDEX idx_treatment_components_drug ON ref_treatment_components(drug_id);

-- Junction Table: Treatments
-- Links studies to treatments (both protocols and individual drugs)
CREATE TABLE treatments (
  id INTEGER PRIMARY KEY,
  study_id INTEGER NOT NULL,
  treatment_id INTEGER NOT NULL, -- FK to ref_treatments
  FOREIGN KEY(study_id) REFERENCES studies(id) ON DELETE CASCADE,
  FOREIGN KEY(treatment_id) REFERENCES ref_treatments(id) ON DELETE CASCADE
);

CREATE INDEX idx_treatments_study ON treatments(study_id);
CREATE INDEX idx_treatments_treatment ON treatments(treatment_id);

-- ==========================================
-- SEED DATA: Common AML/ALL Treatments
-- ==========================================

-- Individual Drugs (alphabetical)
INSERT INTO ref_treatments (code, name, type, display_order) VALUES 
('ASPARAGINASE', 'Asparaginase', 'drug', 100),
('AZACITIDINE', 'Azacitidine', 'drug', 101),
('BLINATUMOMAB', 'Blinatumomab', 'drug', 102),
('CYCLOPHOSPHAMIDE', 'Cyclophosphamide', 'drug', 103),
('CYTARABINE', 'Cytarabine (Ara-C)', 'drug', 104),
('DAUNORUBICIN', 'Daunorubicin', 'drug', 105),
('DECITABINE', 'Decitabine', 'drug', 106),
('DEXAMETHASONE', 'Dexamethasone', 'drug', 107),
('DOXORUBICIN', 'Doxorubicin', 'drug', 108),
('ENASIDENIB', 'Enasidenib', 'drug', 109),
('FLUDARABINE', 'Fludarabine', 'drug', 110),
('G-CSF', 'G-CSF (Filgrastim)', 'drug', 111),
('GEMTUZUMAB', 'Gemtuzumab Ozogamicin (GO)', 'drug', 112),
('GILTERITINIB', 'Gilteritinib', 'drug', 113),
('GLASDEGIB', 'Glasdegib', 'drug', 114),
('IDARUBICIN', 'Idarubicin', 'drug', 115),
('IMATINIB', 'Imatinib', 'drug', 116),
('INOTUZUMAB', 'Inotuzumab Ozogamicin', 'drug', 117),
('IVOSIDENIB', 'Ivosidenib', 'drug', 118),
('MERCAPTOPURINE', 'Mercaptopurine (6-MP)', 'drug', 119),
('METHOTREXATE', 'Methotrexate', 'drug', 120),
('MIDOSTAURIN', 'Midostaurin', 'drug', 121),
('MITOXANTRONE', 'Mitoxantrone', 'drug', 122),
('PREDNISONE', 'Prednisone', 'drug', 123),
('QUIZARTINIB', 'Quizartinib', 'drug', 124),
('VENETOCLAX', 'Venetoclax', 'drug', 125),
('VINCRISTINE', 'Vincristine', 'drug', 126),
('VORINOSTAT', 'Vorinostat', 'drug', 127);

-- Treatment Protocols (with display_order to appear first)
INSERT INTO ref_treatments (code, name, type, description, display_order) VALUES 
('7+3', '7+3 Induction', 'protocol', 'Cytarabine (7 days) + Anthracycline (3 days)', 1),
('FLAG-IDA', 'FLAG-IDA', 'protocol', 'Fludarabine + Cytarabine + G-CSF + Idarubicin', 2),
('CLAG', 'CLAG', 'protocol', 'Cladribine + Cytarabine + G-CSF', 3),
('CLAG-M', 'CLAG-M', 'protocol', 'Cladribine + Cytarabine + G-CSF + Mitoxantrone', 4),
('MEC', 'MEC', 'protocol', 'Mitoxantrone + Etoposide + Cytarabine', 5),
('HiDAC', 'HiDAC', 'protocol', 'High-Dose Cytarabine', 6),
('VEN-AZA', 'Venetoclax-Azacitidine', 'protocol', 'Venetoclax + Azacitidine', 7),
('VEN-LDAC', 'Venetoclax-LDAC', 'protocol', 'Venetoclax + Low-Dose Cytarabine', 8),
('HYPERCVAD', 'HyperCVAD', 'protocol', 'Cyclophosphamide + Vincristine + Doxorubicin + Dexamethasone (alternating with high-dose MTX/Ara-C)', 9),
('CPX-351', 'CPX-351 (Vyxeos)', 'protocol', 'Liposomal Cytarabine-Daunorubicin', 10);

-- ==========================================
-- PROTOCOL-DRUG MAPPINGS
-- ==========================================

-- 7+3: Cytarabine + Daunorubicin (or Idarubicin)
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = '7+3' AND d.code IN ('CYTARABINE', 'DAUNORUBICIN');

-- FLAG-IDA: Fludarabine + Cytarabine + G-CSF + Idarubicin
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'FLAG-IDA' AND d.code IN ('FLUDARABINE', 'CYTARABINE', 'G-CSF', 'IDARUBICIN');

-- CLAG: Cladribine + Cytarabine + G-CSF
-- Note: Cladribine not in drug list yet, only including Cytarabine + G-CSF
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'CLAG' AND d.code IN ('CYTARABINE', 'G-CSF');

-- CLAG-M: Cladribine + Cytarabine + G-CSF + Mitoxantrone
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'CLAG-M' AND d.code IN ('CYTARABINE', 'G-CSF', 'MITOXANTRONE');

-- MEC: Mitoxantrone + Etoposide + Cytarabine
-- Note: Etoposide not in drug list yet, only including Mitoxantrone + Cytarabine
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'MEC' AND d.code IN ('MITOXANTRONE', 'CYTARABINE');

-- HiDAC: High-Dose Cytarabine
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'HiDAC' AND d.code = 'CYTARABINE';

-- VEN-AZA: Venetoclax + Azacitidine
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'VEN-AZA' AND d.code IN ('VENETOCLAX', 'AZACITIDINE');

-- VEN-LDAC: Venetoclax + Low-Dose Cytarabine
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'VEN-LDAC' AND d.code IN ('VENETOCLAX', 'CYTARABINE');

-- HyperCVAD: Cyclophosphamide + Vincristine + Doxorubicin + Dexamethasone + Methotrexate + Cytarabine
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'HYPERCVAD' AND d.code IN ('CYCLOPHOSPHAMIDE', 'VINCRISTINE', 'DOXORUBICIN', 'DEXAMETHASONE', 'METHOTREXATE', 'CYTARABINE');

-- CPX-351: Cytarabine + Daunorubicin (liposomal formulation)
INSERT INTO ref_treatment_components (protocol_id, drug_id)
SELECT p.id, d.id FROM ref_treatments p, ref_treatments d
WHERE p.code = 'CPX-351' AND d.code IN ('CYTARABINE', 'DAUNORUBICIN');
