
export interface ExtractedMetadata {
    mutations: string[];
    topics: string[];
    diseaseSubtypes: string[];
    treatments: string[]; // Treatment codes from ref_treatments
    hasComplexKaryotype: boolean;
    transplantContext: boolean;
}

/**
 * MUTATION_PATTERNS - Comprehensive gene mutation detection
 * 
 * Based on ELN 2022 (AML risk stratification) and WHO 2022 (ALL classification) standards.
 * See schema_mutations.sql for the complete reference ontology.
 * 
 * Categories:
 * - ELN Favorable: NPM1, CEBPA
 * - ELN Intermediate: FLT3 (ITD/TKD)
 * - ELN Adverse/MDS-related: TP53, ASXL1, BCOR, EZH2, RUNX1, SF3B1, SRSF2, STAG2, U2AF1, ZRSR2
 * - Fusion genes: BCR-ABL1, PML-RARA, RUNX1-RUNX1T1, CBFB-MYH11, KMT2A, etc.
 * - Kinase/Signaling: KIT, JAK2, KRAS, NRAS, BRAF, CBL, NF1, PTPN11
 * - Epigenetic: DNMT3A, TET2, IDH1, IDH2, KDM6A
 * - Transcription Factors: GATA2, WT1, ETV6, IKZF1, PAX5
 * - ALL-specific: NOTCH1, FBXW7, CRLF2, TAL1, TLX1, TLX3
 */
