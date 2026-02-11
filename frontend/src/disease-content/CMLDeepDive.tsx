import React from 'react';
import philadelphiaChromosome from '../assets/philadelphia-chromosome.png';

// ─── CML Deep Dive Educational Content ────────────────────────────
const CMLDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: The Philadelphia Chromosome */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-600">🧬</span> The Philadelphia Chromosome — The Defining Mutation
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                CML is unique among cancers: it is driven by a <strong>single, well-defined genetic abnormality</strong> —
                the Philadelphia chromosome. Discovered in 1960 in Philadelphia (hence the name), it was the first
                chromosomal abnormality linked to any cancer and remains one of the most important discoveries in
                cancer biology.
            </p>

            <div className="my-8 bg-amber-50 rounded-xl border border-amber-100 p-6 flex flex-col items-center">
                <img
                    src={philadelphiaChromosome}
                    alt="Philadelphia Chromosome t(9;22) Translocation"
                    className="max-w-xl h-auto rounded-lg shadow-sm mb-4"
                />
                <p className="text-sm text-amber-700 text-center italic">
                    Figure 1: The reciprocal translocation between chromosomes 9 and 22 that creates the BCR-ABL1 fusion gene.
                </p>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">How It Forms</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                The Philadelphia chromosome results from a <strong>reciprocal translocation</strong> between
                chromosomes 9 and 22 — written as <strong>t(9;22)(q34.1;q11.2)</strong>:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">Step 1: The Break</h4>
                    <p className="text-sm text-blue-700">
                        The <strong>ABL1 gene</strong> on chromosome 9 and the <strong>BCR gene</strong> on chromosome 22
                        both break at specific locations. ABL1 normally encodes a tightly regulated tyrosine kinase involved
                        in cell growth signaling.
                    </p>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">Step 2: The Swap</h4>
                    <p className="text-sm text-amber-700">
                        The broken segments swap positions: the tail end of ABL1 moves to chromosome 22 and fuses with
                        BCR. This creates the shortened <strong>Philadelphia chromosome</strong> (derivative chromosome 22)
                        carrying the novel <strong>BCR-ABL1 fusion gene</strong>.
                    </p>
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">Step 3: The Oncogene</h4>
                    <p className="text-sm text-red-700">
                        The BCR-ABL1 fusion produces a <strong>constitutively active tyrosine kinase</strong> — it is
                        permanently "switched on." This drives uncontrolled proliferation of myeloid cells, blocks
                        apoptosis, and disrupts normal cell adhesion in the bone marrow.
                    </p>
                </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mt-4">
                <h4 className="font-bold text-indigo-900 mb-2">🔬 BCR-ABL1 Protein Variants</h4>
                <p className="text-sm text-indigo-800">
                    The breakpoint within the BCR gene determines which fusion protein is produced:
                    <strong> p210</strong> (major breakpoint, M-bcr) is found in virtually all CML cases,
                    <strong> p190</strong> (minor breakpoint, m-bcr) is more common in Ph+ ALL, and
                    <strong> p230</strong> (micro breakpoint) is rare and associated with a more indolent course.
                    The p210 protein has stronger kinase activity than normal ABL1, activating multiple downstream
                    pathways: <strong>RAS/MAPK</strong>, <strong>PI3K/AKT</strong>, and <strong>JAK/STAT</strong>.
                </p>
            </div>
        </section>

        {/* Section 2: The Three Phases of CML */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📊</span> The Three Phases of CML
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                CML is unique among leukemias in having a <strong>predictable, stepwise progression</strong> through
                three distinct phases. Without treatment, CML inevitably progresses from chronic to blast phase.
                With modern TKI therapy, the vast majority of patients remain in chronic phase indefinitely.
            </p>

            <div className="space-y-4 my-6">
                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold">Phase 1</span>
                        <h4 className="font-bold text-green-800">Chronic Phase (CP) — ~85-90% at Diagnosis</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-green-700 mb-2">
                                The earliest and most treatable phase. The disease is <strong>relatively stable</strong> —
                                myeloid cells still differentiate and function, but they are produced in excess.
                            </p>
                            <ul className="text-sm text-green-700 space-y-1 pl-4">
                                <li>• Blasts <strong>&lt;10%</strong> in blood and marrow</li>
                                <li>• Elevated WBC (often 50,000-200,000+)</li>
                                <li>• Expanded granulocyte pool — "left shift" with all stages visible</li>
                                <li>• Basophilia and eosinophilia common</li>
                                <li>• Splenomegaly in many patients</li>
                            </ul>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <p className="text-xs text-green-800 font-semibold mb-1">With TKI Therapy:</p>
                            <p className="text-sm text-green-700">
                                ~95% of chronic phase patients achieve <strong>complete cytogenetic response</strong> (no
                                Philadelphia chromosome detectable). Many achieve <strong>deep molecular response</strong>
                                (BCR-ABL1 ≤0.01%), and some can even <strong>discontinue therapy</strong> (treatment-free
                                remission).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="text-2xl text-gray-400">↓</div>
                </div>

                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-amber-600 text-white rounded-lg text-sm font-bold">Phase 2</span>
                        <h4 className="font-bold text-amber-800">Accelerated Phase (AP)</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-amber-700 mb-2">
                                A transitional phase indicating the disease is becoming <strong>more aggressive</strong>.
                                Additional genetic mutations accumulate, and the CML clone begins losing the ability to
                                differentiate normally.
                            </p>
                            <ul className="text-sm text-amber-700 space-y-1 pl-4">
                                <li>• Blasts <strong>10-19%</strong> in blood or marrow</li>
                                <li>• Basophils <strong>≥20%</strong> in blood</li>
                                <li>• Persistent thrombocytopenia or thrombocytosis</li>
                                <li>• Increasing spleen size despite treatment</li>
                                <li>• Additional cytogenetic abnormalities ("clonal evolution")</li>
                            </ul>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-lg">
                            <p className="text-xs text-amber-800 font-semibold mb-1">Treatment Implications:</p>
                            <p className="text-sm text-amber-700">
                                Requires a change in TKI (often to a more potent 2nd or 3rd generation agent). Allogeneic
                                stem cell transplant may be considered. Response to TKIs is still possible but less durable.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="text-2xl text-gray-400">↓</div>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold">Phase 3</span>
                        <h4 className="font-bold text-red-800">Blast Phase (BP) — "Blast Crisis"</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-red-700 mb-2">
                                The most advanced phase — CML has effectively transformed into an <strong>acute leukemia</strong>.
                                Blast phase can be myeloid (~60-70%) or lymphoid (~20-30%), which affects treatment choice.
                            </p>
                            <ul className="text-sm text-red-700 space-y-1 pl-4">
                                <li>• Blasts <strong>≥20%</strong> in blood or marrow</li>
                                <li>• Extramedullary blast proliferation (chloromas)</li>
                                <li>• Behaves like acute leukemia (AML or ALL)</li>
                                <li>• Multiple additional genetic mutations present</li>
                            </ul>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <p className="text-xs text-red-800 font-semibold mb-1">Prognosis:</p>
                            <p className="text-sm text-red-700">
                                The most challenging phase to treat. Requires <strong>AML- or ALL-type chemotherapy plus
                                    TKI</strong>. Allogeneic transplant is the only potentially curative option.
                                Lymphoid blast crisis generally has better outcomes than myeloid blast crisis.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 3: How CML Affects Blood Production */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">🩸</span> How CML Affects Blood Production
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Unlike AML, where immature blasts dominate, CML in chronic phase produces an <strong>overabundance
                    of maturing granulocytes</strong>. The cells still differentiate — they just don't stop proliferating.
                This creates a characteristic blood picture that experienced hematologists can recognize at a glance.
            </p>

            <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2">📈 The Characteristic Blood Picture</h4>
                    <p className="text-sm text-orange-700">
                        CML is often discovered incidentally via routine blood work. The <strong>complete blood count
                            (CBC)</strong> shows dramatically elevated white blood cell counts — often
                        <strong> 50,000-300,000/μL</strong> (normal: 4,500-11,000). The differential reveals a
                        "left shift" with <strong>all stages of granulocyte maturation</strong> visible:
                        myeloblasts, promyelocytes, myelocytes, metamyelocytes, bands, and mature neutrophils.
                        This orderly maturation pattern distinguishes CML from AML.
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2">🔬 Basophilia — A Hallmark</h4>
                    <p className="text-sm text-orange-700">
                        Elevated basophils are a <strong>distinctive feature of CML</strong> and relatively rare in other
                        conditions. Rising basophil counts on therapy may signal <strong>disease progression</strong>.
                        Eosinophilia is also common. Together with the left shift, these findings are nearly
                        pathognomonic for CML.
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2">🫀 Splenomegaly</h4>
                    <p className="text-sm text-orange-700">
                        The spleen enlarges as it filters the massive excess of circulating granulocytes. Some patients
                        present with <strong>massive splenomegaly</strong> — a spleen extending well below the navel —
                        causing left-sided abdominal pain, early satiety, and weight loss. Splenic infarction can occur.
                        Spleen size typically normalizes with successful TKI therapy.
                    </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2">⚡ Leukostasis</h4>
                    <p className="text-sm text-orange-700">
                        When WBC counts exceed <strong>100,000/μL</strong>, there is a risk of <strong>leukostasis</strong> —
                        white cells sludging in small blood vessels of the lungs and brain. Symptoms include shortness of
                        breath, confusion, and visual changes. This is a medical emergency requiring immediate treatment
                        with hydroxyurea and/or leukapheresis to rapidly reduce the white cell count.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 4: TKI Revolution — The Greatest Success Story */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">💊</span> The TKI Revolution — Cancer's Greatest Success Story
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                The development of <strong>imatinib (Gleevec®)</strong> in 2001 transformed CML from a fatal disease
                (median survival 3-5 years) to a <strong>manageable chronic condition</strong> with near-normal life
                expectancy. It is widely considered the greatest success story in targeted cancer therapy and the
                model for precision medicine.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Generations of TKIs</h3>
            <div className="space-y-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">1ST GEN</span>
                        <h4 className="font-bold text-green-800">Imatinib (Gleevec®)</h4>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                        The original BCR-ABL1 inhibitor. Binds the <strong>ATP-binding pocket</strong> of the ABL1 kinase
                        in its inactive conformation, blocking its enzymatic activity. Approved in 2001 after landmark
                        clinical trials showed <strong>~95% complete cytogenetic response</strong> in chronic phase CML.
                        Now available as a generic medication.
                    </p>
                    <p className="text-xs text-green-600 italic">
                        The IRIS trial (2003-present) showed that patients who achieved optimal response to imatinib have
                        near-normal life expectancy — a truly transformative result.
                    </p>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs font-bold">2ND GEN</span>
                        <h4 className="font-bold text-blue-800">Dasatinib (Sprycel®) & Nilotinib (Tasigna®)</h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                        Developed to overcome imatinib resistance and achieve faster, deeper responses.
                        <strong> Dasatinib</strong> is ~325x more potent than imatinib <em>in vitro</em> and also
                        inhibits SRC family kinases. It can cross the blood-brain barrier. <strong>Nilotinib</strong>
                        is more selective for BCR-ABL1 and achieves deeper molecular responses faster.
                    </p>
                    <p className="text-xs text-blue-600 italic">
                        Both can be used as frontline therapy or after imatinib failure. Side effect profiles differ:
                        dasatinib (pleural effusions), nilotinib (cardiovascular events, metabolic effects).
                    </p>
                </div>

                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-purple-600 text-white rounded-md text-xs font-bold">2ND GEN</span>
                        <h4 className="font-bold text-purple-800">Bosutinib (Bosulif®)</h4>
                    </div>
                    <p className="text-sm text-purple-700 mb-2">
                        Another 2nd-generation TKI with activity against most BCR-ABL1 mutations. Approved for both
                        newly diagnosed and resistant/intolerant CML. Primarily causes GI side effects (diarrhea) rather
                        than the cardiovascular or pulmonary effects of other TKIs.
                    </p>
                </div>

                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-xs font-bold">3RD GEN</span>
                        <h4 className="font-bold text-amber-800">Ponatinib (Iclusig®)</h4>
                    </div>
                    <p className="text-sm text-amber-700 mb-2">
                        The only TKI effective against the notoriously resistant <strong>T315I "gatekeeper"
                            mutation</strong> — a single amino acid change that blocks 1st and 2nd generation TKIs from
                        binding. Ponatinib was designed specifically to overcome this mutation using a carbon-carbon
                        triple bond that bypasses the bulky isoleucine residue.
                    </p>
                    <p className="text-xs text-amber-600 italic">
                        Carries a boxed warning for arterial thrombotic events — dose optimization strategies are used
                        to minimize vascular risk while maintaining efficacy.
                    </p>
                </div>

                <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-xs font-bold">STAMP INHIBITOR</span>
                        <h4 className="font-bold text-rose-800">Asciminib (Scemblix®)</h4>
                    </div>
                    <p className="text-sm text-rose-700 mb-2">
                        A revolutionary <strong>STAMP (Specifically Targeting the ABL Myristoyl Pocket)</strong>
                        inhibitor — it works by a completely different mechanism than all other TKIs. Instead of
                        blocking the ATP-binding site, asciminib targets the <strong>myristoyl pocket</strong> on ABL1,
                        an allosteric regulatory site. This means it can overcome virtually all ATP-binding site mutations,
                        including T315I when combined with a conventional TKI.
                    </p>
                    <p className="text-xs text-rose-600 italic">
                        The ASC4FIRST trial showed asciminib superiority over investigator-selected TKIs as frontline
                        therapy, potentially establishing it as a new standard of care.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 5: Monitoring & Response Milestones */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">📋</span> Monitoring & Response Milestones
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                CML monitoring is unusually precise compared to other cancers. The BCR-ABL1 transcript level can be
                measured with extreme sensitivity using <strong>quantitative PCR (qPCR)</strong>, allowing clinicians
                to track the disease on the <strong>International Scale (IS)</strong>.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Response Levels</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Response</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">BCR-ABL1 (IS)</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Meaning</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">CHR</td>
                            <td className="px-4 py-3 text-gray-700">—</td>
                            <td className="px-4 py-3 text-gray-700">Complete Hematologic Response — normal blood counts</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">CCyR</td>
                            <td className="px-4 py-3 text-gray-700">~1% (≤1%)</td>
                            <td className="px-4 py-3 text-gray-700">Complete Cytogenetic Response — no Ph+ cells on karyotype</td>
                        </tr>
                        <tr className="bg-green-50">
                            <td className="px-4 py-3 font-medium text-green-900">MMR (MR3)</td>
                            <td className="px-4 py-3 font-bold text-green-700">≤0.1%</td>
                            <td className="px-4 py-3 text-green-700">Major Molecular Response — key milestone; 3-log reduction</td>
                        </tr>
                        <tr className="bg-blue-50">
                            <td className="px-4 py-3 font-medium text-blue-900">MR4</td>
                            <td className="px-4 py-3 font-bold text-blue-700">≤0.01%</td>
                            <td className="px-4 py-3 text-blue-700">Deep Molecular Response — 4-log reduction; approaching TFR eligibility</td>
                        </tr>
                        <tr className="bg-purple-50">
                            <td className="px-4 py-3 font-medium text-purple-900">MR4.5</td>
                            <td className="px-4 py-3 font-bold text-purple-700">≤0.0032%</td>
                            <td className="px-4 py-3 text-purple-700">4.5-log reduction — threshold for Treatment-Free Remission (TFR) attempts</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">ELN Time-Based Milestones</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                The European LeukemiaNet (ELN) guidelines set specific response milestones at each time point.
                Failure to achieve these milestones prompts consideration of a TKI switch:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                    <span className="font-bold text-gray-900 text-sm">3 months</span>
                    <p className="text-gray-600 mt-1">BCR-ABL1 ≤10%</p>
                    <p className="text-gray-400">(and/or Ph+ ≤35%)</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                    <span className="font-bold text-gray-900 text-sm">6 months</span>
                    <p className="text-gray-600 mt-1">BCR-ABL1 ≤1%</p>
                    <p className="text-gray-400">(CCyR achieved)</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                    <span className="font-bold text-gray-900 text-sm">12 months</span>
                    <p className="text-gray-600 mt-1">BCR-ABL1 ≤0.1%</p>
                    <p className="text-gray-400">(MMR achieved)</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                    <span className="font-bold text-gray-900 text-sm">Ongoing</span>
                    <p className="text-gray-600 mt-1">BCR-ABL1 ≤0.1%</p>
                    <p className="text-gray-400">(Maintain MMR)</p>
                </div>
            </div>
        </section>

        {/* Section 6: Treatment-Free Remission */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-teal-600">🎯</span> Treatment-Free Remission — Can CML Be "Cured"?
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                One of the most exciting developments in CML is the possibility of <strong>treatment-free remission
                    (TFR)</strong> — safely stopping TKI therapy while maintaining undetectable disease levels. This
                challenges the traditional assumption that CML patients need lifelong therapy.
            </p>

            <div className="space-y-4">
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">📋 Eligibility Criteria for TFR</h4>
                    <ul className="text-sm text-teal-700 space-y-2">
                        <li>• At least <strong>3 years</strong> of TKI therapy (some guidelines say 5+)</li>
                        <li>• Sustained <strong>deep molecular response (MR4 or MR4.5)</strong> for at least <strong>2 years</strong></li>
                        <li>• Chronic phase CML only (no history of accelerated or blast phase)</li>
                        <li>• Access to reliable, frequent <strong>molecular monitoring</strong> (monthly for 6-12 months, then quarterly)</li>
                        <li>• Patient understanding and willingness for close follow-up</li>
                    </ul>
                </div>
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">📊 What Happens After Stopping?</h4>
                    <p className="text-sm text-teal-700 mb-2">
                        Landmark studies (STIM, EURO-SKI, DESTINY) have shown:
                    </p>
                    <ul className="text-sm text-teal-700 space-y-1 pl-4">
                        <li>• <strong>~50%</strong> of patients maintain TFR long-term after stopping TKIs</li>
                        <li>• Most relapses occur within the <strong>first 6 months</strong></li>
                        <li>• Virtually all patients who relapse <strong>respond again</strong> when TKI is restarted</li>
                        <li>• ~20-30% experience <strong>"TKI withdrawal syndrome"</strong> — musculoskeletal pain that resolves over weeks</li>
                        <li>• A second TFR attempt is possible for some patients who relapse and re-achieve deep response</li>
                    </ul>
                </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mt-6">
                <h4 className="font-bold text-indigo-900 mb-2">🔬 Why TFR Works: Immune Surveillance</h4>
                <p className="text-sm text-indigo-800">
                    Current evidence suggests that patients who maintain TFR have effective <strong>immune surveillance</strong>
                    against residual CML cells. NK cells and T-cells appear to keep the small remaining CML clone in check.
                    Research into boosting this immune response (e.g., interferon-α, immune checkpoint approaches) may
                    expand the proportion of patients eligible for TFR in the future.
                </p>
            </div>
        </section>

        {/* Section 7: Resistance & Mutation Testing */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">⚡</span> Resistance Mechanisms & Mutation Testing
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                While TKIs are remarkably effective, <strong>~20-25% of patients</strong> will develop resistance or
                intolerance to their initial TKI. Understanding resistance mechanisms is key to selecting the right
                next therapy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">BCR-ABL1 Dependent (Mutations)</h4>
                    <p className="text-sm text-red-700 mb-2">
                        Mutations in the ABL1 kinase domain that prevent TKI binding:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 pl-4">
                        <li>• <strong>T315I</strong> — "gatekeeper" mutation; resistant to all TKIs except ponatinib and asciminib</li>
                        <li>• <strong>E255K/V, Y253H</strong> — P-loop mutations; often resistant to imatinib</li>
                        <li>• <strong>F317L</strong> — resistant to dasatinib specifically</li>
                        <li>• <strong>Compound mutations</strong> — two mutations on the same molecule; increasingly challenging</li>
                    </ul>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">BCR-ABL1 Independent</h4>
                    <p className="text-sm text-amber-700 mb-2">
                        Resistance mechanisms not involving the target itself:
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1 pl-4">
                        <li>• <strong>Drug efflux</strong> — increased expression of MDR1/P-glycoprotein pumps</li>
                        <li>• <strong>Alternative pathway activation</strong> — SRC, LYN, or other kinases bypass BCR-ABL1</li>
                        <li>• <strong>Clonal evolution</strong> — additional genetic changes provide survival advantage</li>
                        <li>• <strong>Pharmacokinetic factors</strong> — poor drug absorption or drug interactions</li>
                    </ul>
                </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mt-4">
                <h4 className="font-bold text-blue-900 mb-2">🧪 ABL1 Kinase Domain Mutation Testing</h4>
                <p className="text-sm text-blue-800">
                    When a patient loses response to a TKI, <strong>ABL1 mutation testing</strong> (by Sanger sequencing
                    or next-generation sequencing) is performed to identify the specific resistance mutation. This directly
                    guides TKI selection — for example, T315I requires ponatinib or asciminib, while F317L warrants
                    switching away from dasatinib. This is one of the clearest examples of <strong>precision medicine</strong>
                    in oncology.
                </p>
            </div>
        </section>

        {/* Section 8: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Authoritative CML Resources
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                These trusted organizations provide comprehensive, up-to-date information about CML:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://bloodcancerunited.org/blood-cancer/leukemia/chronic-myeloid-leukemia-cml"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">Blood Cancer United — CML</h4>
                    <p className="text-sm text-blue-600">Comprehensive CML overview, diagnosis, and treatment information.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.lls.org/leukemia/chronic-myeloid-leukemia"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-orange-800 group-hover:text-orange-900 mb-1">LLS — Chronic Myeloid Leukemia</h4>
                    <p className="text-sm text-orange-600">Patient guides, support programs, and financial assistance.</p>
                    <span className="text-xs text-orange-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cancer.gov/types/leukemia/patient/cml-treatment-pdq"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-green-800 group-hover:text-green-900 mb-1">NCI — CML Treatment (PDQ®)</h4>
                    <p className="text-sm text-green-600">Detailed treatment information reviewed by oncology experts.</p>
                    <span className="text-xs text-green-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.nccn.org/patients/guidelines/content/PDF/cml-patient.pdf"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-purple-800 group-hover:text-purple-900 mb-1">NCCN — CML Patient Guidelines</h4>
                    <p className="text-sm text-purple-600">Patient-friendly version of the clinical practice guidelines.</p>
                    <span className="text-xs text-purple-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default CMLDeepDive;
