import React from 'react';
import amlMarrowDiagram from '../assets/aml-marrow-diagram.png';

// ─── AML Deep Dive Educational Content ────────────────────────────
const AMLDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: The Myeloid Lineage In Depth */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-orange-600">🔶</span> The Myeloid Lineage — In Depth
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                To understand AML, it helps to know how normal myeloid blood cells develop. All blood cells originate from
                <strong> hematopoietic stem cells (HSCs)</strong> in the bone marrow. These stem cells first commit to one of
                two main lineages: <strong>myeloid</strong> or <strong>lymphoid</strong>. AML specifically affects the myeloid lineage.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">The Differentiation Cascade</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Myeloid differentiation follows a carefully regulated cascade. The HSC first becomes
                a <strong>Common Myeloid Progenitor (CMP)</strong>, which then branches into two key pathways:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2">Granulocyte-Monocyte Progenitor (GMP)</h4>
                    <p className="text-sm text-orange-700 mb-2">
                        Gives rise to the granulocytes and monocytes — key players in innate immunity:
                    </p>
                    <ul className="text-sm text-orange-700 space-y-1 pl-4">
                        <li>• <strong>Neutrophils</strong> — the most abundant white blood cells; first responders to bacterial infection</li>
                        <li>• <strong>Monocytes / Macrophages</strong> — engulf pathogens and cellular debris; coordinate immune responses</li>
                        <li>• <strong>Eosinophils</strong> — combat parasites and modulate allergic responses</li>
                        <li>• <strong>Basophils / Mast cells</strong> — mediate inflammatory and allergic reactions</li>
                    </ul>
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">Megakaryocyte-Erythroid Progenitor (MEP)</h4>
                    <p className="text-sm text-red-700 mb-2">
                        Gives rise to the oxygen-carrying and clotting components of blood:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 pl-4">
                        <li>• <strong>Erythrocytes (Red Blood Cells)</strong> — carry oxygen via hemoglobin; ~70% of all marrow output</li>
                        <li>• <strong>Megakaryocytes → Platelets</strong> — giant cells that fragment into thousands of platelets for blood clotting</li>
                    </ul>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Growth Factors That Drive Differentiation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Each step of differentiation is guided by specific <strong>growth factors</strong> (also called cytokines).
                These chemical signals tell progenitor cells which type of blood cell to become:
            </p>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Growth Factor</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Full Name</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Drives Production Of</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">G-CSF</td>
                            <td className="px-4 py-3 text-gray-700">Granulocyte Colony-Stimulating Factor</td>
                            <td className="px-4 py-3 text-gray-700">Neutrophils</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">M-CSF</td>
                            <td className="px-4 py-3 text-gray-700">Macrophage Colony-Stimulating Factor</td>
                            <td className="px-4 py-3 text-gray-700">Monocytes / Macrophages</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">GM-CSF</td>
                            <td className="px-4 py-3 text-gray-700">Granulocyte-Macrophage CSF</td>
                            <td className="px-4 py-3 text-gray-700">Both granulocytes and monocytes</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">EPO</td>
                            <td className="px-4 py-3 text-gray-700">Erythropoietin</td>
                            <td className="px-4 py-3 text-gray-700">Red blood cells (erythrocytes)</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">TPO</td>
                            <td className="px-4 py-3 text-gray-700">Thrombopoietin</td>
                            <td className="px-4 py-3 text-gray-700">Platelets (via megakaryocytes)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-sm text-gray-500 mt-3 italic">
                💡 G-CSF is commonly given to patients after chemotherapy (as Neupogen® or Neulasta®) to help neutrophil
                counts recover faster.
            </p>
        </section>

        {/* Section 2: What Are Blast Cells? */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🔬</span> What Are Blast Cells?
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                The word <strong>"blast"</strong> comes from the Greek <em>blastos</em> meaning "germ" or "bud." In hematology,
                blasts are <strong>immature precursor cells</strong> — the earliest identifiable cells in the differentiation
                cascade that will eventually mature into functional blood cells.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Normal vs. Leukemic Blasts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-800 mb-2">✅ Normal Blasts</h4>
                    <ul className="text-sm text-green-700 space-y-2">
                        <li>• Comprise <strong>&lt;5%</strong> of bone marrow cells</li>
                        <li>• Rapidly differentiate into mature, functional cells</li>
                        <li>• Respond normally to growth factor signals</li>
                        <li>• Undergo programmed cell death (apoptosis) when not needed</li>
                    </ul>
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">⚠️ Leukemic Blasts (Myeloblasts)</h4>
                    <ul className="text-sm text-red-700 space-y-2">
                        <li>• Accumulate to <strong>≥20%</strong> of marrow (the diagnostic threshold for AML)</li>
                        <li>• <strong>Maturation arrest</strong>: they proliferate but fail to differentiate</li>
                        <li>• Ignore normal growth signals; proliferate unchecked</li>
                        <li>• Resist apoptosis, allowing them to accumulate</li>
                    </ul>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">How Blasts Are Identified</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Pathologists identify blasts using multiple complementary techniques:
            </p>
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">🔎 Morphology (Under the Microscope)</h4>
                    <p className="text-sm text-gray-700">
                        Blasts have a characteristic appearance: <strong>large nucleus</strong> relative to cell size,
                        <strong> fine chromatin</strong> (open, less condensed DNA), <strong>prominent nucleoli</strong> (1-4 visible),
                        and <strong>scant basophilic cytoplasm</strong> (thin rim of blue-staining cell body).
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">💎 Auer Rods</h4>
                    <p className="text-sm text-gray-700">
                        A hallmark finding in AML: <strong>Auer rods</strong> are needle-like crystalline structures within
                        the cytoplasm of leukemic blasts. They are aggregates of azurophilic granules and are
                        <strong> pathognomonic for myeloid lineage</strong> — meaning if Auer rods are present,
                        the leukemia is definitively myeloid, not lymphoid.
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">🧪 Flow Cytometry (Immunophenotyping)</h4>
                    <p className="text-sm text-gray-700">
                        Flow cytometry identifies cell surface markers to confirm blast identity. Key myeloid blast
                        markers include: <strong>CD34</strong> (stem/progenitor marker), <strong>CD117</strong> (c-KIT),
                        <strong> HLA-DR</strong>, <strong>CD13</strong>, <strong>CD33</strong>, and <strong>MPO</strong> (myeloperoxidase).
                        The specific pattern helps distinguish AML from ALL and identify AML subtypes.
                    </p>
                </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mt-6">
                <h4 className="font-bold text-purple-900 mb-2">📊 The 20% Threshold</h4>
                <p className="text-sm text-purple-800">
                    The WHO and ICC classifications define AML when blast percentage reaches <strong>≥20%</strong> in
                    the bone marrow or peripheral blood. However, certain genetic abnormalities (like PML::RARA in APL,
                    or RUNX1::RUNX1T1) qualify as AML regardless of blast count — these are called
                    "<strong>AML-defining genetic abnormalities</strong>."
                </p>
            </div>
        </section>

        {/* Section 3: Normal vs AML Bone Marrow */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">🦴</span> Normal Bone Marrow vs. AML Bone Marrow
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
                The bone marrow is a finely balanced ecosystem. In AML, this balance is catastrophically disrupted.
                Understanding the difference between healthy and leukemic marrow illustrates why AML causes the
                symptoms it does.
            </p>

            {/* Bone marrow comparison diagram */}
            <div className="my-8">
                <img
                    src={amlMarrowDiagram}
                    alt="Side-by-side comparison of healthy bone marrow and AML-affected bone marrow showing how leukemic blasts crowd out normal blood cells"
                    className="w-full rounded-xl border border-gray-200 shadow-sm"
                />
                <p className="text-sm text-gray-500 text-center mt-3 italic">
                    In AML, leukemic blasts overwhelm the marrow, crowding out normal cells and causing the
                    hallmark complications: anemia, infections, and bleeding.
                </p>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">How AML Disrupts Normal Blood Production</h3>
            <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">🛑 Maturation Arrest</h4>
                    <p className="text-sm text-amber-700">
                        The defining feature of AML: leukemic cells are <strong>frozen at an immature stage</strong>.
                        They continue to proliferate but cannot mature into functional blood cells. The specific stage
                        of arrest determines the AML subtype (e.g., promyelocytic in APL, monoblastic in AML-M5).
                    </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">📦 The Crowding Effect</h4>
                    <p className="text-sm text-amber-700">
                        Leukemic blasts don't just fail to work — they <strong>physically displace</strong> normal
                        hematopoietic cells. The marrow becomes "packed" with blasts (often &gt;80-90% cellularity),
                        leaving little room for normal red cell, white cell, and platelet production.
                    </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">🩸 Resulting Cytopenias</h4>
                    <p className="text-sm text-amber-700">
                        The crowding effect produces the classic triad of AML symptoms:
                        <strong> anemia</strong> (fatigue, pallor, shortness of breath from low red cells),
                        <strong> neutropenia</strong> (infections from low functional white cells), and
                        <strong> thrombocytopenia</strong> (bleeding, bruising from low platelets).
                    </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">🌊 Extramedullary Disease</h4>
                    <p className="text-sm text-amber-700">
                        In some cases, blasts spill out of the marrow into the peripheral blood (leading to very high
                        WBC counts called <strong>hyperleukocytosis</strong>). Blasts can also infiltrate other organs —
                        the spleen, liver, gums, skin, or central nervous system — causing organ-specific symptoms.
                        Collections of blasts outside the marrow are called <strong>myeloid sarcomas</strong> (or chloromas).
                    </p>
                </div>
            </div>
        </section>

        {/* Section 4: AML Classification */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">📋</span> AML Classification
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                AML is not a single disease — it encompasses many subtypes with distinct biology, behavior, and
                treatment responses. Modern classification systems group AML by its <strong>genetic drivers</strong>
                rather than just how cells look under the microscope.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">WHO 2022 / ICC Classification</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                The current standard classifiers (WHO 5th edition and ICC 2022) prioritize <strong>genetic abnormalities</strong> as
                the primary basis for classification:
            </p>
            <div className="space-y-3 my-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-1">AML with Recurrent Genetic Abnormalities</h4>
                    <p className="text-sm text-indigo-700">
                        Defined by specific chromosomal translocations or gene mutations. Examples: <strong>PML::RARA</strong> (APL),
                        <strong> RUNX1::RUNX1T1</strong>, <strong>CBFB::MYH11</strong> (core-binding factor AML),
                        <strong> KMT2A</strong> rearrangements, <strong>NPM1</strong>-mutated AML, <strong>CEBPA</strong>-mutated AML.
                        These often have specific treatment implications and prognosis.
                    </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-1">AML with Myelodysplasia-Related Changes</h4>
                    <p className="text-sm text-indigo-700">
                        AML that evolved from MDS or has MDS-like features (multi-lineage dysplasia, MDS-related
                        cytogenetic changes). Often presents in older patients and may be more resistant to standard
                        chemotherapy. <strong>CPX-351 (Vyxeos®)</strong> was specifically approved for this subtype.
                    </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-1">Therapy-Related AML (t-AML)</h4>
                    <p className="text-sm text-indigo-700">
                        AML that develops after prior chemotherapy or radiation for another cancer. Accounts for ~10%
                        of AML cases. Often carries adverse-risk genetics (TP53 mutations, complex karyotype).
                    </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-1">AML, Not Otherwise Specified (AML-NOS)</h4>
                    <p className="text-sm text-indigo-700">
                        AML that doesn't fit into the above genetic categories. This is where the legacy <strong>FAB
                            classification</strong> (M0 through M7) is still sometimes referenced to describe the
                        morphological appearance and lineage of the blasts.
                    </p>
                </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">📜 FAB Classification (Historical Reference)</h4>
                <p className="text-sm text-gray-700 mb-3">
                    The French-American-British (FAB) system, developed in the 1970s, classified AML based on cell morphology and
                    differentiation. While largely replaced by genetic classification, these designations are still commonly used:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">M0</span>
                        <p className="text-gray-500">Minimally differentiated</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">M1</span>
                        <p className="text-gray-500">Without maturation</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">M2</span>
                        <p className="text-gray-500">With maturation</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">M3</span>
                        <p className="text-gray-500">Promyelocytic (APL)</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">M4</span>
                        <p className="text-gray-500">Myelomonocytic</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">M5</span>
                        <p className="text-gray-500">Monocytic</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">M6</span>
                        <p className="text-gray-500">Erythroid</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
                        <span className="font-bold text-gray-900">M7</span>
                        <p className="text-gray-500">Megakaryoblastic</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 5: Key AML Mutations In Context */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">🧬</span> Key AML Mutations — In Context
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                AML is driven by combinations of mutations, not single genes acting alone. Understanding how
                mutations <strong>interact</strong> and <strong>co-occur</strong> is essential for interpreting your
                molecular report and understanding your treatment plan.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Founding vs. Cooperating Mutations</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                AML typically develops through a <strong>multi-hit model</strong>: an initial "founding" mutation creates a
                pre-leukemic state, and additional "cooperating" mutations drive transformation to full AML:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">🏗️ Founding Mutations</h4>
                    <p className="text-sm text-blue-700">
                        Early events that create a clonal expansion. Examples: <strong>DNMT3A</strong>, <strong>TET2</strong>,
                        <strong> ASXL1</strong>, <strong>IDH1/2</strong>. These are often found in
                        <strong> clonal hematopoiesis of indeterminate potential (CHIP)</strong> — a pre-malignant
                        state that can exist years before AML develops.
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2">⚡ Cooperating Mutations</h4>
                    <p className="text-sm text-orange-700">
                        Later events that push the clone toward AML. Examples: <strong>FLT3-ITD</strong>,
                        <strong> NPM1</strong>, <strong>RAS</strong> pathway mutations. These typically affect
                        signaling pathways that drive proliferation or block differentiation.
                    </p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Important Mutation Profiles</h3>
            <div className="space-y-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">FAVORABLE</span>
                        <h4 className="font-bold text-green-800">NPM1-Mutated AML</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                        Present in ~30% of AML cases. NPM1 mutations cause the nucleophosmin protein to mislocalize
                        to the cytoplasm. Associated with <strong>favorable prognosis</strong> when present without
                        FLT3-ITD. Responds well to standard chemotherapy; transplant in first remission may not be needed.
                    </p>
                    <p className="text-xs text-green-600 italic">
                        Common co-occurrence: DNMT3A + NPM1 + FLT3 ("triple mutant") — prognosis depends on FLT3-ITD allelic ratio.
                    </p>
                </div>

                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-xs font-bold">TARGETED THERAPY</span>
                        <h4 className="font-bold text-amber-800">FLT3 Mutations (ITD and TKD)</h4>
                    </div>
                    <p className="text-sm text-amber-700 mb-2">
                        <strong>FLT3-ITD</strong> (internal tandem duplication) is found in ~25% of AML and drives
                        aggressive proliferation via constitutive activation of the FLT3 receptor tyrosine kinase.
                        <strong> FLT3-TKD</strong> (tyrosine kinase domain point mutations) confers less adverse risk.
                    </p>
                    <p className="text-xs text-amber-600 italic">
                        Targeted therapies: midostaurin (added to induction), gilteritinib (relapsed/refractory).
                        ELN 2022 no longer uses the FLT3-ITD allelic ratio for risk stratification.
                    </p>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs font-bold">TARGETED THERAPY</span>
                        <h4 className="font-bold text-blue-800">IDH1 and IDH2 Mutations</h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                        Isocitrate dehydrogenase mutations (IDH1 ~8%, IDH2 ~12% of AML) produce an abnormal metabolite
                        called <strong>2-hydroxyglutarate (2-HG)</strong> that blocks cell differentiation. This gives
                        them a unique therapeutic vulnerability.
                    </p>
                    <p className="text-xs text-blue-600 italic">
                        Targeted therapies: ivosidenib (IDH1), enasidenib (IDH2). These drugs can induce differentiation
                        of leukemic blasts, sometimes achieving remission without intensive chemotherapy.
                    </p>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">ADVERSE</span>
                        <h4 className="font-bold text-red-800">TP53 Mutations</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                        The "guardian of the genome" — TP53 normally prevents damaged cells from surviving.
                        Mutations (~5-10% of <em>de novo</em> AML, higher in therapy-related AML) are associated with
                        <strong> complex karyotype, chemotherapy resistance, and the worst prognosis</strong> of any AML subgroup.
                    </p>
                    <p className="text-xs text-red-600 italic">
                        Active research areas: magrolimab (CD47 antibody), eprenetapopt (APR-246), and other novel agents
                        specifically targeting TP53-mutated AML.
                    </p>
                </div>

                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-teal-600 text-white rounded-md text-xs font-bold">FAVORABLE</span>
                        <h4 className="font-bold text-teal-800">CEBPA Mutations</h4>
                    </div>
                    <p className="text-sm text-teal-700 mb-2">
                        CEBPA encodes a transcription factor essential for granulocyte differentiation. <strong>Biallelic
                            CEBPA mutations</strong> (or bZIP in-frame mutations per ELN 2022) are associated with
                        favorable prognosis. These patients often respond well to chemotherapy alone.
                    </p>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-gray-600 text-white rounded-md text-xs font-bold">EPIGENETIC</span>
                        <h4 className="font-bold text-gray-800">DNMT3A, TET2, and ASXL1</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                        These <strong>epigenetic regulators</strong> are among the most commonly mutated genes in AML.
                        They affect how DNA is read (methylation and chromatin modification) without changing the DNA
                        sequence itself.
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 pl-4">
                        <li>• <strong>DNMT3A R882</strong> — most common AML mutation overall; often one of the earliest events</li>
                        <li>• <strong>TET2</strong> — involved in DNA demethylation; loss impairs differentiation</li>
                        <li>• <strong>ASXL1</strong> — chromatin modifier; associated with adverse prognosis (ELN 2022 adverse when mutated)</li>
                    </ul>
                </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mt-6">
                <h4 className="font-bold text-indigo-900 mb-2">🔗 Connection to ELN 2022 Risk</h4>
                <p className="text-sm text-indigo-800">
                    The <strong>European LeukemiaNet (ELN) 2022</strong> guidelines use mutation status as the primary
                    basis for risk classification: <strong>Favorable</strong> (NPM1 without adverse markers, biallelic CEBPA,
                    core-binding factor), <strong>Intermediate</strong> (NPM1 with certain co-mutations, wild-type NPM1
                    without adverse markers), and <strong>Adverse</strong> (TP53, ASXL1, RUNX1, MECOM rearrangements,
                    complex/monosomal karyotype). This classification directly guides transplant decisions.
                </p>
            </div>
        </section>

        {/* Section 6: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Authoritative AML Resources
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                These trusted organizations provide comprehensive, up-to-date information about AML:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://bloodcancerunited.org/blood-cancer/leukemia/acute-myeloid-leukemia-aml"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">Blood Cancer United — AML</h4>
                    <p className="text-sm text-blue-600">Comprehensive AML overview, diagnosis, and treatment information.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.lls.org/leukemia/acute-myeloid-leukemia"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-orange-800 group-hover:text-orange-900 mb-1">LLS — Acute Myeloid Leukemia</h4>
                    <p className="text-sm text-orange-600">Patient guides, support programs, and clinical trial finder.</p>
                    <span className="text-xs text-orange-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cancer.gov/types/leukemia/patient/adult-aml-treatment-pdq"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-green-800 group-hover:text-green-900 mb-1">NCI — AML Treatment (PDQ®)</h4>
                    <p className="text-sm text-green-600">Detailed treatment information reviewed by oncology experts.</p>
                    <span className="text-xs text-green-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.nccn.org/patients/guidelines/content/PDF/aml-patient.pdf"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-purple-800 group-hover:text-purple-900 mb-1">NCCN — AML Patient Guidelines</h4>
                    <p className="text-sm text-purple-600">Patient-friendly version of the clinical practice guidelines.</p>
                    <span className="text-xs text-purple-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default AMLDeepDive;
