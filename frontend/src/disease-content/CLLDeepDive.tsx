import React from 'react';

// ─── CLL Deep Dive Educational Content ────────────────────────────
const CLLDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: Understanding CLL Biology */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-sky-600">🔬</span> CLL Biology — Mature B-Cells Gone Wrong
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Unlike most leukemias where immature cells dominate, CLL is a cancer of <strong>mature-appearing
                    B-lymphocytes</strong>. These cells look nearly normal under the microscope but have a critical
                defect: they <strong>cannot die</strong>. CLL is primarily a disease of <strong>failed apoptosis</strong>
                rather than excessive proliferation — the cells accumulate because they resist programmed cell death.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
                    <h4 className="font-bold text-sky-800 mb-2">🛡️ The BCL-2 Survival Pathway</h4>
                    <p className="text-sm text-sky-700 mb-2">
                        CLL cells massively overexpress <strong>BCL-2</strong> — the key anti-apoptotic protein that
                        blocks programmed cell death. This is the fundamental survival mechanism of CLL:
                    </p>
                    <ul className="text-sm text-sky-700 space-y-1 pl-4">
                        <li>• BCL-2 prevents release of <strong>cytochrome c</strong> from mitochondria</li>
                        <li>• Blocks activation of the <strong>caspase cascade</strong> (the cell death machinery)</li>
                        <li>• CLL cells have a 100-fold higher BCL-2/BAX ratio than normal lymphocytes</li>
                        <li>• This makes venetoclax (a BCL-2 inhibitor) one of the most effective CLL drugs</li>
                    </ul>
                </div>
                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-2">📡 The B-Cell Receptor (BCR) Signal</h4>
                    <p className="text-sm text-indigo-700 mb-2">
                        CLL cells receive <strong>chronic survival signals</strong> through their B-cell receptor,
                        which activates critical downstream pathways:
                    </p>
                    <ul className="text-sm text-indigo-700 space-y-1 pl-4">
                        <li>• <strong>BTK (Bruton's Tyrosine Kinase)</strong> — the key BCR signaling node; target of ibrutinib, acalabrutinib, zanubrutinib</li>
                        <li>• <strong>PI3Kδ</strong> — promotes survival and homing; target of idelalisib</li>
                        <li>• <strong>NF-κB activation</strong> — anti-apoptotic gene expression</li>
                        <li>• Some CLL cells have <strong>autonomous BCR signaling</strong> — the receptor fires without external stimulation</li>
                    </ul>
                </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2">🔄 The Lymph Node Microenvironment</h4>
                <p className="text-sm text-amber-800">
                    While CLL cells in the blood are quiescent, the <strong>"proliferation centers"</strong> within
                    lymph nodes are where CLL actively grows. T-cells, nurse-like cells, and stromal cells in these
                    niches provide pro-survival signals (CD40L, BAFF, IL-4, IL-21) that activate NF-κB and drive
                    CLL cell division. BTK inhibitors work partly by <strong>expelling CLL cells from these
                        protective niches</strong> into the blood — explaining the characteristic initial lymphocytosis
                    (rising blood count) when starting BTK inhibitor therapy.
                </p>
            </div>
        </section>

        {/* Section 2: CLL vs SLL & Staging */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📊</span> CLL vs SLL, Staging & "Watch and Wait"
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                CLL and <strong>Small Lymphocytic Lymphoma (SLL)</strong> are the same disease at the cellular and
                molecular level. The distinction is purely based on <strong>where the disease manifests</strong>:
                CLL presents primarily in the blood (≥5,000/μL monoclonal B-cells), while SLL manifests mainly in
                lymph nodes with fewer circulating cells.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Clinical Staging Systems</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-purple-800 mb-2">Rai Staging (US)</h4>
                    <div className="bg-white rounded-lg border border-purple-200 overflow-hidden mt-2">
                        <table className="w-full text-xs">
                            <thead className="bg-purple-100">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-purple-900">Stage</th>
                                    <th className="px-3 py-2 text-left font-semibold text-purple-900">Features</th>
                                    <th className="px-3 py-2 text-left font-semibold text-purple-900">Risk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-100">
                                <tr><td className="px-3 py-2 text-purple-800">0</td><td className="px-3 py-2 text-purple-700">Lymphocytosis only</td><td className="px-3 py-2 text-green-600 font-semibold">Low</td></tr>
                                <tr><td className="px-3 py-2 text-purple-800">I-II</td><td className="px-3 py-2 text-purple-700">+ Lymphadenopathy ± splenomegaly</td><td className="px-3 py-2 text-amber-600 font-semibold">Intermediate</td></tr>
                                <tr><td className="px-3 py-2 text-purple-800">III-IV</td><td className="px-3 py-2 text-purple-700">Anemia and/or thrombocytopenia</td><td className="px-3 py-2 text-red-600 font-semibold">High</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-violet-50 p-5 rounded-xl border border-violet-100">
                    <h4 className="font-bold text-violet-800 mb-2">Binet Staging (Europe)</h4>
                    <div className="bg-white rounded-lg border border-violet-200 overflow-hidden mt-2">
                        <table className="w-full text-xs">
                            <thead className="bg-violet-100">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-violet-900">Stage</th>
                                    <th className="px-3 py-2 text-left font-semibold text-violet-900">Features</th>
                                    <th className="px-3 py-2 text-left font-semibold text-violet-900">Median OS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-violet-100">
                                <tr><td className="px-3 py-2 text-violet-800">A</td><td className="px-3 py-2 text-violet-700">&lt;3 enlarged areas, normal Hb &amp; platelets</td><td className="px-3 py-2 text-violet-600">&gt;10 years</td></tr>
                                <tr><td className="px-3 py-2 text-violet-800">B</td><td className="px-3 py-2 text-violet-700">≥3 enlarged areas</td><td className="px-3 py-2 text-violet-600">~7 years</td></tr>
                                <tr><td className="px-3 py-2 text-violet-800">C</td><td className="px-3 py-2 text-violet-700">Anemia and/or thrombocytopenia</td><td className="px-3 py-2 text-violet-600">~2-5 years</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-green-50 p-5 rounded-xl border border-green-100 mt-4">
                <h4 className="font-bold text-green-800 mb-2">⏳ "Watch and Wait" — Active Surveillance</h4>
                <p className="text-sm text-green-700">
                    A hallmark of CLL management: <strong>most early-stage CLL patients do not need treatment</strong>.
                    The iwCLL (international workshop on CLL) criteria require <strong>active disease</strong> before
                    starting therapy — including progressive cytopenias, massive/progressive lymphadenopathy or
                    splenomegaly, lymphocyte doubling time &lt;6 months, or constitutional symptoms (weight loss,
                    fevers, night sweats). Studies have consistently shown that <strong>early treatment of
                        asymptomatic CLL does not improve survival</strong>, making "watch and wait" a safe and
                    evidence-based strategy — though patients should have regular monitoring (every 3-12 months).
                </p>
            </div>
        </section>

        {/* Section 3: Genetics & Prognostic Markers */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-emerald-600">🧬</span> Genetics & Prognostic Markers
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                CLL has a well-defined set of genetic and molecular markers that <strong>powerfully predict
                    disease course and treatment response</strong>. Modern CLL care requires comprehensive testing
                before treatment decisions.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">FISH Cytogenetics</h3>
            <div className="space-y-3 my-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">FAVORABLE</span>
                        <h4 className="font-bold text-green-800">del(13q) — Isolated</h4>
                    </div>
                    <p className="text-sm text-green-700">
                        The most common abnormality (~55%). Deletion of 13q14, which includes the <strong>miR-15a/16-1
                            microRNA cluster</strong> — regulators of BCL-2 expression. When isolated (no other abnormalities),
                        associated with the <strong>best prognosis</strong> and slowest progression.
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">FAVORABLE</span>
                        <h4 className="font-bold text-green-800">Trisomy 12</h4>
                    </div>
                    <p className="text-sm text-green-700">
                        Found in ~15% of CLL. Associated with <strong>atypical morphology</strong> and higher CD20
                        expression. Generally intermediate-to-favorable prognosis. Often co-occurs with <strong>NOTCH1
                            mutations</strong>.
                    </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-xs font-bold">UNFAVORABLE</span>
                        <h4 className="font-bold text-amber-800">del(11q) — ATM Deletion</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                        Found in ~15-20%. Deletes the <strong>ATM gene</strong> (DNA damage repair). Associated with
                        bulky lymphadenopathy, younger age, and faster progression. Historically adverse, but
                        <strong> BTK inhibitors have significantly improved outcomes</strong> in del(11q) CLL.
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">HIGH RISK</span>
                        <h4 className="font-bold text-red-800">del(17p) / TP53 Mutation</h4>
                    </div>
                    <p className="text-sm text-red-700">
                        Found in ~5-10% at diagnosis, higher at relapse. Loss or mutation of <strong>TP53</strong> causes
                        chemotherapy resistance — these cells cannot undergo DNA damage-induced apoptosis. Previously
                        associated with very poor outcomes, but <strong>BTK inhibitors and venetoclax remain effective</strong>
                        because they work through TP53-independent mechanisms. This is the single most important
                        factor determining treatment choice in CLL.
                    </p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Key Molecular Markers</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Marker</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Significance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">IGHV Mutation Status</td>
                            <td className="px-4 py-3 text-gray-700">
                                <strong>Mutated IGHV</strong> (~60%): favorable, often indolent, excellent response to
                                time-limited venetoclax-based therapy. <strong>Unmutated IGHV</strong> (~40%): more
                                aggressive, may need continuous BTK inhibitor therapy.
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">NOTCH1 Mutations</td>
                            <td className="px-4 py-3 text-gray-700">
                                ~10-15%. Associated with <strong>Richter's transformation</strong> risk and possible
                                reduced benefit from anti-CD20 antibodies.
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">SF3B1 Mutations</td>
                            <td className="px-4 py-3 text-gray-700">
                                ~15%. RNA splicing gene. Associated with <strong>intermediate prognosis</strong> and
                                fludarabine resistance. May indicate need for novel agents.
                            </td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">Complex Karyotype</td>
                            <td className="px-4 py-3 text-gray-700">
                                ≥3 abnormalities. Increasingly recognized as an <strong>independent adverse factor</strong>,
                                especially ≥5 abnormalities. Contributes to prognostic scoring.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        {/* Section 4: The Treatment Revolution */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-teal-600">💊</span> The Treatment Revolution — Chemotherapy-Free Era
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                CLL treatment has undergone a <strong>complete paradigm shift</strong>. Chemotherapy-based regimens
                (FCR, BR) that were standard until ~2015 have been largely replaced by targeted therapies with
                dramatically better outcomes and tolerability. Most CLL patients today never receive chemotherapy.
            </p>

            <div className="space-y-4">
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">🎯 BTK Inhibitors — Continuous Therapy</h4>
                    <div className="space-y-3 mt-3">
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                            <h5 className="font-semibold text-teal-900 text-sm mb-1">Ibrutinib (Imbruvica®) — 1st Generation</h5>
                            <p className="text-xs text-teal-700">
                                The first oral BTK inhibitor (approved 2014). Irreversibly binds to BTK at the C481
                                residue. Revolutionized CLL treatment but causes <strong>off-target effects</strong>:
                                atrial fibrillation (~10-15%), hypertension, bleeding, and arthralgias — leading to
                                ~20% discontinuation rates.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                            <h5 className="font-semibold text-teal-900 text-sm mb-1">Acalabrutinib (Calquence®) — 2nd Generation</h5>
                            <p className="text-xs text-teal-700">
                                More selective for BTK with <strong>fewer off-target effects</strong>. Lower rates of
                                atrial fibrillation and bleeding. The ELEVATE-RR trial showed non-inferior efficacy to
                                ibrutinib with better tolerability. Taken twice daily.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                            <h5 className="font-semibold text-teal-900 text-sm mb-1">Zanubrutinib (Brukinsa®) — 2nd Generation</h5>
                            <p className="text-xs text-teal-700">
                                Designed for <strong>sustained, complete BTK occupancy</strong>. The ALPINE trial demonstrated
                                <strong>superiority over ibrutinib</strong> in relapsed CLL with lower cardiac toxicity.
                                Increasingly used as the preferred BTK inhibitor.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-teal-200">
                            <h5 className="font-semibold text-teal-900 text-sm mb-1">Pirtobrutinib (Jaypirca®) — Non-Covalent BTKi</h5>
                            <p className="text-xs text-teal-700">
                                A <strong>reversible (non-covalent) BTK inhibitor</strong> effective against the C481S
                                resistance mutation that causes failure of covalent BTK inhibitors. Provides a critical
                                option for patients who have progressed on ibrutinib/acalabrutinib/zanubrutinib.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">💥 Venetoclax — Time-Limited Therapy</h4>
                    <p className="text-sm text-blue-700 mb-2">
                        A <strong>BCL-2 inhibitor</strong> that directly targets CLL's survival mechanism by blocking
                        the anti-apoptotic BCL-2 protein. Combined with <strong>obinutuzumab (anti-CD20)</strong>,
                        it enables a <strong>fixed-duration, 12-month treatment</strong> — after which patients stop
                        all therapy. Key considerations:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 pl-4">
                        <li>• Requires a 5-week <strong>dose ramp-up</strong> to prevent tumor lysis syndrome (TLS)</li>
                        <li>• Achieves <strong>undetectable MRD</strong> in ~75% of patients — the deepest responses in CLL</li>
                        <li>• Particularly effective in <strong>mutated IGHV</strong> CLL (very long remissions)</li>
                        <li>• Can be re-used at relapse if prior remission was long</li>
                    </ul>
                </div>
            </div>

            <div className="bg-rose-50 p-5 rounded-xl border border-rose-100 mt-6">
                <h4 className="font-bold text-rose-900 mb-2">🔮 The BTKi + Venetoclax Combination (Fixed Duration)</h4>
                <p className="text-sm text-rose-800">
                    The most exciting frontier in CLL: combining a BTK inhibitor with venetoclax for <strong>fixed-
                        duration, chemotherapy-free treatment</strong>. Trials like CLL13, GLOW, and MAJESTY show
                    unprecedented rates of <strong>undetectable MRD</strong> (&gt;80%) with 1-2 years of treatment.
                    This approach aims to achieve deep remissions that may last years — potentially moving CLL toward
                    a <strong>functionally curable</strong> disease for many patients.
                </p>
            </div>
        </section>

        {/* Section 5: Complications & Special Situations */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">⚠️</span> Complications & Special Situations
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
                CLL causes unique complications beyond cytopenias — particularly immune dysfunction and the
                risk of high-grade transformation.
            </p>

            <div className="space-y-4">
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">🔄 Richter's Transformation</h4>
                    <p className="text-sm text-rose-700">
                        ~2-10% of CLL patients develop <strong>Richter's transformation</strong> — conversion to an
                        aggressive lymphoma, usually <strong>diffuse large B-cell lymphoma (DLBCL)</strong>. Presents
                        with rapidly enlarging lymph nodes, B-symptoms, and elevated LDH. Prognosis is poor (median
                        survival 6-12 months). Diagnosis requires lymph node biopsy. PET-CT can help identify the
                        transformed site. Risk factors include NOTCH1 mutations, unmutated IGHV, and del(17p).
                    </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">🛡️ Immune Dysfunction</h4>
                    <p className="text-sm text-rose-700">
                        CLL causes profound <strong>immunosuppression</strong> through multiple mechanisms:
                        hypogammaglobulinemia (low antibody levels), impaired T-cell function, and complement
                        deficiency. Patients are highly susceptible to <strong>infections</strong> (the most common
                        cause of death) — particularly bacterial pneumonia, herpes zoster reactivation, and
                        opportunistic infections. IVIG supplementation helps patients with recurrent infections.
                    </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">🩸 Autoimmune Cytopenias</h4>
                    <p className="text-sm text-rose-700">
                        ~5-10% of CLL patients develop <strong>autoimmune hemolytic anemia (AIHA)</strong> or
                        <strong> immune thrombocytopenia (ITP)</strong>. The CLL cells stimulate auto-reactive
                        antibody production that destroys the patient's own red cells or platelets. This is treated
                        with steroids and often responds to CLL-directed therapy — important to distinguish from
                        CLL-related marrow failure, which has different treatment implications.
                    </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">🏥 Second Cancers</h4>
                    <p className="text-sm text-rose-700">
                        CLL patients have a <strong>2-7x increased risk</strong> of developing other cancers,
                        particularly skin cancers (melanoma and non-melanoma), lung cancer, and other hematologic
                        malignancies. This is partly due to immune surveillance failure and partly treatment-related.
                        Regular cancer screening is especially important in CLL patients.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 6: MRD & The Future */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">🎯</span> MRD Testing & The Future of CLL
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                <strong>Minimal Residual Disease (MRD)</strong> testing has become central to CLL management,
                particularly with time-limited therapies. Achieving <strong>undetectable MRD (uMRD)</strong>
                — fewer than 1 CLL cell per 10,000 leukocytes — correlates strongly with prolonged
                progression-free survival.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-2">🔬 MRD Testing Methods</h4>
                    <ul className="text-sm text-indigo-700 space-y-2">
                        <li>• <strong>Flow cytometry</strong> (10⁻⁴ sensitivity) — most commonly used; measures CLL-
                            specific surface markers</li>
                        <li>• <strong>ASO-PCR / NGS</strong> (10⁻⁵ to 10⁻⁶) — higher sensitivity; tracks the specific
                            IGHV gene rearrangement of each patient's CLL clone</li>
                        <li>• Can be measured in <strong>blood or bone marrow</strong> — blood MRD is becoming standard
                            for convenience</li>
                    </ul>
                </div>
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">🔮 Emerging Approaches</h4>
                    <ul className="text-sm text-teal-700 space-y-2">
                        <li>• <strong>CAR T-cell therapy</strong> (lisocabtagene maraleucel) — under investigation for
                            relapsed/refractory CLL; not yet standard</li>
                        <li>• <strong>Bispecific antibodies</strong> (epcoritamab, glofitamab) — CD20×CD3 bispecifics
                            showing promise in Richter's transformation</li>
                        <li>• <strong>MRD-guided treatment duration</strong> — stopping therapy when uMRD is achieved
                            rather than a fixed number of cycles</li>
                        <li>• <strong>Triple combinations</strong> (BTKi + venetoclax + anti-CD20) for deepest possible
                            responses</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Section 7: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Authoritative CLL Resources
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                These trusted organizations provide comprehensive, up-to-date information about CLL:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://bloodcancerunited.org/blood-cancer/leukemia/chronic-lymphocytic-leukemia-cll"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">Blood Cancer United — CLL</h4>
                    <p className="text-sm text-blue-600">Comprehensive CLL/SLL overview, diagnosis, and treatment information.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cllsociety.org"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-sky-50 rounded-xl border border-sky-100 hover:border-sky-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-sky-800 group-hover:text-sky-900 mb-1">CLL Society</h4>
                    <p className="text-sm text-sky-600">Patient-founded organization with expert webinars, specialist directory, and community support.</p>
                    <span className="text-xs text-sky-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cancer.gov/types/leukemia/patient/cll-treatment-pdq"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-green-800 group-hover:text-green-900 mb-1">NCI — CLL Treatment (PDQ®)</h4>
                    <p className="text-sm text-green-600">Detailed treatment information reviewed by oncology experts.</p>
                    <span className="text-xs text-green-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.lls.org/leukemia/chronic-lymphocytic-leukemia"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-orange-800 group-hover:text-orange-900 mb-1">LLS — Chronic Lymphocytic Leukemia</h4>
                    <p className="text-sm text-orange-600">Patient guides, caregiver support, and financial assistance programs.</p>
                    <span className="text-xs text-orange-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default CLLDeepDive;
