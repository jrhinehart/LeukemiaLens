
export interface ExtractedMetadata {
    mutations: string[];
    topics: string[];
    diseaseSubtypes: string[];
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

export function extractMetadata(text: string): ExtractedMetadata {
    const mutations: string[] = [];
    const topics: string[] = [];
    const diseaseSubtypes: string[] = [];

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
        hasComplexKaryotype,
        transplantContext
    };
}
