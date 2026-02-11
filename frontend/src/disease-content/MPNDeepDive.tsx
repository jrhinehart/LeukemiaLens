import React from 'react';

// ─── MPN Deep Dive Educational Content ────────────────────────────
const MPNDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: What Are MPNs? */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-rose-600">🔬</span> Understanding MPNs — Overproduction, Not Failure
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Myeloproliferative Neoplasms are the <strong>opposite of MDS</strong>. While MDS features bone marrow
                that fails to produce mature cells, MPNs are characterized by <strong>overproduction of mature,
                    functional blood cells</strong>. The bone marrow is too active, producing excess quantities of one
                or more blood cell lineages — red blood cells, platelets, or white blood cells — leading to
                thickened blood, clotting risks, and eventual marrow scarring.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-red-50 p-5 rounded-xl border border-red-100 text-center">
                    <div className="text-3xl mb-2">🩸</div>
                    <h4 className="font-bold text-red-800 mb-1">Polycythemia Vera (PV)</h4>
                    <p className="text-sm text-red-700">
                        <strong>Too many red blood cells</strong><br />
                        Thick blood → clotting risk<br />
                        JAK2 V617F in &gt;95%
                    </p>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 text-center">
                    <div className="text-3xl mb-2">🩹</div>
                    <h4 className="font-bold text-amber-800 mb-1">Essential Thrombocythemia (ET)</h4>
                    <p className="text-sm text-amber-700">
                        <strong>Too many platelets</strong><br />
                        Clotting + paradoxical bleeding<br />
                        JAK2, CALR, or MPL mutations
                    </p>
                </div>
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 text-center">
                    <div className="text-3xl mb-2">🦴</div>
                    <h4 className="font-bold text-purple-800 mb-1">Myelofibrosis (MF)</h4>
                    <p className="text-sm text-purple-700">
                        <strong>Bone marrow scarring</strong><br />
                        Fibrosis replaces marrow → cytopenias<br />
                        Most aggressive classic MPN
                    </p>
                </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">📝 Note: CML Is Also an MPN</h4>
                <p className="text-sm text-gray-700">
                    Chronic Myeloid Leukemia was historically classified as an MPN but is now treated as a distinct
                    entity because of its <strong>unique biology (BCR-ABL1)</strong> and specific treatment (TKIs).
                    The "classic" BCR-ABL1-negative MPNs discussed here are PV, ET, and MF. These share overlapping
                    features and can <strong>evolve from one into another</strong> over time.
                </p>
            </div>
        </section>

        {/* Section 2: The Driver Mutations */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-emerald-600">🧬</span> The Three Driver Mutations
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                ~90% of MPNs are driven by a mutation in one of <strong>three genes</strong> — all converging on the
                same pathway: constitutive activation of <strong>JAK-STAT signaling</strong>, which drives
                uncontrolled blood cell production. These mutations are <strong>mutually exclusive</strong> — a
                patient carries one or none.
            </p>

            <div className="space-y-4 my-6">
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-xs font-bold">MOST COMMON</span>
                        <h4 className="font-bold text-emerald-800">JAK2 V617F (~60% of MPNs)</h4>
                    </div>
                    <p className="text-sm text-emerald-700 mb-2">
                        A single point mutation in the <strong>Janus Kinase 2</strong> gene that removes the
                        auto-inhibitory function of the pseudokinase domain. The result: JAK2 is <strong>always
                            turned on</strong>, continuously sending growth signals regardless of cytokine input.
                    </p>
                    <ul className="text-sm text-emerald-700 space-y-1 pl-4">
                        <li>• Present in <strong>&gt;95% of PV</strong>, ~55% of ET, ~65% of MF</li>
                        <li>• Discovered in 2005 — transformed MPN diagnosis</li>
                        <li>• <strong>Allele burden matters</strong>: homozygous JAK2 (two copies) is associated with PV phenotype and higher risk</li>
                        <li>• JAK2 exon 12 mutations: rare variants found in ~3% of PV patients without V617F</li>
                    </ul>
                </div>
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs font-bold">2ND MOST COMMON</span>
                        <h4 className="font-bold text-blue-800">CALR Mutations (~25% of MPNs)</h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                        Mutations in <strong>calreticulin</strong> — an endoplasmic reticulum chaperone protein.
                        Mutant CALR binds to the <strong>MPL (thrombopoietin receptor)</strong> and activates
                        JAK-STAT signaling constitutively:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1 pl-4">
                        <li>• Found in ~25-30% of ET and ~25-30% of MF; <strong>not found in PV</strong></li>
                        <li>• <strong>Type 1 (52-bp deletion)</strong>: more common in MF, intermediate prognosis</li>
                        <li>• <strong>Type 2 (5-bp insertion)</strong>: more common in ET, generally favorable prognosis</li>
                        <li>• CALR-mutated ET has the <strong>lowest thrombosis risk</strong> of all MPN genotypes</li>
                    </ul>
                </div>
                <div className="bg-violet-50 p-5 rounded-xl border border-violet-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-violet-600 text-white rounded-md text-xs font-bold">LEAST COMMON</span>
                        <h4 className="font-bold text-violet-800">MPL Mutations (~5% of MPNs)</h4>
                    </div>
                    <p className="text-sm text-violet-700">
                        Mutations in the <strong>thrombopoietin receptor (MPL)</strong> itself — most commonly
                        W515L/K — that cause the receptor to signal without binding thrombopoietin. Found in
                        ~3-5% of ET and ~5-8% of MF. Never found in PV. Associated with older age, lower
                        hemoglobin, and higher platelet counts.
                    </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-gray-600 text-white rounded-md text-xs font-bold">~10%</span>
                        <h4 className="font-bold text-gray-800">"Triple Negative" MPNs</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                        About 10% of ET and 10% of MF patients lack all three driver mutations. These
                        <strong>"triple negative"</strong> cases often have non-canonical JAK-STAT pathway mutations
                        and carry the <strong>worst prognosis</strong> in myelofibrosis — associated with higher
                        leukemic transformation risk and shorter survival.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 3: Polycythemia Vera Deep Dive */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">🩸</span> Polycythemia Vera (PV) — Too Many Red Cells
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                PV is characterized by <strong>uncontrolled red blood cell production</strong>, leading to dangerously
                thick blood. It is the most common MPN, with a median age at diagnosis of ~60 years. The overproduction
                of red cells increases blood viscosity, causing the hallmark risk of <strong>thrombosis</strong> — the
                leading cause of morbidity and mortality.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">⚠️ Symptoms & Presentation</h4>
                    <ul className="text-sm text-red-700 space-y-2">
                        <li>• <strong>Headache, dizziness, visual disturbances</strong> — from hyperviscosity</li>
                        <li>• <strong>Aquagenic pruritus</strong> — intense itching after bathing, often the most
                            distressing symptom; caused by mast cell activation</li>
                        <li>• <strong>Erythromelalgia</strong> — burning pain and redness in hands/feet</li>
                        <li>• <strong>Plethoric (ruddy) complexion</strong></li>
                        <li>• <strong>Splenomegaly</strong> (~70%)</li>
                        <li>• <strong>Thrombosis</strong> — stroke, MI, DVT/PE, hepatic vein (Budd-Chiari), portal vein</li>
                    </ul>
                </div>
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2">💊 PV Treatment</h4>
                    <ul className="text-sm text-orange-700 space-y-2">
                        <li>• <strong>Phlebotomy</strong> — first-line for ALL PV patients; target hematocrit &lt;45%
                            (CYTO-PV trial showed this reduces cardiovascular events by 4×)</li>
                        <li>• <strong>Low-dose aspirin</strong> — all patients unless contraindicated; reduces thrombosis
                            risk (ECLAP trial)</li>
                        <li>• <strong>Hydroxyurea</strong> — cytoreductive therapy for high-risk PV (age ≥60 or prior
                            thrombosis)</li>
                        <li>• <strong>Interferon alfa / Ropeginterferon</strong> — preferred in younger patients; can
                            reduce JAK2 allele burden and achieve molecular responses</li>
                        <li>• <strong>Ruxolitinib (Jakafi®)</strong> — for hydroxyurea-resistant/intolerant PV; controls
                            hematocrit, reduces spleen, and alleviates symptoms</li>
                    </ul>
                </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2">🔄 Disease Evolution</h4>
                <p className="text-sm text-amber-800">
                    PV can evolve into <strong>post-PV myelofibrosis</strong> (~10-15% at 15 years), characterized
                    by progressive bone marrow fibrosis, splenomegaly, and worsening cytopenias. Transformation to
                    <strong> AML</strong> occurs in ~3-5% of patients at 15 years (higher with certain treatments
                    like prolonged alkylating agent exposure).
                </p>
            </div>
        </section>

        {/* Section 4: Essential Thrombocythemia Deep Dive */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-600">🩹</span> Essential Thrombocythemia (ET) — Too Many Platelets
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                ET is characterized by <strong>sustained overproduction of platelets</strong>, often with counts
                exceeding 450,000/μL (normal: 150,000-400,000). Despite having the most indolent course of the
                classic MPNs, ET carries significant thrombotic risk and the paradox of <strong>both clotting
                    and bleeding complications</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">🧪 The Thrombosis-Bleeding Paradox</h4>
                    <p className="text-sm text-amber-700 mb-2">
                        While moderate platelet elevations increase clotting risk, <strong>extremely high counts
                            (&gt;1,000,000-1,500,000/μL)</strong> can paradoxically cause <strong>bleeding</strong>
                        through acquired von Willebrand syndrome — large vWF multimers are consumed by the excess
                        platelets. This is why aspirin must be used cautiously at very high platelet counts.
                    </p>
                </div>
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">💊 ET Treatment Strategy</h4>
                    <ul className="text-sm text-teal-700 space-y-2">
                        <li>• <strong>Low risk (age &lt;60, no prior thrombosis)</strong>: observation ± aspirin</li>
                        <li>• <strong>High risk</strong>: cytoreduction with hydroxyurea (first-line), anagrelide
                            (second-line — selectively reduces platelet production), or interferon alfa</li>
                        <li>• <strong>CALR-mutated, young patients</strong> may be safely observed even without aspirin
                            — they have the lowest thrombosis risk</li>
                    </ul>
                </div>
            </div>

            <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
                <h4 className="font-bold text-sky-900 mb-2">📊 Risk Stratification (IPSET-thrombosis)</h4>
                <p className="text-sm text-sky-800">
                    The revised IPSET-thrombosis model stratifies ET patients into 4 risk categories based on
                    <strong> age, thrombosis history, JAK2 status, and cardiovascular risk factors</strong>:
                    Very Low (CALR+, age &lt;60, no thrombosis), Low (JAK2−, age &lt;60), Intermediate
                    (JAK2+, age &lt;60), and High (age ≥60 or prior thrombosis). Only high-risk patients
                    clearly benefit from cytoreduction.
                </p>
            </div>
        </section>

        {/* Section 5: Myelofibrosis Deep Dive */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">🦴</span> Myelofibrosis (MF) — Bone Marrow Scarring
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Myelofibrosis is the <strong>most aggressive</strong> classic MPN. It can arise de novo
                (<strong>primary MF</strong>) or evolve from prior PV or ET (<strong>post-PV MF</strong> or
                <strong> post-ET MF</strong>). The hallmark is progressive <strong>bone marrow fibrosis</strong> —
                scar tissue replaces normal marrow, forcing blood production to shift to the spleen and liver
                (extramedullary hematopoiesis), causing massive organ enlargement.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-purple-800 mb-2">⚠️ Clinical Features</h4>
                    <ul className="text-sm text-purple-700 space-y-2">
                        <li>• <strong>Massive splenomegaly</strong> — often extending below the umbilicus; causes
                            early satiety, abdominal pain, and portal hypertension</li>
                        <li>• <strong>Constitutional symptoms</strong> — debilitating fatigue, night sweats, bone pain,
                            weight loss, and fevers (cytokine-driven)</li>
                        <li>• <strong>Anemia</strong> — progressive, often transfusion-dependent</li>
                        <li>• <strong>Leukoerythroblastic blood smear</strong> — teardrop-shaped red cells
                            (dacrocytes) and circulating immature myeloid cells</li>
                        <li>• <strong>"Dry tap"</strong> on bone marrow aspiration — the fibrotic marrow cannot be aspirated</li>
                    </ul>
                </div>
                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-2">📊 Risk Stratification (DIPSS / MIPSS70+)</h4>
                    <p className="text-sm text-indigo-700 mb-2">
                        Multiple scoring systems guide treatment:
                    </p>
                    <ul className="text-sm text-indigo-700 space-y-1 pl-4">
                        <li>• <strong>DIPSS</strong>: age, symptoms, hemoglobin, WBC, blood blasts</li>
                        <li>• <strong>MIPSS70+ v2.0</strong>: adds cytogenetics + mutations (ASXL1, SRSF2, EZH2, IDH1/2, U2AF1)</li>
                        <li>• <strong>High-molecular-risk (HMR) mutations</strong>: ≥1 of ASXL1, SRSF2, EZH2, IDH1/2 — independently shortens survival</li>
                        <li>• Risk determines transplant candidacy — the only curative therapy</li>
                    </ul>
                </div>
            </div>

            <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                <h4 className="font-bold text-teal-800 mb-3">💊 MF Treatment Landscape</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                        <h5 className="font-semibold text-teal-900 text-sm mb-1">Ruxolitinib (Jakafi®)</h5>
                        <p className="text-xs text-teal-700">
                            First-line JAK1/2 inhibitor. Dramatically reduces <strong>splenomegaly</strong> (~35% volume
                            reduction in COMFORT trials) and <strong>constitutional symptoms</strong>. Modestly improves
                            survival. Does not eliminate the MF clone or reverse fibrosis.
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                        <h5 className="font-semibold text-teal-900 text-sm mb-1">Fedratinib (Inrebic®)</h5>
                        <p className="text-xs text-teal-700">
                            JAK2-selective inhibitor. Effective as <strong>second-line after ruxolitinib failure</strong>.
                            Requires monitoring for Wernicke's encephalopathy risk (thiamine levels).
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                        <h5 className="font-semibold text-teal-900 text-sm mb-1">Pacritinib (Vonjo®)</h5>
                        <p className="text-xs text-teal-700">
                            JAK2/IRAK1 inhibitor uniquely suited for patients with <strong>severe thrombocytopenia
                                (platelets &lt;50,000)</strong> — where ruxolitinib cannot be safely dosed. The only JAK
                            inhibitor approved without a platelet requirement.
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                        <h5 className="font-semibold text-teal-900 text-sm mb-1">Momelotinib (Ojjaara®)</h5>
                        <p className="text-xs text-teal-700">
                            JAK1/2 + ACVR1 inhibitor. Uniquely addresses <strong>anemia</strong> in MF by inhibiting
                            hepcidin (via ACVR1), improving iron availability. Approved for MF with anemia.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50 p-5 rounded-xl border border-rose-100 mt-4">
                <h4 className="font-bold text-rose-900 mb-2">🏥 Allogeneic Stem Cell Transplant</h4>
                <p className="text-sm text-rose-800">
                    The <strong>only curative treatment</strong> for myelofibrosis. Reserved for intermediate-2
                    and high-risk patients who are transplant candidates (typically age &lt;70, good organ function).
                    Transplant-related mortality is ~15-25%, but long-term disease-free survival is 40-60%.
                    Ruxolitinib is often used as a <strong>bridge to transplant</strong> to reduce spleen size and
                    improve symptoms pre-transplant.
                </p>
            </div>
        </section>

        {/* Section 6: MPN Complications & Transformation */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-orange-600">⚠️</span> Complications & Disease Transformation
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                MPNs are chronic diseases that carry risks of both <strong>vascular complications</strong> and
                <strong> transformation</strong> to more aggressive diseases over time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">🫀 Thrombosis — The Major Killer</h4>
                    <p className="text-sm text-red-700">
                        Thrombosis is the <strong>leading cause of morbidity and mortality</strong> in PV and ET:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 pl-4 mt-2">
                        <li>• <strong>Arterial</strong>: stroke, MI, peripheral arterial occlusion</li>
                        <li>• <strong>Venous</strong>: DVT/PE, splanchnic vein thrombosis (Budd-Chiari syndrome,
                            portal vein thrombosis — nearly pathognomonic for MPNs in young patients)</li>
                        <li>• <strong>Microvascular</strong>: erythromelalgia, digital ischemia, ocular migraine</li>
                        <li>• JAK2 mutation activates platelets, increases neutrophil extracellular traps (NETs),
                            and promotes endothelial dysfunction</li>
                    </ul>
                </div>
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <h4 className="font-bold text-orange-800 mb-2">🔄 Disease Evolution Pathways</h4>
                    <div className="bg-white rounded-lg border border-orange-200 overflow-hidden mt-2">
                        <table className="w-full text-xs">
                            <thead className="bg-orange-100">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-orange-900">From</th>
                                    <th className="px-3 py-2 text-left font-semibold text-orange-900">To</th>
                                    <th className="px-3 py-2 text-left font-semibold text-orange-900">Risk (15yr)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100">
                                <tr><td className="px-3 py-2 text-orange-800">PV</td><td className="px-3 py-2 text-orange-700">Post-PV MF</td><td className="px-3 py-2 text-orange-600">~10-15%</td></tr>
                                <tr><td className="px-3 py-2 text-orange-800">PV</td><td className="px-3 py-2 text-orange-700">AML</td><td className="px-3 py-2 text-orange-600">~3-5%</td></tr>
                                <tr><td className="px-3 py-2 text-orange-800">ET</td><td className="px-3 py-2 text-orange-700">Post-ET MF</td><td className="px-3 py-2 text-orange-600">~5-10%</td></tr>
                                <tr><td className="px-3 py-2 text-orange-800">ET</td><td className="px-3 py-2 text-orange-700">AML</td><td className="px-3 py-2 text-orange-600">~1-3%</td></tr>
                                <tr><td className="px-3 py-2 text-orange-800">MF</td><td className="px-3 py-2 text-orange-700">AML (blast phase)</td><td className="px-3 py-2 text-orange-600">~10-20%</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-orange-600 mt-2 italic">
                        Blast-phase MPN (AML from prior MPN) has very poor outcomes with standard chemotherapy.
                    </p>
                </div>
            </div>

            <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
                <h4 className="font-bold text-sky-900 mb-2">🔮 Emerging MPN Therapies</h4>
                <p className="text-sm text-sky-800">
                    Active areas of MPN drug development include: <strong>pelabresib</strong> (BET inhibitor —
                    reduces bone marrow fibrosis when combined with ruxolitinib), <strong>imetelstat</strong>
                    (telomerase inhibitor showing disease-modifying potential in MF), <strong>navtemadlin</strong>
                    (MDM2 inhibitor targeting TP53 pathway), and combinations of JAK inhibitors with
                    <strong> BCL-2/BCL-xL inhibitors</strong> to target the MPN stem cell. The goal is moving beyond
                    symptom control toward <strong>true disease modification</strong> and clone elimination.
                </p>
            </div>
        </section>

        {/* Section 7: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Authoritative MPN Resources
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                These trusted organizations provide comprehensive, up-to-date information about MPNs:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://bloodcancerunited.org/blood-cancer/mpn"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">Blood Cancer United — MPN</h4>
                    <p className="text-sm text-blue-600">Comprehensive MPN overview including PV, ET, and MF.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.mpnresearchfoundation.org"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-rose-50 rounded-xl border border-rose-100 hover:border-rose-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-rose-800 group-hover:text-rose-900 mb-1">MPN Research Foundation</h4>
                    <p className="text-sm text-rose-600">Funding MPN research and providing patient education resources.</p>
                    <span className="text-xs text-rose-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cancer.gov/types/myeloproliferative/patient/chronic-treatment-pdq"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-green-800 group-hover:text-green-900 mb-1">NCI — MPN Treatment (PDQ®)</h4>
                    <p className="text-sm text-green-600">Detailed treatment information reviewed by oncology experts.</p>
                    <span className="text-xs text-green-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.lls.org/myeloproliferative-neoplasms"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-orange-800 group-hover:text-orange-900 mb-1">LLS — Myeloproliferative Neoplasms</h4>
                    <p className="text-sm text-orange-600">Patient guides, community forums, and financial assistance programs.</p>
                    <span className="text-xs text-orange-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default MPNDeepDive;