const MUTATION_PATTERNS: Record<string, RegExp> = {
    // ==========================================
    // ELN 2022 FAVORABLE RISK
    // ==========================================
    "NPM1": /\bNPM1\b/i,
    "CEBPA": /\bC?EBP[- ]?A\b/i,

    // ==========================================
    // ELN 2022 INTERMEDIATE RISK
    // ==========================================
    "FLT3": /\bFLT3\b(?![- ]?(ITD|TKD))/i,  // FLT3 without ITD/TKD suffix
    "FLT3-ITD": /\bFLT3[- ]?ITD\b/i,
    "FLT3-TKD": /\bFLT3[- ]?TKD\b/i,

    // ==========================================
    // ELN 2022 ADVERSE RISK / MDS-RELATED
    // ==========================================
    "TP53": /\bTP53\b/i,
    "ASXL1": /\bASXL1\b/i,
    "BCOR": /\bBCOR\b(?!L)/i,  // BCOR but not BCORL1
    "EZH2": /\bEZH2\b/i,
    "RUNX1": /\bRUNX1\b(?![- ]?(RUNX1T1|T1))/i,  // RUNX1 but not fusion
    "SF3B1": /\bSF3B1\b/i,
    "SRSF2": /\bSRSF2\b/i,
    "STAG2": /\bSTAG2\b/i,
    "U2AF1": /\bU2AF1\b/i,
    "ZRSR2": /\bZRSR2\b/i,

    // ==========================================
    // FUSION GENES
    // ==========================================
    "BCR-ABL1": /\bBCR[- ]?ABL1?\b/i,
    "PML-RARA": /\bPML[- ]?RARA\b/i,
    "RUNX1-RUNX1T1": /\b(RUNX1[- ]?RUNX1T1|AML1[- ]?ETO|t\(8;21\))\b/i,
    "CBFB-MYH11": /\b(CBFB[- ]?MYH11|inv\(16\)|t\(16;16\))\b/i,
    "KMT2A": /\b(KMT2A|MLL)[- ]?(rearranged|r|fusion)?\b/i,
    "DEK-NUP214": /\b(DEK[- ]?NUP214|t\(6;9\))\b/i,
    "MECOM": /\b(MECOM|EVI1)[- ]?(rearranged|r)?\b/i,
    "NUP98": /\bNUP98[- ]?(rearranged|r|fusion|NSD1|HOXA9)?\b/i,
    "ETV6-RUNX1": /\b(ETV6[- ]?RUNX1|TEL[- ]?AML1|t\(12;21\))\b/i,
    "TCF3-PBX1": /\b(TCF3[- ]?PBX1|E2A[- ]?PBX1|t\(1;19\))\b/i,
    "TCF3-HLF": /\b(TCF3[- ]?HLF|E2A[- ]?HLF|t\(17;19\))\b/i,

    // ==========================================
    // KINASE/SIGNALING PATHWAY
    // ==========================================
    "KIT": /\bKIT\b/i,
    "JAK2": /\bJAK2\b/i,
    "MPL": /\bMPL\b/i,
    "CALR": /\bCALR\b/i,
    "KRAS": /\bKRAS\b/i,
    "NRAS": /\bNRAS\b/i,
    "BRAF": /\bBRAF\b/i,
    "CBL": /\bCBL\b/i,
    "NF1": /\bNF1\b/i,
    "PTPN11": /\bPTPN11\b/i,
    "CSF3R": /\bCSF3R\b/i,

    // ==========================================
    // EPIGENETIC MODIFIERS
    // ==========================================
    "DNMT3A": /\bDNMT3A\b/i,
    "TET2": /\bTET2\b/i,
    "IDH1": /\bIDH1\b/i,
    "IDH2": /\bIDH2\b/i,
    "KDM6A": /\bKDM6A\b/i,
    "SETBP1": /\bSETBP1\b/i,

    // ==========================================
    // TRANSCRIPTION FACTORS
    // ==========================================
    "GATA2": /\bGATA2\b/i,
    "WT1": /\bWT1\b/i,
    "ETV6": /\bETV6\b(?![- ]?RUNX1)/i,  // ETV6 but not fusion
    "PHF6": /\bPHF6\b/i,
    "IKZF1": /\bIKZF1\b/i,
    "PAX5": /\bPAX5\b/i,
    "CREBBP": /\bCREBBP\b/i,

    // ==========================================
    // ALL-SPECIFIC
    // ==========================================
    "NOTCH1": /\bNOTCH1\b/i,
    "FBXW7": /\bFBXW7\b/i,
    "CRLF2": /\bCRLF2\b/i,
    "IL7R": /\bIL7R\b/i,
    "CDKN2A": /\bCDKN2A\b/i,
    "CDKN2B": /\bCDKN2B\b/i,
    "RB1": /\bRB1\b/i,

    // ==========================================
    // ADDITIONAL ELN 2022 RECOMMENDED
    // ==========================================
    "ANKRD26": /\bANKRD26\b/i,
    "BCORL1": /\bBCORL1\b/i,
    "DDX41": /\bDDX41\b/i,
    "PPM1D": /\bPPM1D\b/i,
    "RAD21": /\bRAD21\b/i,
    "SMC1A": /\bSMC1A\b/i,
    "SMC3": /\bSMC3\b/i,

    // ==========================================
    // T-ALL SPECIFIC
    // ==========================================
    "TAL1": /\bTAL1\b/i,
    "TLX1": /\bTLX1\b/i,
    "TLX3": /\bTLX3\b/i,
    "LMO1": /\bLMO1\b/i,
    "LMO2": /\bLMO2\b/i,
    "PTEN": /\bPTEN\b/i
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
export async function extractMetadataAI(text: string, ai: any): Promise<ExtractedMetadata> {
    const prompt = `
Extract clinical metadata related to Leukemia from the following medical abstract. 
Return ONLY a valid JSON object with the following fields:
- mutations: array of gene symbols (e.g. ["FLT3", "NPM1"])
- topics: array of research topics (e.g. ["NGS", "Immunotherapy", "Clinical Trial"])
- diseaseSubtypes: array of leukemia types (e.g. ["AML", "ALL"])
- treatments: array of treatment names or protocol codes (e.g. ["7+3", "Venetoclax"])
- hasComplexKaryotype: boolean (true if complex karyotype/cytogenetics mentioned)
- transplantContext: boolean (true if stem cell/bone marrow transplant mentioned)

Abstract:
"${text}"

JSON:`;

    try {
        const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: 'You are a specialized medical data extractor focused on hematology/oncology.' },
                { role: 'user', content: prompt }
            ]
        });

        const resultText = response.response || response;
        // Basic JSON extraction in case the model adds conversational filler
        const jsonMatch = resultText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Normalize and validate
            return {
                mutations: Array.isArray(parsed.mutations) ? parsed.mutations.map((m: any) => String(m).toUpperCase()) : [],
                topics: Array.isArray(parsed.topics) ? parsed.topics.map((t: any) => String(t)) : [],
                diseaseSubtypes: Array.isArray(parsed.diseaseSubtypes) ? parsed.diseaseSubtypes.map((s: any) => String(s).toUpperCase()) : [],
                treatments: Array.isArray(parsed.treatments) ? parsed.treatments.map((tr: any) => String(tr).toUpperCase()) : [],
                hasComplexKaryotype: !!parsed.hasComplexKaryotype,
                transplantContext: !!parsed.transplantContext
            };
        }
    } catch (e: any) {
        console.error('AI extraction failed, falling back to regex:', e.message);
    }

    // Fallback to regex parser
    return extractMetadata(text);
}
