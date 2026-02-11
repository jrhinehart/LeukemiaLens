import React from 'react';

// ─── MDS Deep Dive Educational Content ────────────────────────────
const MDSDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: Understanding Ineffective Hematopoiesis */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-violet-600">🔬</span> Ineffective Hematopoiesis — The Core Problem
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                MDS is fundamentally different from most cancers. Rather than cells growing out of control, the
                hallmark of MDS is <strong>ineffective hematopoiesis</strong> — the bone marrow is active (often
                hypercellular) but produces <strong>defective blood cells that die before they mature</strong>.
                This paradox — a busy marrow but low blood counts — is the defining feature of the disease.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">🩸 Red Blood Cells</h4>
                    <p className="text-sm text-red-700 mb-2">
                        <strong>Anemia</strong> is the most common presentation, affecting ~80-90% of MDS patients.
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 pl-4">
                        <li>• Fatigue, weakness, shortness of breath</li>
                        <li>• Dysplastic features: <strong>ring sideroblasts</strong>, multinucleated erythroid precursors, megaloblastic changes</li>
                        <li>• Many patients become <strong>transfusion dependent</strong></li>
                    </ul>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">🛡️ White Blood Cells</h4>
                    <p className="text-sm text-amber-700 mb-2">
                        <strong>Neutropenia</strong> and dysfunctional granulocytes increase infection risk.
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1 pl-4">
                        <li>• Hypolobulated or hypogranular neutrophils ("pseudo-Pelger-Huët")</li>
                        <li>• Impaired bactericidal function even at normal counts</li>
                        <li>• Infections are a <strong>leading cause of death</strong> in MDS</li>
                    </ul>
                </div>
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-purple-800 mb-2">🩹 Platelets</h4>
                    <p className="text-sm text-purple-700 mb-2">
                        <strong>Thrombocytopenia</strong> causes bleeding risk in ~40-60% of patients.
                    </p>
                    <ul className="text-sm text-purple-700 space-y-1 pl-4">
                        <li>• Large, abnormal platelets with poor function</li>
                        <li>• Micromegakaryocytes (abnormally small megakaryocytes in marrow)</li>
                        <li>• Bruising, petechiae, mucosal bleeding</li>
                    </ul>
                </div>
            </div>

            <div className="bg-violet-50 p-5 rounded-xl border border-violet-100">
                <h4 className="font-bold text-violet-900 mb-2">💡 Why "Syndromes" (Plural)?</h4>
                <p className="text-sm text-violet-800">
                    MDS is not a single disease but a <strong>heterogeneous group of disorders</strong> ranging from
                    indolent conditions with isolated anemia (survival &gt;10 years) to aggressive forms with excess
                    blasts that behave nearly like AML (survival &lt;1 year). The plural "syndromes" reflects this
                    enormous clinical variability — treatment decisions are heavily individualized.
                </p>
            </div>
        </section>

        {/* Section 2: WHO/ICC Classification */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">📋</span> MDS Classification (WHO 2022 / ICC)
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                The 2022 WHO and ICC classifications revised MDS extensively. Key subtypes are defined by
                <strong> blast percentage, lineage dysplasia, cytogenetics,</strong> and <strong>specific genetic
                    mutations</strong>. Some subtypes are now defined primarily by their genetics rather than
                morphology alone.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Key MDS Subtypes</h3>
            <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">LOWER RISK</span>
                        <h4 className="font-bold text-green-800">MDS with Low Blasts (MDS-LB)</h4>
                    </div>
                    <p className="text-sm text-green-700">
                        Blasts <strong>&lt;5%</strong> in marrow. Includes single-lineage and multi-lineage dysplasia.
                        This is the most common MDS subtype. Patients may live years with supportive care alone, but
                        quality of life is often impacted by transfusion dependence and fatigue.
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">LOWER RISK</span>
                        <h4 className="font-bold text-green-800">MDS with Ring Sideroblasts (MDS-RS)</h4>
                    </div>
                    <p className="text-sm text-green-700">
                        Characterized by <strong>≥15% ring sideroblasts</strong> (or ≥5% with an <strong>SF3B1 mutation</strong>).
                        Ring sideroblasts are red cell precursors with iron-laden mitochondria ringing the nucleus — visible
                        on Prussian blue stain. SF3B1-mutated MDS has the <strong>best prognosis</strong> of any MDS subtype
                        and responds well to <strong>luspatercept</strong>.
                    </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-xs font-bold">HIGHER RISK</span>
                        <h4 className="font-bold text-amber-800">MDS with Increased Blasts (MDS-IB)</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                        <strong>MDS-IB1</strong>: 5-9% marrow blasts. <strong>MDS-IB2</strong>: 10-19% marrow blasts.
                        Higher blast counts indicate <strong>increasing risk of AML transformation</strong>. MDS-IB2 is
                        sometimes treated similarly to AML, especially in younger/fit patients.
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">HIGH RISK</span>
                        <h4 className="font-bold text-red-800">MDS with Biallelic TP53 Inactivation (MDS-biTP53)</h4>
                    </div>
                    <p className="text-sm text-red-700">
                        A newly defined entity in 2022. Patients with <strong>two TP53 hits</strong> (mutation + deletion,
                        or two mutations) have an extremely poor prognosis regardless of blast count — median survival
                        ~9 months. Often associated with <strong>complex karyotype</strong> and therapy-related MDS.
                        Standard therapies have limited efficacy; clinical trials are strongly recommended.
                    </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs font-bold">DISTINCT</span>
                        <h4 className="font-bold text-blue-800">MDS with Isolated del(5q)</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                        Defined by an <strong>isolated deletion of the long arm of chromosome 5</strong>. Predominantly
                        affects older women. Presents with macrocytic anemia and often normal or increased platelet counts.
                        Uniquely responsive to <strong>lenalidomide</strong> — ~67% achieve transfusion independence,
                        and ~45% achieve cytogenetic remission.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 3: Genetics & Molecular Landscape */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-emerald-600">🧬</span> The Molecular Landscape of MDS
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Next-generation sequencing has revealed that MDS is driven by <strong>recurrent somatic mutations</strong>
                in a relatively small set of genes. These mutations fall into distinct functional categories and often
                <strong> co-occur in predictable patterns</strong>.
            </p>

            <div className="space-y-4 my-6">
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 mb-2">🧪 RNA Splicing Genes (~60% of MDS)</h4>
                    <p className="text-sm text-emerald-700 mb-2">
                        The most frequently mutated pathway in MDS. These mutations cause global splicing
                        abnormalities, producing dysfunctional proteins across many genes:
                    </p>
                    <ul className="text-sm text-emerald-700 space-y-1 pl-4">
                        <li>• <strong>SF3B1</strong> (~25-30%) — associated with ring sideroblasts and favorable prognosis</li>
                        <li>• <strong>SRSF2</strong> (~10-15%) — often co-occurs with TET2; associated with intermediate/poor prognosis</li>
                        <li>• <strong>U2AF1</strong> (~8-10%) — associated with del(20q) and higher risk of AML transformation</li>
                        <li>• <strong>ZRSR2</strong> (~5%) — X-linked; more common in males</li>
                    </ul>
                    <p className="text-xs text-emerald-600 mt-2 italic">
                        Splicing mutations are mutually exclusive — only one is present per patient — suggesting they affect
                        overlapping pathways.
                    </p>
                </div>
                <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
                    <h4 className="font-bold text-sky-800 mb-2">🔄 Epigenetic Regulators (~50%)</h4>
                    <p className="text-sm text-sky-700 mb-2">
                        These genes control DNA methylation and chromatin modification — how genes are turned on and off:
                    </p>
                    <ul className="text-sm text-sky-700 space-y-1 pl-4">
                        <li>• <strong>TET2</strong> (~20-25%) — DNA demethylation; loss causes hypermethylation of tumor suppressors</li>
                        <li>• <strong>DNMT3A</strong> (~10-15%) — DNA methyltransferase; one of the earliest mutations in clonal hematopoiesis</li>
                        <li>• <strong>IDH1/2</strong> (~5%) — produces oncometabolite 2-HG; targetable with ivosidenib/enasidenib</li>
                        <li>• <strong>ASXL1</strong> (~15-20%) — chromatin modifier; associated with adverse prognosis</li>
                        <li>• <strong>EZH2</strong> (~5%) — polycomb repressive complex; loss-of-function in MDS</li>
                    </ul>
                    <p className="text-xs text-sky-600 mt-2 italic">
                        Hypomethylating agents (azacitidine, decitabine) work by reversing the abnormal DNA methylation
                        caused by these mutations — explaining why they are effective even without specific molecular targeting.
                    </p>
                </div>
                <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">⚠️ Tumor Suppressors & Signaling</h4>
                    <ul className="text-sm text-rose-700 space-y-2 pl-4">
                        <li>• <strong>TP53</strong> (~8-10%) — biallelic inactivation defines a distinct, high-risk subtype. Associated with complex karyotype and therapy-related MDS</li>
                        <li>• <strong>RUNX1</strong> (~10%) — transcription factor critical for hematopoiesis; mutations increase AML transformation risk</li>
                        <li>• <strong>STAG2, RAD21</strong> — cohesin complex components; affect chromosome segregation and gene regulation</li>
                        <li>• <strong>NRAS, KRAS, CBL</strong> — RAS pathway activation; often acquired during disease progression</li>
                    </ul>
                </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-900 mb-2">📊 CHIP → CCUS → MDS: The Clonal Continuum</h4>
                <p className="text-sm text-indigo-800">
                    MDS often evolves from precursor states: <strong>CHIP</strong> (Clonal Hematopoiesis of Indeterminate
                    Potential) — mutations detected without any blood count abnormalities, present in ~10% of adults
                    &gt;65 — may progress to <strong>CCUS</strong> (Clonal Cytopenia of Undetermined Significance) when
                    mild cytopenias appear, and eventually to overt MDS. The mutations driving CHIP (TET2, DNMT3A,
                    ASXL1) are the same founders of MDS, supporting a model of <strong>stepwise clonal evolution</strong>.
                </p>
            </div>
        </section>

        {/* Section 4: Risk Stratification (IPSS-M) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-orange-600">📊</span> Risk Stratification — IPSS-R & IPSS-M
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Because MDS ranges from indolent to aggressive, <strong>risk stratification</strong> is the most
                important step in treatment planning. Two main scoring systems are used:
            </p>

            <div className="space-y-4 my-6">
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-3">IPSS-R (Revised International Prognostic Scoring System)</h4>
                    <p className="text-sm text-orange-700 mb-3">
                        The established standard, using <strong>5 clinical variables</strong>:
                    </p>
                    <div className="bg-white rounded-lg border border-orange-200 overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-orange-100">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-orange-900">Variable</th>
                                    <th className="px-3 py-2 text-left font-semibold text-orange-900">What It Measures</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100">
                                <tr><td className="px-3 py-2 text-orange-800">Cytogenetics</td><td className="px-3 py-2 text-orange-700">Chromosomal abnormalities (5 risk groups)</td></tr>
                                <tr><td className="px-3 py-2 text-orange-800">Bone marrow blasts</td><td className="px-3 py-2 text-orange-700">Percentage of immature cells (0-2%, 2-5%, 5-10%, &gt;10%)</td></tr>
                                <tr><td className="px-3 py-2 text-orange-800">Hemoglobin</td><td className="px-3 py-2 text-orange-700">Severity of anemia</td></tr>
                                <tr><td className="px-3 py-2 text-orange-800">Platelet count</td><td className="px-3 py-2 text-orange-700">Severity of thrombocytopenia</td></tr>
                                <tr><td className="px-3 py-2 text-orange-800">ANC</td><td className="px-3 py-2 text-orange-700">Absolute neutrophil count (infection risk)</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-orange-600 mt-2">
                        Produces 5 risk categories: Very Low, Low, Intermediate, High, Very High.
                    </p>
                </div>

                <div className="bg-violet-50 p-5 rounded-xl border border-violet-100">
                    <h4 className="font-bold text-violet-800 mb-3">IPSS-M (Molecular International Prognostic Scoring System)</h4>
                    <p className="text-sm text-violet-700 mb-3">
                        Published in 2022, IPSS-M incorporates <strong>gene mutations</strong> alongside the IPSS-R variables.
                        It includes mutations in <strong>31 genes</strong> and produces a <strong>6-category risk</strong>
                        stratification. Key improvements:
                    </p>
                    <ul className="text-sm text-violet-700 space-y-1 pl-4">
                        <li>• <strong>~46% of patients</strong> are reclassified compared to IPSS-R — many to higher or lower risk</li>
                        <li>• <strong>SF3B1</strong> mutations lower the risk score (favorable)</li>
                        <li>• <strong>TP53 multi-hit, RUNX1, ASXL1, EZH2, NRAS</strong> increase the risk score (adverse)</li>
                        <li>• Available as a free online calculator at <strong>MDS-Foundation.org</strong></li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                    <h5 className="font-bold text-green-800 text-sm mb-1">Lower-Risk MDS</h5>
                    <p className="text-xs text-green-700">
                        IPSS-R Very Low / Low / some Intermediate<br />
                        Focus: <strong>quality of life</strong>, transfusion support, ESAs, luspatercept, lenalidomide (del(5q))
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                    <h5 className="font-bold text-red-800 text-sm mb-1">Higher-Risk MDS</h5>
                    <p className="text-xs text-red-700">
                        IPSS-R High / Very High / some Intermediate<br />
                        Focus: <strong>disease modification</strong>, HMAs (azacitidine), transplant evaluation, clinical trials
                    </p>
                </div>
            </div>
        </section>

        {/* Section 5: Treatment Landscape */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-teal-600">💊</span> The Treatment Landscape
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                MDS treatment is uniquely <strong>risk-adapted</strong>. Unlike most cancers where treatment aims
                to eliminate the disease, lower-risk MDS is often managed with supportive care and symptom relief,
                while higher-risk MDS is treated more aggressively to delay AML transformation.
            </p>

            <div className="space-y-4">
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">🩸 Supportive Care & Lower-Risk Therapies</h4>
                    <div className="space-y-3 mt-3">
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                            <h5 className="font-semibold text-teal-900 text-sm mb-1">Red Blood Cell Transfusions</h5>
                            <p className="text-xs text-teal-700">
                                The cornerstone of symptomatic management. However, chronic transfusions lead to
                                <strong> iron overload</strong> (hemochromatosis), which damages the heart, liver, and
                                endocrine organs. <strong>Iron chelation</strong> (deferasirox) is used in transfusion-dependent
                                lower-risk patients expected to survive long enough for iron to accumulate.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                            <h5 className="font-semibold text-teal-900 text-sm mb-1">ESAs & Luspatercept</h5>
                            <p className="text-xs text-teal-700">
                                <strong>Erythropoiesis-stimulating agents (ESAs)</strong> like epoetin alfa can reduce
                                transfusion needs in patients with low serum EPO levels. <strong>Luspatercept
                                    (Reblozyl®)</strong> — a first-in-class erythroid maturation agent — promotes late-stage
                                red cell differentiation via TGF-β superfamily inhibition. Particularly effective in
                                <strong>ring sideroblast / SF3B1-mutated MDS</strong>.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                            <h5 className="font-semibold text-teal-900 text-sm mb-1">Lenalidomide (del(5q) MDS)</h5>
                            <p className="text-xs text-teal-700">
                                Specifically effective in MDS with <strong>isolated del(5q)</strong>. Works by degrading
                                casein kinase 1α (CK1α), which is haploinsufficient due to the 5q deletion — selectively
                                killing the del(5q) clone. One of the best examples of synthetic lethality in clinical
                                oncology.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
                    <h4 className="font-bold text-sky-800 mb-2">⚗️ Higher-Risk MDS Therapies</h4>
                    <div className="space-y-3 mt-3">
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">Hypomethylating Agents (HMAs)</h5>
                            <p className="text-xs text-sky-700">
                                <strong>Azacitidine (Vidaza®)</strong> and <strong>decitabine (Dacogen®)</strong> are the
                                backbone of higher-risk MDS treatment. They reverse abnormal DNA methylation,
                                reactivating silenced tumor suppressor genes. Azacitidine improved overall survival
                                vs. conventional care in the landmark AZA-001 trial. Given as cycles (typically 7 days
                                per 28-day cycle) and require 4-6 cycles to assess response.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">Oral Decitabine/Cedazuridine (INQOVI®)</h5>
                            <p className="text-xs text-sky-700">
                                An oral formulation combining decitabine with cedazuridine (a CDA inhibitor that prevents
                                gut metabolism of decitabine). Provides equivalent exposure to IV decitabine with the
                                convenience of <strong>oral administration</strong> — a significant quality-of-life improvement.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">Allogeneic Stem Cell Transplant</h5>
                            <p className="text-xs text-sky-700">
                                The <strong>only potentially curative</strong> treatment for MDS. Typically reserved for
                                higher-risk patients who are young/fit enough (increasingly up to age 70-75 with reduced-
                                intensity conditioning). Decisions balance transplant-related mortality risk (~15-25%)
                                against the risk of disease progression.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mt-6">
                <h4 className="font-bold text-purple-900 mb-2">🔮 Emerging Therapies</h4>
                <p className="text-sm text-purple-800">
                    Active areas of MDS drug development include: <strong>imetelstat</strong> (telomerase inhibitor —
                    FDA approved for lower-risk transfusion-dependent MDS), <strong>IDH1/2 inhibitors</strong>
                    (ivosidenib/enasidenib for IDH-mutated MDS), <strong>magrolimab</strong> (anti-CD47 "don't eat
                    me" blocking antibody), and combinations of HMAs with <strong>venetoclax</strong> (BCL-2 inhibitor)
                    for higher-risk MDS.
                </p>
            </div>
        </section>

        {/* Section 6: MDS and AML — The Continuum */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">⚠️</span> MDS and AML — The Continuum
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Approximately <strong>30% of MDS patients</strong> will transform to AML over their disease course.
                The boundary between MDS and AML has historically been set at <strong>20% bone marrow blasts</strong>,
                but this somewhat arbitrary cutoff is being reconsidered.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">🔄 MDS → AML Transformation</h4>
                    <ul className="text-sm text-amber-700 space-y-2">
                        <li>• Often heralded by <strong>rising blast count</strong> and worsening cytopenias</li>
                        <li>• Acquisition of new mutations: <strong>NRAS/KRAS, FLT3, NPM1, RUNX1</strong></li>
                        <li>• "Secondary AML" (from prior MDS) is generally more resistant to chemotherapy than <em>de novo</em> AML</li>
                        <li>• Carries a <strong>worse prognosis</strong> than primary AML, partly due to unfavorable genetics and patient age</li>
                    </ul>
                </div>
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">📋 MDS/AML Overlap (WHO 2022)</h4>
                    <p className="text-sm text-blue-700 mb-2">
                        The 2022 WHO classification introduced <strong>"MDS/AML"</strong> as an entity for cases
                        with 10-19% blasts — acknowledging that these cases have biology intermediate between
                        MDS and AML. Key implications:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 pl-4">
                        <li>• Treatment may follow either MDS or AML protocols</li>
                        <li>• Clinical trials increasingly accept both MDS-IB2 and AML patients</li>
                        <li>• Decision depends on genetics, blast kinetics, and patient fitness</li>
                    </ul>
                </div>
            </div>

            <div className="bg-rose-50 p-5 rounded-xl border border-rose-100 mt-4">
                <h4 className="font-bold text-rose-900 mb-2">⚗️ Therapy-Related MDS (t-MDS)</h4>
                <p className="text-sm text-rose-800">
                    ~10-15% of MDS cases arise after prior <strong>chemotherapy or radiation</strong> for another
                    cancer. Therapy-related MDS typically presents with <strong>complex karyotype and TP53
                        mutations</strong>, has a median survival of only 6-12 months, and responds poorly to standard
                    therapies. Alkylating agents (after 5-7 year latency) and topoisomerase II inhibitors
                    (after 1-3 year latency) are the most common culprits.
                </p>
            </div>
        </section>

        {/* Section 7: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Authoritative MDS Resources
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                These trusted organizations provide comprehensive, up-to-date information about MDS:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://bloodcancerunited.org/blood-cancer/mds"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">Blood Cancer United — MDS</h4>
                    <p className="text-sm text-blue-600">Comprehensive MDS overview, diagnosis, and treatment information.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.mds-foundation.org"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-violet-50 rounded-xl border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-violet-800 group-hover:text-violet-900 mb-1">MDS Foundation</h4>
                    <p className="text-sm text-violet-600">Patient resources, IPSS-M calculator, and MDS Centers of Excellence.</p>
                    <span className="text-xs text-violet-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cancer.gov/types/myeloproliferative/patient/myelodysplastic-treatment-pdq"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-green-800 group-hover:text-green-900 mb-1">NCI — MDS Treatment (PDQ®)</h4>
                    <p className="text-sm text-green-600">Detailed treatment information reviewed by oncology experts.</p>
                    <span className="text-xs text-green-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.lls.org/myelodysplastic-syndromes"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-orange-800 group-hover:text-orange-900 mb-1">LLS — Myelodysplastic Syndromes</h4>
                    <p className="text-sm text-orange-600">Patient guides, caregiver support, and financial assistance programs.</p>
                    <span className="text-xs text-orange-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default MDSDeepDive;
