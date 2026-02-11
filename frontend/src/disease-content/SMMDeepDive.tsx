import React from 'react';
import myelomaSpectrum from '../assets/myeloma-spectrum.png';

// ─── SMM Deep Dive Educational Content ────────────────────────────
const SMMDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: What is SMM? */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-amber-600">🔬</span> Understanding Smoldering Myeloma
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Smoldering Multiple Myeloma sits between MGUS and active myeloma on the plasma cell disorder
                spectrum. Like MGUS, SMM does <strong>not cause organ damage</strong> — but unlike MGUS, the
                abnormal plasma cell burden is significantly higher, and the <strong>risk of progression is
                    much greater</strong>, especially in the first 5 years.
            </p>

            <div className="my-8 bg-amber-50 rounded-xl border border-amber-100 p-6 flex flex-col items-center">
                <img
                    src={myelomaSpectrum}
                    alt="The Plasma Cell Disorder Spectrum"
                    className="max-w-2xl h-auto rounded-lg shadow-sm mb-4"
                />
                <p className="text-sm text-amber-700 text-center italic">
                    Figure 1: The spectrum of plasma cell disorders. SMM is a middle stage
                    between pre-malignant MGUS and active Multiple Myeloma.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">📊 Diagnostic Criteria</h4>
                    <p className="text-sm text-amber-700 mb-2">SMM requires <strong>either</strong> of:</p>
                    <ul className="text-sm text-amber-700 space-y-2">
                        <li>• Serum M-protein <strong>≥3 g/dL</strong></li>
                        <li>• Bone marrow plasma cells <strong>10-59%</strong></li>
                        <li>• Urine M-protein <strong>≥500 mg/24hr</strong></li>
                    </ul>
                    <p className="text-xs text-amber-600 mt-2 font-semibold">
                        AND: No myeloma-defining events (no CRAB, no biomarkers of malignancy)
                    </p>
                </div>
                <div className="bg-rose-50 p-5 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">📈 Progression Risk</h4>
                    <ul className="text-sm text-rose-700 space-y-2">
                        <li>• <strong>~10% per year</strong> for the first 5 years</li>
                        <li>• ~3% per year for years 5-10</li>
                        <li>• ~1% per year after 10 years</li>
                        <li>• <strong>~50% progress within 5 years</strong> — much higher than MGUS</li>
                        <li>• High-risk SMM: can progress in <strong>months</strong></li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Section 2: Risk Stratification */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📊</span> Risk Stratification — Who Will Progress?
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Not all SMM is equal. Identifying <strong>high-risk SMM</strong> — patients likely to progress
                within 2 years — is critical because <strong>early intervention may improve outcomes</strong>
                compared to waiting for organ damage.
            </p>

            <div className="space-y-4">
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-purple-800 mb-2">🔬 The Mayo 20/2/20 Model</h4>
                    <p className="text-sm text-purple-700 mb-2">
                        Three risk factors, each worth 1 point:
                    </p>
                    <ul className="text-sm text-purple-700 space-y-1 pl-4">
                        <li>• Bone marrow plasma cells <strong>≥20%</strong></li>
                        <li>• Serum M-protein <strong>≥2 g/dL</strong></li>
                        <li>• Free light chain ratio <strong>≥20</strong> (involved/uninvolved)</li>
                    </ul>
                    <div className="bg-white rounded-lg border border-purple-200 overflow-hidden mt-3">
                        <table className="w-full text-xs">
                            <thead className="bg-purple-100">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-purple-900">Risk</th>
                                    <th className="px-3 py-2 text-left font-semibold text-purple-900">Factors</th>
                                    <th className="px-3 py-2 text-left font-semibold text-purple-900">2yr Progression</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-100">
                                <tr><td className="px-3 py-2 text-green-600 font-semibold">Low</td><td className="px-3 py-2 text-purple-700">0 factors</td><td className="px-3 py-2 text-purple-600">~10%</td></tr>
                                <tr><td className="px-3 py-2 text-amber-600 font-semibold">Intermediate</td><td className="px-3 py-2 text-purple-700">1 factor</td><td className="px-3 py-2 text-purple-600">~26%</td></tr>
                                <tr><td className="px-3 py-2 text-red-600 font-semibold">High</td><td className="px-3 py-2 text-purple-700">2-3 factors</td><td className="px-3 py-2 text-purple-600">~47-81%</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-2">🧬 Genomic Risk Features</h4>
                    <ul className="text-sm text-indigo-700 space-y-2">
                        <li>• <strong>t(4;14), t(14;16), del(17p)</strong> — high-risk cytogenetics even in SMM</li>
                        <li>• <strong>Circulating tumor cells</strong> in blood — strong predictor of early progression</li>
                        <li>• <strong>Evolving M-protein</strong> — progressive increase over serial measurements</li>
                        <li>• <strong>MYC rearrangements</strong> — associated with rapid progression</li>
                        <li>• <strong>Whole-body MRI / PET-CT</strong> — focal lesions may reclassify as active myeloma</li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Section 3: The Treatment Debate */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-teal-600">💊</span> The Early Treatment Debate
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                One of the most active debates in myeloma: should high-risk SMM patients receive
                <strong> early treatment</strong> before organ damage occurs?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-800 mb-2">✅ Evidence FOR Early Treatment</h4>
                    <ul className="text-sm text-green-700 space-y-2">
                        <li>• <strong>QuiRedex trial</strong>: lenalidomide + dexamethasone in high-risk SMM delayed
                            progression (median not reached vs 23 months) and showed <strong>overall survival
                                benefit</strong></li>
                        <li>• <strong>ECOG E3A06</strong>: single-agent lenalidomide delayed progression in
                            intermediate/high-risk SMM</li>
                        <li>• Preventing irreversible organ damage (renal failure, bone fractures)</li>
                        <li>• Earlier intervention when tumor burden is low and clone is less complex</li>
                    </ul>
                </div>
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2">⚠️ Arguments for Observation</h4>
                    <ul className="text-sm text-red-700 space-y-2">
                        <li>• <strong>Not all SMM progresses</strong> — some patients remain stable for decades</li>
                        <li>• Treatment side effects in patients who may not need it</li>
                        <li>• Risk of developing <strong>drug-resistant clones</strong> before needed</li>
                        <li>• <strong>NCCN guidelines</strong> currently recommend observation with consideration of
                            clinical trial enrollment for high-risk SMM</li>
                    </ul>
                </div>
            </div>

            <div className="bg-sky-50 p-5 rounded-xl border border-sky-100">
                <h4 className="font-bold text-sky-900 mb-2">🔮 Current Practice & Emerging Data</h4>
                <p className="text-sm text-sky-800">
                    The field is actively evolving. The <strong>AQUILA trial</strong> (daratumumab in high-risk SMM)
                    and <strong>ITHACA trial</strong> (isatuximab-based) are testing whether modern immunotherapy
                    can safely intercept progression. Many expert centers now offer treatment on clinical trials
                    for high-risk SMM. Close monitoring every 3-4 months remains standard for all other SMM
                    patients, with treatment initiated at progression to active myeloma (CRAB or myeloma-defining
                    events).
                </p>
            </div>
        </section>

        {/* Section 4: The MGUS → SMM → MM Spectrum Visual */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-violet-600">🔄</span> The Precursor Spectrum
            </h2>
            <div className="bg-gradient-to-r from-green-50 via-amber-50 to-red-50 p-6 rounded-xl border border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center text-2xl mb-2">🟢</div>
                        <h4 className="font-bold text-green-800 text-sm">MGUS</h4>
                        <p className="text-xs text-green-700 mt-1">M-protein &lt;3 g/dL<br />Plasma cells &lt;10%<br />~1%/yr progression</p>
                    </div>
                    <div>
                        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-2xl mb-2">🟡</div>
                        <h4 className="font-bold text-amber-800 text-sm">SMM</h4>
                        <p className="text-xs text-amber-700 mt-1">M-protein ≥3 g/dL<br />Plasma cells 10-59%<br />~10%/yr (5yr)</p>
                    </div>
                    <div>
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center text-2xl mb-2">🔴</div>
                        <h4 className="font-bold text-red-800 text-sm">Active MM</h4>
                        <p className="text-xs text-red-700 mt-1">CRAB criteria or<br />Myeloma-defining events<br />Treatment required</p>
                    </div>
                </div>
                <div className="flex items-center justify-center mt-4 gap-2">
                    <div className="h-1 w-16 bg-green-300 rounded"></div>
                    <span className="text-gray-500 text-xs">→</span>
                    <div className="h-1 w-16 bg-amber-300 rounded"></div>
                    <span className="text-gray-500 text-xs">→</span>
                    <div className="h-1 w-16 bg-red-300 rounded"></div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-3">
                    Not all patients progress along this spectrum. Most MGUS patients never develop myeloma.
                </p>
            </div>
        </section>

        {/* Section 5: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> SMM Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://www.myeloma.org/understanding-smoldering-multiple-myeloma"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">IMF — Smoldering Myeloma</h4>
                    <p className="text-sm text-blue-600">International Myeloma Foundation patient guide on SMM.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.cancer.gov/types/myeloma/patient/myeloma-treatment-pdq"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-green-800 group-hover:text-green-900 mb-1">NCI — Myeloma Treatment (PDQ®)</h4>
                    <p className="text-sm text-green-600">Comprehensive treatment information including SMM management.</p>
                    <span className="text-xs text-green-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default SMMDeepDive;
