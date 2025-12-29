
export interface ExtractedMetadata {
    mutations: string[];
    topics: string[];
    diseaseSubtypes: string[];
    treatments: string[]; // Treatment codes from ref_treatments
    hasComplexKaryotype: boolean;
    transplantContext: boolean;
}

const MUTATION_PATTERNS: Record<string, RegExp> = {
    "FLT3": /\bFLT3\b/i,
    "NPM1": /\bNPM1\b/i,
    "IDH1": /\bIDH1\b/i,
    "IDH2": /\bIDH2\b/i,
    "TP53": /\bTP53\b/i,
    "KIT": /\bKIT\b/i,
    "CEBPA": /\bCEBPA\b/i,
    "RUNX1": /\bRUNX1\b/i,
    "ASXL1": /\bASXL1\b/i,
    "DNMT3A": /\bDNMT3A\b/i,
    "TET2": /\bTET2\b/i,
    "KRAS": /\bKRAS\b/i,
    "NRAS": /\bNRAS\b/i,
    "WT1": /\bWT1\b/i,
    "BCR-ABL1": /\bBCR[- ]?ABL1?\b/i,
    "PML-RARA": /\bPML[- ]?RARA\b/i,
    "SF3B1": /\bSF3B1\b/i,
    "GATA2": /\bGATA2\b/i
};

const TOPIC_PATTERNS: Record<string, RegExp> = {
    // Technology & Methods
    "Data Science/AI": /\b(Artificial Intelligence|Machine Learning|Deep Learning|Bioinformatics|Neural Network|Big Data|Data Science|AI|ML|Computational)\b/i,
    "Genomics": /\b(Next[- ]?Generation Sequencing|NGS|Whole[- ]?Genome Sequencing|WGS|RNA[- ]?Seq|Exome|Sequencing|Genomic)\b/i,
    "Proteomics": /\b(Proteomics?|Mass Spectrometry|Protein Expression|Phosphoproteom)\b/i,

    // Treatment Approaches
    "Cell Therapy": /\b(Cell Therapy|Stem Cell|HSCT|Bone Marrow Transplant|HSC|Hematopoietic)\b/i,
    "CAR-T": /\b(CAR-T|Chimeric Antigen|CART|CAR T[- ]?Cell)\b/i,
    "Immunotherapy": /\b(Immunotherapy|Checkpoint Inhibitor|PD-1|PD-L1|CTLA-4|Immune)\b/i,
    "Targeted Therapy": /\b(Targeted Therapy|Kinase Inhibitor|TKI|Small Molecule|Monoclonal Antibody)\b/i,
    "Chemotherapy": /\b(Chemotherapy|Cytarabine|Daunorubicin|Anthracycline|Induction|Consolidation)\b/i,

    // Clinical & Diagnostic
    "Clinical Trial": /\b(Clinical Trial|Phase [I|II|III]|Randomized|Double[- ]?Blind|RCT|Multicenter)\b/i,
    "MRD": /\b(Minimal Residual Disease|MRD|Flow Cytometry|PCR|Molecular Detection)\b/i,
    "Prognosis": /\b(Prognosis|Prognostic|Survival|Risk Stratification|Outcome|Relapse)\b/i,
    "Diagnosis": /\b(Diagnosis|Diagnostic|Biomarker|Detection|Screening)\b/i,

    // Biology & Mechanisms
    "Drug Resistance": /\b(Drug Resistance|Resistant|Refractory|Resistance Mechanism|Multi[- ]?Drug Resistance)\b/i,
    "Epigenetics": /\b(Epigenetic|DNA Methylation|Histone|Chromatin|DNMT|TET)\b/i,
    "Metabolism": /\b(Metabolism|Metabolic|Metabolomics|IDH|Glycolysis|Oxidative)\b/i,
};

