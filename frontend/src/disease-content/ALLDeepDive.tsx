import React from 'react';
import allDifferentiation from '../assets/all-differentiation.png';

// ─── ALL Deep Dive Educational Content ────────────────────────────
const ALLDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: The Lymphoid Lineage In Depth */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">🔷</span> The Lymphoid Lineage — In Depth
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                To understand ALL, it helps to know how normal lymphoid blood cells develop. All blood cells originate from
                <strong> hematopoietic stem cells (HSCs)</strong> in the bone marrow. These stem cells first commit to one of
                two main lineages: <strong>myeloid</strong> or <strong>lymphoid</strong>. ALL specifically affects the lymphoid lineage.
            </p>

            <div className="my-8 bg-blue-50 rounded-xl border border-blue-100 p-6 flex flex-col items-center">
                <img
                    src={allDifferentiation}
                    alt="Lymphoid Differentiation Map"
                    className="max-w-full h-auto rounded-lg shadow-sm mb-4"
                />
                <p className="text-sm text-blue-700 text-center italic">
                    Figure 1: The lymphoid differentiation cascade. ALL occurs when lymphoblasts (precursors)
                    fail to mature and begin multiplying uncontrollably.
                </p>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">The Lymphoid Differentiation Cascade</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Lymphoid differentiation begins when the HSC becomes a <strong>Common Lymphoid Progenitor (CLP)</strong>,
                which then branches into three key cell types essential for adaptive and innate immunity:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">B-Cell Lineage</h4>
                    <p className="text-sm text-blue-700 mb-2">
                        The most commonly affected lineage in ALL (~85% of cases):
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 pl-4">
                        <li>• <strong>Pro-B cells</strong> — earliest committed B-cell precursors; begin immunoglobulin gene rearrangement</li>
                        <li>• <strong>Pre-B cells</strong> — express cytoplasmic μ heavy chain; undergoing light chain rearrangement</li>
                        <li>• <strong>Immature B cells</strong> — express surface IgM; undergo self-tolerance testing</li>
                        <li>• <strong>Mature B cells → Plasma cells</strong> — produce antibodies; key to humoral immunity</li>
                    </ul>
                </div>
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">T-Cell Lineage</h4>
                    <p className="text-sm text-teal-700 mb-2">
                        Accounts for ~15% of ALL cases; precursors migrate to the thymus for maturation:
                    </p>
                    <ul className="text-sm text-teal-700 space-y-1 pl-4">
                        <li>• <strong>Thymocytes</strong> — progenitors that undergo positive and negative selection in the thymus</li>
                        <li>• <strong>CD4+ Helper T cells</strong> — coordinate immune responses by signaling other immune cells</li>
                        <li>• <strong>CD8+ Cytotoxic T cells</strong> — directly kill virus-infected or cancerous cells</li>
                        <li>• <strong>Regulatory T cells</strong> — prevent autoimmunity by suppressing excess immune activity</li>
                    </ul>
                </div>
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-purple-800 mb-2">NK Cell Lineage</h4>
                    <p className="text-sm text-purple-700 mb-2">
                        Natural Killer cells bridge innate and adaptive immunity:
                    </p>
                    <ul className="text-sm text-purple-700 space-y-1 pl-4">
                        <li>• <strong>NK cells</strong> — rapidly kill abnormal cells without prior sensitization</li>
                        <li>• <strong>Tumor surveillance</strong> — recognize and destroy cells lacking MHC-I molecules</li>
                        <li>• <strong>Viral defense</strong> — provide early defense before adaptive immunity activates</li>
                        <li>• <strong>NK/T-cell ALL</strong> — rare but recognized subtype</li>
                    </ul>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Growth Factors That Drive Lymphoid Differentiation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Each step of lymphoid differentiation is guided by specific <strong>cytokines</strong> and <strong>growth factors</strong>.
                These signals tell progenitor cells which type of lymphocyte to become:
            </p>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Growth Factor</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Full Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Primary Role</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">IL-7</td>
                            <td className="px-4 py-3 text-gray-700">Interleukin-7</td>
                            <td className="px-4 py-3 text-gray-700">Essential for B-cell and T-cell development; survival signal for lymphoid progenitors</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">IL-2</td>
                            <td className="px-4 py-3 text-gray-700">Interleukin-2</td>
                            <td className="px-4 py-3 text-gray-700">T-cell growth and activation; promotes regulatory T-cell maintenance</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">IL-15</td>
                            <td className="px-4 py-3 text-gray-700">Interleukin-15</td>
                            <td className="px-4 py-3 text-gray-700">NK cell development and survival; memory T-cell maintenance</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">IL-3</td>
                            <td className="px-4 py-3 text-gray-700">Interleukin-3</td>
                            <td className="px-4 py-3 text-gray-700">Multi-lineage growth factor; supports early progenitor survival</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">SCF</td>
                            <td className="px-4 py-3 text-gray-700">Stem Cell Factor (c-KIT ligand)</td>
                            <td className="px-4 py-3 text-gray-700">Early lymphoid progenitor survival and proliferation</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-sm text-gray-500 mt-3 italic">
                💡 IL-7 signaling is particularly important in ALL biology — aberrant IL-7 receptor signaling is found in some
                T-ALL cases and is being explored as a therapeutic target.
            </p>
        </section>

        {/* Section 2: What Are Lymphoblasts? */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🔬</span> What Are Lymphoblasts?
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                <strong>Lymphoblasts</strong> are <strong>immature lymphoid precursor cells</strong> — the earliest identifiable cells
                in the lymphoid differentiation cascade. In ALL, these cells are frozen at an immature stage and accumulate
                uncontrollably, unable to mature into functional lymphocytes.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Normal vs. Leukemic Lymphoblasts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-800 mb-2">✅ Normal Lymphoblasts</h4>
                    <ul className="text-sm text-green-700 space-y-2">
                        <li>• Comprise <strong>&lt;5%</strong> of bone marrow cells</li>
                        <li>• Rapidly differentiate into mature B-cells, T-cells, or NK cells</li>
                        <li>• Respond to normal cytokine signals (IL-7, IL-2)</li>
                        <li>• Undergo apoptosis when not needed or self-reactive</li>
                    </ul>
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">⚠️ Leukemic Lymphoblasts</h4>
                    <ul className="text-sm text-red-700 space-y-2">
                        <li>• Accumulate to <strong>≥20-25%</strong> of marrow (the diagnostic threshold for ALL)</li>
                        <li>• <strong>Maturation arrest</strong>: proliferate but fail to become functional lymphocytes</li>
                        <li>• Acquire proliferative and survival advantages through genetic mutations</li>
                        <li>• Resist apoptosis and evade normal immune surveillance</li>
                    </ul>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">How Lymphoblasts Are Identified</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Pathologists use multiple complementary techniques to identify and classify lymphoblasts:
            </p>
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">🔎 Morphology (Under the Microscope)</h4>
                    <p className="text-sm text-gray-700">
                        Lymphoblasts are typically <strong>small to medium-sized cells</strong> with a <strong>high nuclear-to-cytoplasmic
                            ratio</strong>, <strong>condensed chromatin</strong>, <strong>inconspicuous nucleoli</strong>, and
                        <strong> scant agranular cytoplasm</strong>. Unlike myeloblasts, lymphoblasts <strong>lack Auer rods</strong> and
                        are <strong>MPO-negative</strong> (myeloperoxidase negative) — a key distinguishing feature from AML.
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">🧪 Flow Cytometry (Immunophenotyping)</h4>
                    <p className="text-sm text-gray-700">
                        Flow cytometry is critical for classifying ALL as B-cell or T-cell lineage. Key markers include:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <h5 className="font-semibold text-blue-800 text-xs mb-1">B-ALL Markers</h5>
                            <p className="text-xs text-blue-700">
                                <strong>CD19</strong>, <strong>CD22</strong>, <strong>CD79a</strong>, <strong>CD10</strong> (CALLA),
                                <strong> TdT</strong>, <strong>PAX5</strong>
                            </p>
                        </div>
                        <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                            <h5 className="font-semibold text-teal-800 text-xs mb-1">T-ALL Markers</h5>
                            <p className="text-xs text-teal-700">
                                <strong>CD3</strong> (cytoplasmic), <strong>CD7</strong>, <strong>CD5</strong>, <strong>CD2</strong>,
                                <strong> CD1a</strong>, <strong>TdT</strong>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">🧬 Cytogenetics & Molecular Testing</h4>
                    <p className="text-sm text-gray-700">
                        Chromosome analysis and molecular testing identify genetic abnormalities that determine subtype,
                        prognosis, and treatment. FISH, karyotyping, and next-generation sequencing panels are standard
                        at diagnosis to detect translocations like <strong>BCR-ABL1</strong> (Philadelphia chromosome),
                        <strong> ETV6-RUNX1</strong>, and <strong>KMT2A</strong> rearrangements.
                    </p>
                </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mt-6">
                <h4 className="font-bold text-purple-900 mb-2">📊 The 20-25% Blast Threshold</h4>
                <p className="text-sm text-purple-800">
                    The WHO classification defines ALL when lymphoblast percentage reaches <strong>≥20%</strong> in
                    the bone marrow. Some protocols use a <strong>≥25%</strong> threshold (particularly in pediatric oncology).
                    However, certain genetic abnormalities — such as <strong>BCR-ABL1</strong> with lymphoblast morphology —
                    can support an ALL diagnosis even with lower blast counts when combined with immunophenotype and clinical context.
                </p>
            </div>
        </section>

        {/* Section 3: Normal vs ALL Bone Marrow */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">🦴</span> Normal Bone Marrow vs. ALL Bone Marrow
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
                The bone marrow is a finely balanced ecosystem. In ALL, this balance is catastrophically disrupted
                as immature lymphoblasts overwhelm the marrow space. Understanding this disruption explains why ALL
                causes the symptoms it does — and why it can spread beyond the marrow.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">How ALL Disrupts Normal Blood Production</h3>
            <div className="space-y-4">
                <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <h4 className="font-bold text-cyan-800 mb-2">🛑 Maturation Arrest</h4>
                    <p className="text-sm text-cyan-700">
                        The defining feature of ALL: leukemic lymphoid cells are <strong>frozen at an immature stage</strong>.
                        They continue to divide but cannot mature into functional B-cells or T-cells. The specific stage
                        of arrest — pro-B, pre-B, or thymic — helps classify the ALL subtype and guide treatment.
                    </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <h4 className="font-bold text-cyan-800 mb-2">📦 The Crowding Effect</h4>
                    <p className="text-sm text-cyan-700">
                        Leukemic lymphoblasts <strong>physically displace</strong> normal hematopoietic cells. The marrow
                        becomes packed with blasts (often &gt;90% cellularity), leaving little room for normal red blood cell,
                        white blood cell, and platelet production — leading to the classic symptoms of ALL.
                    </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <h4 className="font-bold text-cyan-800 mb-2">🩸 Resulting Cytopenias</h4>
                    <p className="text-sm text-cyan-700">
                        The crowding effect produces the classic triad of symptoms:
                        <strong> anemia</strong> (fatigue, pallor, shortness of breath),
                        <strong> neutropenia</strong> (recurrent infections from low functional white cells), and
                        <strong> thrombocytopenia</strong> (bleeding, easy bruising from low platelets).
                    </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <h4 className="font-bold text-cyan-800 mb-2">🧠 CNS Involvement</h4>
                    <p className="text-sm text-cyan-700">
                        A critical difference from AML: ALL has a strong tendency to infiltrate the <strong>central nervous
                            system (CNS)</strong>. Lymphoblasts can cross the blood-brain barrier and accumulate in the
                        cerebrospinal fluid, causing headaches, vision changes, and cranial nerve palsies. This is why
                        <strong> intrathecal chemotherapy</strong> (injected directly into the spinal fluid) and sometimes
                        <strong> cranial radiation</strong> are standard parts of ALL treatment protocols.
                    </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <h4 className="font-bold text-cyan-800 mb-2">🫁 Extramedullary Disease</h4>
                    <p className="text-sm text-cyan-700">
                        Beyond the CNS, lymphoblasts can infiltrate other organs. <strong>T-ALL</strong> frequently presents
                        with a <strong>mediastinal (thymic) mass</strong> — an enlargement in the chest that can cause breathing
                        difficulty. Both B-ALL and T-ALL can cause <strong>lymphadenopathy</strong> (swollen lymph nodes),
                        <strong> hepatosplenomegaly</strong> (enlarged liver and spleen), and less commonly <strong>testicular
                            involvement</strong> (a sanctuary site in males).
                    </p>
                </div>
            </div>
        </section>

        {/* Section 4: ALL Classification */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">📋</span> ALL Classification
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                ALL is not a single disease — it encompasses many subtypes defined by the cell lineage (B or T),
                the stage of maturation arrest, and critically, the <strong>underlying genetic abnormalities</strong>.
                Modern classification integrates immunophenotype with genetics to guide treatment decisions.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">WHO 2022 Classification: Major Categories</h3>
            <div className="space-y-3 my-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-1">B-Lymphoblastic Leukemia/Lymphoma (~85% of ALL)</h4>
                    <p className="text-sm text-blue-700">
                        The most common form. Further classified by recurrent genetic abnormalities:
                        <strong> BCR-ABL1</strong> (Philadelphia+), <strong>ETV6-RUNX1</strong> (most common in children),
                        <strong> hyperdiploidy</strong> (&gt;50 chromosomes, favorable in children),
                        <strong> KMT2A-rearranged</strong> (common in infant ALL),
                        <strong> TCF3-PBX1</strong>, <strong>BCR-ABL1-like</strong> (Ph-like), and others.
                        The genetic subtype strongly influences prognosis and treatment intensity.
                    </p>
                </div>
                <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-1">T-Lymphoblastic Leukemia/Lymphoma (~15% of ALL)</h4>
                    <p className="text-sm text-teal-700">
                        Arises from T-cell precursors, often in the thymus. More common in adolescents and young adult males.
                        Frequently presents with a <strong>mediastinal mass</strong> and high white blood cell counts.
                        Subtypes include <strong>Early T-precursor (ETP) ALL</strong> — which has a gene expression profile
                        resembling myeloid cells and may benefit from different therapeutic approaches.
                    </p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Childhood vs. Adult ALL</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                A critical distinction in ALL biology: the disease behaves very differently across age groups.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-800 mb-2">👶 Childhood ALL (Ages 1-9)</h4>
                    <ul className="text-sm text-green-700 space-y-2">
                        <li>• <strong>~90% cure rate</strong> with modern protocols</li>
                        <li>• More likely to have <strong>favorable genetics</strong> (hyperdiploidy, ETV6-RUNX1)</li>
                        <li>• Most common cancer in children</li>
                        <li>• Treatment duration: <strong>2-3 years</strong> (includes maintenance phase)</li>
                        <li>• Long-term survivorship concerns: growth, fertility, secondary cancers</li>
                    </ul>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">🧑 Adult ALL (Ages 15+)</h4>
                    <ul className="text-sm text-amber-700 space-y-2">
                        <li>• <strong>~40-50% cure rate</strong> (improving with pediatric-inspired regimens)</li>
                        <li>• More likely to have <strong>adverse genetics</strong> (BCR-ABL1, KMT2A, Ph-like)</li>
                        <li>• Higher prevalence of T-ALL and Ph+ ALL</li>
                        <li>• Adolescents/young adults (AYA, 15-39) <strong>benefit from pediatric protocols</strong></li>
                        <li>• Older adults often cannot tolerate intensive chemotherapy</li>
                    </ul>
                </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">📊 Maturation Stage Classification</h4>
                <p className="text-sm text-gray-700 mb-3">
                    B-ALL is further subclassified by the stage of B-cell development at which maturation arrest occurs.
                    This is determined by immunophenotyping (flow cytometry):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">Pro-B ALL</span>
                        <p className="text-gray-500">CD19+, CD10−</p>
                        <p className="text-gray-400">Earliest B-cell stage</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">Common ALL</span>
                        <p className="text-gray-500">CD10+ (CALLA)</p>
                        <p className="text-gray-400">Most common subtype</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">Pre-B ALL</span>
                        <p className="text-gray-500">Cytoplasmic μ+</p>
                        <p className="text-gray-400">Heavy chain expression</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">Mature B ALL</span>
                        <p className="text-gray-500">Surface Ig+</p>
                        <p className="text-gray-400">Burkitt-type / rare</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 5: Key ALL Genetic Abnormalities In Context */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">🧬</span> Key ALL Genetic Abnormalities — In Context
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Genetic abnormalities are the most important prognostic factors in ALL and increasingly guide
                treatment choices. Unlike AML, where mutations accumulate over time, ALL is more often driven by
                <strong> chromosomal translocations</strong> and <strong>copy number alterations</strong> that
                disrupt lymphoid development.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Prognostically Important Genetics</h3>
            <div className="space-y-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">FAVORABLE</span>
                        <h4 className="font-bold text-green-800">ETV6-RUNX1 (TEL-AML1) Translocation</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                        The most common genetic abnormality in childhood B-ALL (~25% of pediatric cases). This
                        translocation t(12;21) creates an abnormal fusion transcription factor. Associated with
                        <strong> excellent prognosis</strong> in children with &gt;95% cure rates. Rare in adult ALL.
                    </p>
                    <p className="text-xs text-green-600 italic">
                        Often associated with hyperdiploidy and age 2-9 years — the "good prognosis" triad of childhood ALL.
                    </p>
                </div>

                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">FAVORABLE</span>
                        <h4 className="font-bold text-green-800">High Hyperdiploidy (&gt;50 Chromosomes)</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                        Found in ~25-30% of childhood B-ALL. Cells have 51-67 chromosomes (normal is 46), typically
                        with extra copies of chromosomes 4, 10, 17, and 21. Associated with <strong>favorable prognosis</strong>,
                        particularly when combined with age 1-9 years. Hyperdiploid cells are more susceptible to
                        methotrexate and mercaptopurine therapy.
                    </p>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">HIGH RISK</span>
                        <h4 className="font-bold text-red-800">BCR-ABL1 (Philadelphia Chromosome)</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                        The t(9;22) translocation creates the <strong>Philadelphia chromosome</strong>, producing a
                        constitutively active tyrosine kinase. Found in ~3-5% of childhood ALL but <strong>~25% of
                            adult ALL</strong> — making it the most common genetic abnormality in adult ALL. Historically
                        associated with very poor prognosis, but outcomes have <strong>dramatically improved</strong> with
                        the addition of tyrosine kinase inhibitors.
                    </p>
                    <p className="text-xs text-red-600 italic">
                        Targeted therapies: imatinib, dasatinib, ponatinib. Adding TKIs to chemotherapy has transformed
                        Ph+ ALL from one of the worst prognoses to near-comparable outcomes in many patients.
                    </p>
                </div>

                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-xs font-bold">HIGH RISK</span>
                        <h4 className="font-bold text-amber-800">Ph-like (BCR-ABL1-like) ALL</h4>
                    </div>
                    <p className="text-sm text-amber-700 mb-2">
                        Has a gene expression profile similar to Ph+ ALL but <strong>lacks the BCR-ABL1 fusion</strong>.
                        Instead, these cases harbor diverse kinase-activating alterations (CRLF2, JAK2, ABL-class fusions,
                        EPOR, etc.). Found in ~15-20% of B-ALL cases. Associated with <strong>poor prognosis</strong> with
                        standard therapy, but many harbored fusions may respond to specific TKIs or JAK inhibitors.
                    </p>
                    <p className="text-xs text-amber-600 italic">
                        Emerging targeted approaches: dasatinib (for ABL-class fusions), ruxolitinib (for JAK-STAT pathway alterations).
                    </p>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">ADVERSE</span>
                        <h4 className="font-bold text-red-800">KMT2A (MLL) Rearrangements</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                        Found in <strong>~80% of infant ALL</strong> (under 1 year) and ~5-10% of adult ALL.
                        The KMT2A gene (chromosome 11q23) is a histone methyltransferase involved in gene regulation.
                        KMT2A-rearranged ALL has a <strong>distinct biology</strong> — often with a pro-B immunophenotype,
                        high WBC count, and involvement of the CNS. Associated with <strong>poor outcomes</strong>,
                        particularly in infants.
                    </p>
                    <p className="text-xs text-red-600 italic">
                        Active research: menin inhibitors (revumenib, ziftomenib) target the KMT2A-menin interaction and
                        show promising results in clinical trials.
                    </p>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">ADVERSE</span>
                        <h4 className="font-bold text-red-800">Hypodiploidy (&lt;44 Chromosomes)</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                        Near-haploid (24-31 chromosomes) and low-hypodiploid (32-39 chromosomes) ALL carry the
                        <strong> worst prognosis</strong> of any ALL subtype. Often associated with <strong>TP53 mutations</strong>
                        (especially in low-hypodiploid cases). These cases frequently require transplant in first remission.
                    </p>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs font-bold">MODIFIER</span>
                        <h4 className="font-bold text-blue-800">IKZF1 Deletions (IKAROS)</h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                        IKZF1 encodes the <strong>IKAROS transcription factor</strong>, essential for normal lymphoid development.
                        Deletions or mutations of IKZF1 are found in ~15% of pediatric and ~40% of adult B-ALL. They confer
                        <strong> adverse prognosis</strong> independent of other risk factors and are a hallmark of Ph-like ALL.
                        IKZF1 status is now used in risk stratification in multiple treatment protocols.
                    </p>
                </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mt-6">
                <h4 className="font-bold text-indigo-900 mb-2">🎯 MRD: The Modern Risk Measure</h4>
                <p className="text-sm text-indigo-800">
                    <strong>Minimal Residual Disease (MRD)</strong> measurement has become the single most important
                    prognostic factor in ALL, often superseding genetics. MRD quantifies the remaining leukemia cells
                    after treatment (by flow cytometry or PCR), detecting as few as 1 leukemia cell among 10,000-1,000,000
                    normal cells. Patients who achieve <strong>MRD-negative status</strong> (&lt;0.01%) after induction have
                    significantly better outcomes. MRD status guides decisions about treatment intensification, transplant,
                    and immunotherapy (e.g., blinatumomab for MRD+ patients).
                </p>
            </div>
        </section>

        {/* Section 6: Revolutionary Therapies */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-teal-600">💉</span> Immunotherapy Revolution in ALL
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                ALL has been at the forefront of the immunotherapy revolution. These breakthrough therapies have
                transformed outcomes for patients with relapsed or refractory disease and are increasingly being
                incorporated into frontline treatment.
            </p>

            <div className="space-y-4">
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">🎯 Blinatumomab (Blincyto®)</h4>
                    <p className="text-sm text-teal-700 mb-2">
                        A <strong>bispecific T-cell engager (BiTE)</strong> that connects CD19 on leukemia cells to
                        CD3 on T-cells, redirecting the patient's own T-cells to kill lymphoblasts. Administered as
                        a continuous IV infusion. Approved for relapsed/refractory B-ALL and for elimination of MRD.
                        Now being tested in frontline therapy with very promising results.
                    </p>
                </div>
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">💊 Inotuzumab Ozogamicin (Besponsa®)</h4>
                    <p className="text-sm text-teal-700 mb-2">
                        An <strong>antibody-drug conjugate (ADC)</strong> targeting CD22 on B-ALL cells. The antibody
                        delivers a potent chemotherapy payload (calicheamicin) directly to leukemia cells, minimizing
                        damage to healthy tissue. Significantly improves complete remission rates in relapsed B-ALL.
                    </p>
                </div>
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">🧬 CAR T-Cell Therapy</h4>
                    <p className="text-sm text-teal-700 mb-2">
                        <strong>Chimeric Antigen Receptor T-cell therapy</strong> represents perhaps the most revolutionary
                        advance in ALL treatment. The patient's own T-cells are collected, genetically engineered to
                        express a receptor targeting CD19 on leukemia cells, expanded in the laboratory, and infused back.
                    </p>
                    <div className="bg-white p-3 rounded-lg border border-teal-200 mt-3">
                        <p className="text-xs text-teal-700 mb-2"><strong>Approved products for ALL:</strong></p>
                        <ul className="text-xs text-teal-600 space-y-1 pl-3">
                            <li>• <strong>Tisagenlecleucel (Kymriah®)</strong> — approved for patients up to age 25 with relapsed/refractory B-ALL</li>
                            <li>• <strong>Brexucabtagene autoleucel (Tecartus®)</strong> — approved for adults with relapsed/refractory B-ALL</li>
                        </ul>
                    </div>
                    <p className="text-xs text-teal-600 mt-2 italic">
                        Key consideration: cytokine release syndrome (CRS) and neurotoxicity are important side effects
                        that require specialized management at certified treatment centers.
                    </p>
                </div>
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">💊 TKIs for Ph+ ALL</h4>
                    <p className="text-sm text-teal-700 mb-2">
                        Tyrosine kinase inhibitors have transformed Philadelphia chromosome-positive ALL.
                        <strong> Imatinib</strong>, <strong>dasatinib</strong>, and <strong>ponatinib</strong> target
                        the BCR-ABL1 kinase. Adding TKIs to chemotherapy (or even chemotherapy-free TKI + immunotherapy
                        approaches) has dramatically improved outcomes for this historically poor-prognosis subtype.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 7: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Authoritative ALL Resources
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                These trusted organizations provide comprehensive, up-to-date information about ALL:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://bloodcancerunited.org/blood-cancer/leukemia/acute-lymphoblastic-leukemia-all"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">Blood Cancer United — ALL</h4>
                    <p className="text-sm text-blue-600">Comprehensive ALL overview, diagnosis, and treatment information.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.lls.org/leukemia/acute-lymphoblastic-leukemia"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-orange-800 group-hover:text-orange-900 mb-1">LLS — Acute Lymphoblastic Leukemia</h4>
                    <p className="text-sm text-orange-600">Patient guides, support programs, and clinical trial finder.</p>
                    <span className="text-xs text-orange-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cancer.gov/types/leukemia/patient/child-all-treatment-pdq"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-green-800 group-hover:text-green-900 mb-1">NCI — ALL Treatment (PDQ®)</h4>
                    <p className="text-sm text-green-600">Detailed treatment information reviewed by oncology experts.</p>
                    <span className="text-xs text-green-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.nccn.org/patients/guidelines/content/PDF/all-patient.pdf"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-purple-800 group-hover:text-purple-900 mb-1">NCCN — ALL Patient Guidelines</h4>
                    <p className="text-sm text-purple-600">Patient-friendly version of the clinical practice guidelines.</p>
                    <span className="text-xs text-purple-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default ALLDeepDive;
