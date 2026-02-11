import React from 'react';

// ─── MM Deep Dive Educational Content ────────────────────────────
const MMDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: Plasma Cells & The Immune System */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-rose-600">🔶</span> Plasma Cells & The Immune System — In Depth
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                To understand Multiple Myeloma, it helps to know where plasma cells come from and what they do.
                Plasma cells are <strong>fully differentiated B-lymphocytes</strong> — the final stage of B-cell
                maturation. Their sole purpose is to produce <strong>antibodies</strong> (immunoglobulins) that
                protect us from infections.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">The Journey from B-Cell to Plasma Cell</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                When a B-cell encounters its target antigen, it undergoes activation and a remarkable transformation
                in the <strong>germinal center</strong> of lymph nodes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">Germinal Center Reactions</h4>
                    <p className="text-sm text-rose-700 mb-2">
                        Critical processes that shape the antibody response:
                    </p>
                    <ul className="text-sm text-rose-700 space-y-1 pl-4">
                        <li>• <strong>Somatic Hypermutation (SHM)</strong> — random mutations in antibody genes to improve binding affinity</li>
                        <li>• <strong>Class Switch Recombination (CSR)</strong> — switching from IgM to IgG, IgA, or IgE for specialized functions</li>
                        <li>• <strong>Affinity Selection</strong> — only B-cells with the best-fitting antibodies survive</li>
                        <li>• <strong>Clonal Expansion</strong> — selected B-cells multiply extensively</li>
                    </ul>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">Terminal Differentiation</h4>
                    <p className="text-sm text-amber-700 mb-2">
                        B-cells that exit the germinal center can become:
                    </p>
                    <ul className="text-sm text-amber-700 space-y-1 pl-4">
                        <li>• <strong>Short-lived Plasma Cells</strong> — produce antibodies for days to weeks in lymph nodes and spleen</li>
                        <li>• <strong>Long-lived Plasma Cells</strong> — migrate to bone marrow; produce antibodies for years (even lifelong)</li>
                        <li>• <strong>Memory B-cells</strong> — persist in lymphoid tissue for rapid response upon re-exposure</li>
                    </ul>
                    <p className="text-xs text-amber-600 mt-2 italic">
                        Myeloma arises from long-lived plasma cells in the bone marrow — explaining its marrow-centric biology.
                    </p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Immunoglobulin Structure</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                Understanding antibody structure is essential because myeloma cells produce abnormal immunoglobulins —
                the <strong>monoclonal protein (M-protein)</strong> that is a hallmark of the disease:
            </p>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Ig Class</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Heavy Chain</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">% of Myeloma</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-900">Key Features</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">IgG</td>
                            <td className="px-4 py-3 text-gray-700">γ (gamma)</td>
                            <td className="px-4 py-3 text-gray-700">~50-55%</td>
                            <td className="px-4 py-3 text-gray-700">Most common myeloma subtype; most abundant Ig in blood</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">IgA</td>
                            <td className="px-4 py-3 text-gray-700">α (alpha)</td>
                            <td className="px-4 py-3 text-gray-700">~20-25%</td>
                            <td className="px-4 py-3 text-gray-700">Second most common; dominant in mucosal immunity</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">Light Chain Only</td>
                            <td className="px-4 py-3 text-gray-700">κ or λ</td>
                            <td className="px-4 py-3 text-gray-700">~15-20%</td>
                            <td className="px-4 py-3 text-gray-700">Only free light chains produced; higher risk of kidney damage</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-3 font-medium text-gray-900">IgD, IgE, IgM</td>
                            <td className="px-4 py-3 text-gray-700">δ, ε, μ</td>
                            <td className="px-4 py-3 text-gray-700">&lt;5%</td>
                            <td className="px-4 py-3 text-gray-700">Rare subtypes; IgM may overlap with Waldenström's macroglobulinemia</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="text-sm text-gray-500 mt-3 italic">
                💡 The M-protein (monoclonal protein or "M-spike" on electrophoresis) is produced by the myeloma clone.
                Tracking its level is a primary way to monitor disease burden and response to treatment.
            </p>
        </section>

        {/* Section 2: The MGUS → SMM → MM Spectrum */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📊</span> The Myeloma Spectrum: MGUS → SMM → Active Myeloma
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Multiple Myeloma almost always evolves through a <strong>well-defined precursor pathway</strong>.
                Understanding this spectrum is critical because it creates opportunities for early detection and
                potentially <strong>interceptive therapy</strong> before full myeloma develops.
            </p>

            <div className="space-y-4 my-6">
                <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-bold">Stage 1</span>
                        <h4 className="font-bold text-green-800">MGUS — Monoclonal Gammopathy of Undetermined Significance</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-green-700 mb-2">
                                A <strong>pre-malignant condition</strong> present in ~3-4% of adults over age 50. The clonal
                                plasma cells are present but not yet causing harm.
                            </p>
                            <ul className="text-sm text-green-700 space-y-1 pl-4">
                                <li>• M-protein <strong>&lt;3 g/dL</strong></li>
                                <li>• Bone marrow plasma cells <strong>&lt;10%</strong></li>
                                <li>• <strong>No</strong> CRAB criteria or myeloma-defining events</li>
                            </ul>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <p className="text-xs text-green-800 font-semibold mb-1">Progression Risk:</p>
                            <p className="text-sm text-green-700">
                                ~1% per year progress to myeloma or related malignancy. <strong>Lifelong monitoring</strong> is
                                recommended — typically annual labs (SPEP, CBC, creatinine, calcium).
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="text-2xl text-gray-400">↓</div>
                </div>

                <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-amber-600 text-white rounded-lg text-sm font-bold">Stage 2</span>
                        <h4 className="font-bold text-amber-800">SMM — Smoldering Multiple Myeloma</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-amber-700 mb-2">
                                An <strong>intermediate stage</strong> with higher tumor burden than MGUS but still no
                                organ damage. Growing evidence supports early intervention for high-risk SMM.
                            </p>
                            <ul className="text-sm text-amber-700 space-y-1 pl-4">
                                <li>• M-protein <strong>≥3 g/dL</strong> and/or</li>
                                <li>• Bone marrow plasma cells <strong>10-59%</strong></li>
                                <li>• <strong>No</strong> CRAB criteria or myeloma-defining events</li>
                            </ul>
                        </div>
                        <div className="bg-amber-100 p-3 rounded-lg">
                            <p className="text-xs text-amber-800 font-semibold mb-1">Progression Risk:</p>
                            <p className="text-sm text-amber-700">
                                ~10% per year for the first 5 years, then ~3% per year. <strong>High-risk SMM</strong> (≥20%
                                risk of progression within 2 years) may benefit from early treatment — active clinical trials
                                are ongoing.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="text-2xl text-gray-400">↓</div>
                </div>

                <div className="bg-red-50 p-5 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-bold">Stage 3</span>
                        <h4 className="font-bold text-red-800">Active Multiple Myeloma — Requires Treatment</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-red-700 mb-2">
                                Treatment is initiated when myeloma causes <strong>organ damage (CRAB)</strong> or meets
                                <strong> myeloma-defining events (MDEs)</strong>.
                            </p>
                            <h5 className="font-semibold text-red-800 text-xs mt-3 mb-1">CRAB Criteria:</h5>
                            <ul className="text-sm text-red-700 space-y-1 pl-4">
                                <li>• <strong>C</strong>alcium elevation (&gt;11 mg/dL)</li>
                                <li>• <strong>R</strong>enal insufficiency (creatinine &gt;2 mg/dL)</li>
                                <li>• <strong>A</strong>nemia (hemoglobin &lt;10 g/dL)</li>
                                <li>• <strong>B</strong>one disease (lytic lesions, osteoporosis, fractures)</li>
                            </ul>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <p className="text-xs text-red-800 font-semibold mb-1">Myeloma-Defining Events (since 2014):</p>
                            <ul className="text-sm text-red-700 space-y-1 pl-1">
                                <li>• Bone marrow plasma cells <strong>≥60%</strong></li>
                                <li>• Serum free light chain ratio <strong>≥100</strong></li>
                                <li>• <strong>&gt;1 focal lesion</strong> on MRI (≥5mm each)</li>
                            </ul>
                            <p className="text-xs text-red-600 mt-2 italic">
                                These MDEs indicate ultra-high-risk SMM that should be treated as active myeloma.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Section 3: How Myeloma Damages the Body */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-red-600">🦴</span> How Myeloma Damages the Body
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Unlike leukemia, which primarily disrupts blood cell production, myeloma causes damage through
                multiple distinct mechanisms. The abnormal plasma cells and their products (M-protein and free light
                chains) cause harm to bones, kidneys, and the immune system simultaneously.
            </p>

            <div className="space-y-4">
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">🦴 Bone Disease</h4>
                    <p className="text-sm text-rose-700">
                        The most characteristic feature of myeloma. Myeloma cells secrete factors (RANKL, DKK1, MIP-1α) that
                        <strong> activate osteoclasts</strong> (bone-resorbing cells) while <strong>suppressing osteoblasts</strong>
                        (bone-building cells). This creates <strong>lytic lesions</strong> — holes in the bone that cause pain,
                        fractures, and spinal cord compression. Unlike other cancers with bone metastases, myeloma bone lesions
                        <strong> do not heal</strong> even after successful treatment, because osteoblast suppression persists.
                    </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">🫘 Kidney Damage</h4>
                    <p className="text-sm text-rose-700">
                        Affects ~20-50% of myeloma patients at diagnosis. The primary mechanism is <strong>cast nephropathy</strong>
                        (\"myeloma kidney\"): excess free light chains form casts that obstruct kidney tubules. Other mechanisms
                        include light chain deposition disease, amyloidosis (AL type), and hypercalcemia-induced kidney injury.
                        <strong> Rapid reduction of light chains</strong> is critical to preserve kidney function.
                    </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">🛡️ Immune Suppression</h4>
                    <p className="text-sm text-rose-700">
                        Myeloma causes profound <strong>immunoparesis</strong> — suppression of normal (polyclonal)
                        immunoglobulin production. While the myeloma clone produces large amounts of a single,
                        non-functional antibody, the levels of normal IgG, IgA, and IgM all decrease. This leaves patients
                        highly susceptible to infections, particularly <strong>pneumonia</strong> (encapsulated bacteria
                        like Streptococcus pneumoniae). Infection is the leading cause of early death in myeloma.
                    </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">🩸 Hyperviscosity & Anemia</h4>
                    <p className="text-sm text-rose-700">
                        High M-protein levels can thicken the blood (<strong>hyperviscosity syndrome</strong>), causing
                        headaches, blurred vision, and bleeding — most common in IgA and IgM myeloma. Myeloma also causes
                        <strong> anemia</strong> through marrow infiltration, cytokine-mediated suppression of erythropoiesis,
                        and kidney-related EPO deficiency. Fatigue from anemia is often the most impactful symptom on daily life.
                    </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">⬆️ Hypercalcemia</h4>
                    <p className="text-sm text-rose-700">
                        As bones break down, large amounts of <strong>calcium</strong> are released into the bloodstream.
                        High calcium levels cause confusion, excessive thirst, nausea, constipation, and kidney damage.
                        Severe hypercalcemia is a medical emergency requiring immediate treatment with IV fluids,
                        bisphosphonates, and calcitonin.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 4: Myeloma Genetics & Risk Stratification */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">📋</span> Myeloma Genetics & Risk Stratification
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Myeloma genetics are uniquely complex. Nearly all myeloma has chromosomal abnormalities, falling
                into two broad categories: <strong>hyperdiploid</strong> (extra chromosomes, generally better prognosis)
                and <strong>non-hyperdiploid</strong> (chromosomal translocations involving the immunoglobulin heavy
                chain locus on chromosome 14). Risk is stratified using FISH cytogenetics.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Primary Cytogenetic Abnormalities</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                These are the <strong>initiating events</strong> that drive myeloma development — present from the
                MGUS/SMM stage and retained throughout the disease course:
            </p>
            <div className="space-y-3 my-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">STANDARD RISK</span>
                        <h4 className="font-bold text-green-800">Hyperdiploidy (Extra Chromosomes)</h4>
                    </div>
                    <p className="text-sm text-green-700">
                        Found in ~45-50% of myeloma. Cells have 48-75 chromosomes, typically with extra odd-numbered
                        chromosomes (3, 5, 7, 9, 11, 15, 19, 21). Generally associated with <strong>standard-risk
                            disease</strong> and better outcomes with modern therapies. However, some hyperdiploid subsets
                        with concurrent high-risk features behave more aggressively.
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-green-600 text-white rounded-md text-xs font-bold">STANDARD RISK</span>
                        <h4 className="font-bold text-green-800">t(11;14) — CCND1/IGH</h4>
                    </div>
                    <p className="text-sm text-green-700">
                        Found in ~15-20% of myeloma. Upregulates <strong>cyclin D1</strong>, driving cell cycle
                        progression. Generally standard risk. Notably, these myelomas are often <strong>BCL-2
                            dependent</strong>, making them uniquely sensitive to <strong>venetoclax</strong> — an oral
                        BCL-2 inhibitor originally developed for CLL.
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">HIGH RISK</span>
                        <h4 className="font-bold text-red-800">t(4;14) — MMSET/FGFR3/IGH</h4>
                    </div>
                    <p className="text-sm text-red-700">
                        Found in ~12-15% of myeloma. Activates <strong>MMSET</strong> (an epigenetic modifier) and
                        sometimes FGFR3. Historically associated with poor outcomes, but <strong>proteasome inhibitor-based
                            regimens</strong> (bortezomib) have significantly improved prognosis. Now considered
                        <strong> intermediate-to-high risk</strong> with modern treatment.
                    </p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">HIGH RISK</span>
                        <h4 className="font-bold text-red-800">t(14;16) and t(14;20) — MAF Translocations</h4>
                    </div>
                    <p className="text-sm text-red-700">
                        Each found in ~3-5% of myeloma. These translocations activate the <strong>MAF family</strong>
                        of transcription factors. Associated with <strong>adverse prognosis</strong> and aggressive
                        disease biology.
                    </p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Secondary/Progression Abnormalities</h3>
            <div className="space-y-3 my-4">
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white rounded-md text-xs font-bold">HIGH RISK</span>
                        <h4 className="font-bold text-red-800">del(17p) — TP53 Deletion</h4>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                        Deletion of the short arm of chromosome 17, which contains <strong>TP53</strong> — the
                        \"guardian of the genome.\" Found in ~8-10% at diagnosis but increases at relapse. The single
                        most adverse cytogenetic feature in myeloma, associated with <strong>chemoresistance, shorter
                            remissions, and reduced overall survival</strong>. These patients typically require the most
                        intensive approaches, often including transplant and novel combinations.
                    </p>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-xs font-bold">HIGH RISK</span>
                        <h4 className="font-bold text-amber-800">Gain(1q21) / del(1p)</h4>
                    </div>
                    <p className="text-sm text-amber-700 mb-2">
                        <strong>Gain of 1q21</strong> (amplification of chromosome 1q) is found in ~35-40% of myeloma and
                        is increasingly recognized as an adverse risk factor, especially when &gt;3 copies (amplification)
                        are present. <strong>del(1p)</strong> is less common but also adverse. These chromosome 1
                        abnormalities are among the most common secondary events in myeloma progression.
                    </p>
                </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 mt-6">
                <h4 className="font-bold text-indigo-900 mb-2">📊 R-ISS Staging System</h4>
                <p className="text-sm text-indigo-800">
                    The <strong>Revised International Staging System (R-ISS)</strong> combines three factors to
                    stratify myeloma prognosis: <strong>serum β2-microglobulin</strong> and <strong>albumin</strong>
                    (reflecting tumor burden and patient fitness), <strong>LDH</strong> (reflecting tumor aggressiveness),
                    and <strong>FISH cytogenetics</strong> (del(17p), t(4;14), t(14;16)). R-ISS Stage I has a 5-year
                    overall survival of ~82%, Stage II ~62%, and Stage III ~40%.
                </p>
            </div>
        </section>

        {/* Section 5: The Bone Marrow Microenvironment */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">🧬</span> The Bone Marrow Microenvironment
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Myeloma is uniquely dependent on its <strong>bone marrow microenvironment</strong>. Unlike many cancers,
                myeloma cells cannot easily survive outside the marrow niche. Understanding this dependency has led to
                some of the most successful therapeutic strategies.
            </p>

            <div className="space-y-4">
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 mb-2">🏗️ Stromal Cell Support</h4>
                    <p className="text-sm text-emerald-700">
                        Bone marrow <strong>stromal cells</strong> provide critical survival signals to myeloma cells through
                        direct contact (adhesion molecules like VLA-4/VCAM-1) and secreted factors. This interaction activates
                        <strong> NF-κB, JAK/STAT3, and PI3K/AKT</strong> pathways in myeloma cells, promoting survival and
                        drug resistance. The stromal microenvironment also protects myeloma cells from chemotherapy-induced
                        death — a phenomenon called <strong>cell adhesion-mediated drug resistance (CAM-DR)</strong>.
                    </p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 mb-2">🔄 The IL-6 Axis</h4>
                    <p className="text-sm text-emerald-700">
                        <strong>Interleukin-6 (IL-6)</strong> is the dominant growth and survival factor for myeloma cells.
                        Produced by stromal cells, osteoclasts, and myeloma cells themselves, IL-6 activates the
                        <strong> JAK/STAT3 signaling cascade</strong>, driving proliferation, survival, and drug resistance.
                        Early therapeutic attempts targeted IL-6 directly (siltuximab), but the most successful approach
                        has been targeting <strong>downstream pathways</strong> through immunomodulatory drugs (IMiDs).
                    </p>
                </div>
                <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 mb-2">💊 Therapeutic Targeting of the Microenvironment</h4>
                    <p className="text-sm text-emerald-700">
                        Many successful myeloma therapies work by disrupting the microenvironment interaction:
                    </p>
                    <ul className="text-sm text-emerald-700 space-y-1 pl-4 mt-2">
                        <li>• <strong>IMiDs (lenalidomide, pomalidomide)</strong> — degrade IKZF1/3 via cereblon, disrupting myeloma-stromal signaling</li>
                        <li>• <strong>Proteasome inhibitors (bortezomib)</strong> — block NF-κB activation, a key survival pathway</li>
                        <li>• <strong>Anti-CD38 (daratumumab)</strong> — directly targets myeloma cells via the ubiquitous CD38 surface marker</li>
                        <li>• <strong>Bisphosphonates (zoledronic acid)</strong> — inhibit osteoclast-mediated bone destruction and may have anti-myeloma effects</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Section 6: Treatment Landscape */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-teal-600">💉</span> The Modern Treatment Landscape
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Myeloma treatment has undergone a revolution over the past two decades. Median survival has improved
                from ~3 years in the 1990s to <strong>&gt;8-10 years</strong> with modern therapy. While not yet
                routinely curable, deep and durable remissions are now achievable for many patients with
                combination regimens and novel immunotherapies.
            </p>

            <div className="space-y-4">
                <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
                    <h4 className="font-bold text-sky-800 mb-2">📋 Treatment Phases</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">Induction</h5>
                            <p className="text-xs text-sky-700">
                                3-6 cycles of combination therapy to rapidly reduce disease burden. Standard regimens
                                include <strong>VRd</strong> (bortezomib, lenalidomide, dexamethasone) ±
                                <strong> daratumumab</strong> (Dara-VRd).
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">Consolidation</h5>
                            <p className="text-xs text-sky-700">
                                For eligible patients (typically age &lt;70, good fitness): <strong>autologous stem cell
                                    transplant (ASCT)</strong> using high-dose melphalan. Deepens response achieved during
                                induction.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">Maintenance</h5>
                            <p className="text-xs text-sky-700">
                                Long-term therapy to maintain response. <strong>Lenalidomide</strong> maintenance (until
                                progression) is standard of care, extending remission duration by years.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
                    <h4 className="font-bold text-sky-800 mb-2">🎯 Breakthrough Immunotherapies (Relapsed/Refractory)</h4>
                    <div className="space-y-3 mt-3">
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">🧬 BCMA-Targeted CAR T-Cells</h5>
                            <p className="text-xs text-sky-700">
                                <strong>Idecabtagene vicleucel (Abecma®)</strong> and <strong>ciltacabtagene autoleucel
                                    (Carvykti®)</strong> target BCMA (B-cell maturation antigen) on myeloma cells. These
                                have shown remarkable response rates (~70-98%) in heavily pre-treated patients.
                                Carvykti® has moved to earlier lines of therapy based on extraordinary trial results.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">💊 Bispecific Antibodies</h5>
                            <p className="text-xs text-sky-700">
                                <strong>Teclistamab (Tecvayli®)</strong> (BCMA×CD3), <strong>talquetamab
                                    (Talvey®)</strong> (GPRC5D×CD3), and <strong>elranatamab (Elrexfio®)</strong>
                                (BCMA×CD3) redirect T-cells to kill myeloma cells. Available \"off the shelf\" unlike
                                CAR T — no manufacturing wait time. Given as subcutaneous injections.
                            </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-sky-200">
                            <h5 className="font-semibold text-sky-900 text-sm mb-1">⚡ CELMoDs (Next-Gen IMiDs)</h5>
                            <p className="text-xs text-sky-700">
                                <strong>Mezigdomide</strong> and <strong>iberdomide</strong> are next-generation cereblon
                                modulators designed to overcome resistance to lenalidomide and pomalidomide. They achieve
                                deeper degradation of IKZF1/3, showing activity in IMiD-refractory patients.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mt-6">
                <h4 className="font-bold text-purple-900 mb-2">📊 MRD in Myeloma</h4>
                <p className="text-sm text-purple-800">
                    <strong>Minimal Residual Disease (MRD)</strong> negativity is emerging as the gold standard for
                    treatment response in myeloma. Achieved when fewer than 1 myeloma cell per million bone marrow cells
                    is detected (10⁻⁶ sensitivity via next-generation flow or sequencing). Patients who achieve
                    <strong> sustained MRD negativity</strong> have significantly longer progression-free and overall
                    survival, regardless of cytogenetic risk. MRD testing is increasingly used to guide treatment
                    duration decisions, potentially allowing MRD-negative patients to stop therapy.
                </p>
            </div>
        </section>

        {/* Section 7: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> Authoritative Myeloma Resources
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
                These trusted organizations provide comprehensive, up-to-date information about Multiple Myeloma:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://bloodcancerunited.org/blood-cancer/myeloma"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">Blood Cancer United — Myeloma</h4>
                    <p className="text-sm text-blue-600">Comprehensive myeloma overview, diagnosis, and treatment information.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.myeloma.org"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-rose-50 rounded-xl border border-rose-100 hover:border-rose-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-rose-800 group-hover:text-rose-900 mb-1">IMF — International Myeloma Foundation</h4>
                    <p className="text-sm text-rose-600">The leading myeloma-specific foundation: patient handbooks, InfoLine, and research updates.</p>
                    <span className="text-xs text-rose-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cancer.gov/types/myeloma/patient/myeloma-treatment-pdq"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-green-800 group-hover:text-green-900 mb-1">NCI — Myeloma Treatment (PDQ®)</h4>
                    <p className="text-sm text-green-600">Detailed treatment information reviewed by oncology experts.</p>
                    <span className="text-xs text-green-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.lls.org/myeloma"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-orange-800 group-hover:text-orange-900 mb-1">LLS — Multiple Myeloma</h4>
                    <p className="text-sm text-orange-600">Patient guides, caregiver support, and financial assistance programs.</p>
                    <span className="text-xs text-orange-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default MMDeepDive;