// Treatment Patterns - Protocols and Individual Drugs
const TREATMENT_PATTERNS: Record<string, RegExp> = {
    // Protocol Patterns (more specific patterns to avoid false positives)
    "7+3": /\b(7\+3|seven plus three|7 \+ 3)\b/i,
    "FLAG-IDA": /\bFLAG[- ]?IDA\b/i,
    "CLAG": /\bCLAG\b(?![- ]?M)/i, // Match CLAG but not CLAG-M
    "CLAG-M": /\bCLAG[- ]?M\b/i,
    "MEC": /\b(MEC|mitoxantrone[- ]?etoposide[- ]?cytarabine)\b/i,
    "HiDAC": /\b(HiDAC|high[- ]?dose (ara[- ]?c|cytarabine))\b/i,
    "VEN-AZA": /\b(venetoclax[- ]?(azacitidine|aza)|VEN[- ]?AZA)\b/i,
    "VEN-LDAC": /\b(venetoclax[- ]?(LDAC|low[- ]?dose (ara[- ]?c|cytarabine))|VEN[- ]?LDAC)\b/i,
    "HYPERCVAD": /\b(hyper[- ]?CVAD|hyperCVAD)\b/i,
    "CPX-351": /\b(CPX[- ]?351|Vyxeos)\b/i,

    // Individual Drug Patterns
    "ASPARAGINASE": /\b(asparaginase|L[- ]?asparaginase)\b/i,
    "AZACITIDINE": /\b(azacitidine|vidaza|5[- ]?azacitidine)\b/i,
    "BLINATUMOMAB": /\bblinatumomab\b/i,
    "CYCLOPHOSPHAMIDE": /\bcyclophosphamide\b/i,
    "CYTARABINE": /\b(cytarabine|ara[- ]?c|cytosine arabinoside)\b/i,
    "DAUNORUBICIN": /\bdaunorubicin\b/i,
    "DECITABINE": /\b(decitabine|dacogen)\b/i,
    "DEXAMETHASONE": /\bdexamethasone\b/i,
    "DOXORUBICIN": /\b(doxorubicin|adriamycin)\b/i,
    "ENASIDENIB": /\b(enasidenib|idhifa)\b/i,
    "FLUDARABINE": /\b(fludarabine|fludara)\b/i,
    "G-CSF": /\b(G[- ]?CSF|filgrastim|neupogen|granulocyte[- ]?colony[- ]?stimulating[- ]?factor)\b/i,
    "GEMTUZUMAB": /\b(gemtuzumab( ozogamicin)?|mylotarg|GO)\b/i,
    "GILTERITINIB": /\b(gilteritinib|xospata)\b/i,
    "GLASDEGIB": /\b(glasdegib|daurismo)\b/i,
    "IDARUBICIN": /\bidarubicin\b/i,
    "IMATINIB": /\b(imatinib|gleevec)\b/i,
    "INOTUZUMAB": /\b(inotuzumab( ozogamicin)?|besponsa)\b/i,
    "IVOSIDENIB": /\b(ivosidenib|tibsovo)\b/i,
    "MERCAPTOPURINE": /\b(mercaptopurine|6[- ]?MP|purinethol)\b/i,
    "METHOTREXATE": /\b(methotrexate|MTX)\b/i,
    "MIDOSTAURIN": /\b(midostaurin|rydapt)\b/i,
    "MITOXANTRONE": /\bmitoxantrone\b/i,
    "PREDNISONE": /\bprednisone\b/i,
    "QUIZARTINIB": /\b(quizartinib|vanflyta)\b/i,
    "VENETOCLAX": /\b(venetoclax|venclexta)\b/i,
    "VINCRISTINE": /\bvincristine\b/i,
    "VORINOSTAT": /\b(vorinostat|zolinza)\b/i,
};

export function extractMetadata(text: string): ExtractedMetadata {
    const mutations: string[] = [];
    const topics: string[] = [];
    const diseaseSubtypes: string[] = [];
    const treatments: string[] = [];

    // Extract Mutations
    for (const [gene, pattern] of Object.entries(MUTATION_PATTERNS)) {
        if (pattern.test(text)) {
            mutations.push(gene);
        }
    }

    // Extract Topics (tags)
    for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
        if (pattern.test(text)) {
            topics.push(topic);
        }
    }

    // Extract Treatments (protocols and drugs)
    for (const [treatmentCode, pattern] of Object.entries(TREATMENT_PATTERNS)) {
        if (pattern.test(text)) {
            treatments.push(treatmentCode);
        }
    }

    // Extract Disease Subtypes
    if (/\b(AML|Acute Myeloid Leukemia)\b/i.test(text)) {
        diseaseSubtypes.push("AML");
    }
    if (/\b(CML|Chronic Myeloid Leukemia)\b/i.test(text)) {
        diseaseSubtypes.push("CML");
    }
    if (/\b(ALL|Acute Lymphoblastic Leukemia)\b/i.test(text)) {
        diseaseSubtypes.push("ALL");
    }
    if (/\b(CLL|Chronic Lymphocytic Leukemia)\b/i.test(text)) {
        diseaseSubtypes.push("CLL");
    }
    if (/\b(MDS|Myelodysplastic Syndromes?)\b/i.test(text)) {
        diseaseSubtypes.push("MDS");
    }

    // Extract Complex Karyotype
    const hasComplexKaryotype = /\b(complex karyotype|complex cytogenetics)\b/i.test(text) ||
        /(>=|greater than or equal to)\s*3\s*abnormalities/i.test(text);

    // Extract Transplant Context
    const transplantContext = /\b(HSCT|stem cell transplant|bone marrow transplant|allogeneic|autologous)\b/i.test(text);

    return {
        mutations,
        topics,
        diseaseSubtypes,
        treatments,
        hasComplexKaryotype,
        transplantContext
    };
}
