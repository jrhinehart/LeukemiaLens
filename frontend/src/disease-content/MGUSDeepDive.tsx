import React from 'react';

// ─── MGUS Deep Dive Educational Content ────────────────────────────
const MGUSDeepDive: React.FC = () => (
    <div className="space-y-8">
        {/* Section 1: What is MGUS? */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-teal-600">🔬</span> Understanding MGUS
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                MGUS is <strong>not cancer</strong>. It is a <strong>precursor condition</strong> in which a small
                clone of abnormal plasma cells produces a detectable monoclonal protein (M-protein) in the blood,
                but at levels too low to cause symptoms or organ damage. MGUS is remarkably common — present in
                ~3-4% of adults over 50 and ~5% over 70.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                    <h4 className="font-bold text-teal-800 mb-2">📊 Diagnostic Criteria</h4>
                    <ul className="text-sm text-teal-700 space-y-2">
                        <li>• M-protein <strong>&lt;3 g/dL</strong> in serum</li>
                        <li>• Bone marrow plasma cells <strong>&lt;10%</strong></li>
                        <li>• <strong>No</strong> CRAB criteria (no organ damage)</li>
                        <li>• <strong>No</strong> myeloma-defining events</li>
                    </ul>
                </div>
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-800 mb-2">📈 Progression Risk</h4>
                    <ul className="text-sm text-blue-700 space-y-2">
                        <li>• <strong>~1% per year</strong> risk of progressing to myeloma or related malignancy</li>
                        <li>• Risk persists indefinitely — never "safe" to stop monitoring</li>
                        <li>• After 25 years: ~25% cumulative progression</li>
                        <li>• Most MGUS patients <strong>never progress</strong></li>
                    </ul>
                </div>
                <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                    <h4 className="font-bold text-amber-800 mb-2">🔍 Risk Stratification</h4>
                    <p className="text-sm text-amber-700 mb-2">Three risk factors predict progression:</p>
                    <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Non-IgG isotype (IgA, IgM)</li>
                        <li>• M-protein ≥1.5 g/dL</li>
                        <li>• Abnormal free light chain ratio</li>
                    </ul>
                    <p className="text-xs text-amber-600 mt-2 italic">
                        0 risk factors: ~5% progression at 20yr<br />
                        3 risk factors: ~58% progression at 20yr
                    </p>
                </div>
            </div>
        </section>

        {/* Section 2: Types of MGUS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600">📋</span> Types of MGUS
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Not all MGUS is the same. The <strong>type of M-protein</strong> determines what the MGUS could
                potentially evolve into:
            </p>

            <div className="space-y-3">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-800 mb-1">Non-IgM MGUS (IgG, IgA, IgD)</h4>
                    <p className="text-sm text-indigo-700">
                        The most common type (~85%). Can progress to <strong>multiple myeloma</strong> or, rarely,
                        AL amyloidosis. IgG MGUS has the lowest risk of progression among all isotypes.
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <h4 className="font-bold text-purple-800 mb-1">IgM MGUS</h4>
                    <p className="text-sm text-purple-700">
                        ~15% of MGUS. Can progress to <strong>Waldenström's macroglobulinemia</strong> (lymphoplasmacytic
                        lymphoma) rather than myeloma. IgM MGUS has distinct biology — the clonal cells are
                        lymphoplasmacytic rather than classic plasma cells.
                    </p>
                </div>
                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                    <h4 className="font-bold text-sky-800 mb-1">Light Chain MGUS</h4>
                    <p className="text-sm text-sky-700">
                        A newer entity where only free light chains (kappa or lambda) are produced without an
                        intact immunoglobulin. Can progress to <strong>light chain myeloma</strong> or
                        <strong> AL amyloidosis</strong>. Detected by serum free light chain assay rather than
                        SPEP.
                    </p>
                </div>
            </div>
        </section>

        {/* Section 3: Monitoring & Living with MGUS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-green-600">🩺</span> Monitoring & Living with MGUS
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
                MGUS requires <strong>no treatment</strong> — only monitoring. The goal is to detect progression
                early, when intervention is most effective.
            </p>

            <div className="bg-green-50 p-5 rounded-xl border border-green-100 mb-4">
                <h4 className="font-bold text-green-800 mb-2">📅 Monitoring Schedule</h4>
                <ul className="text-sm text-green-700 space-y-2">
                    <li>• <strong>Low risk</strong>: repeat labs at 6 months, then every 2-3 years if stable</li>
                    <li>• <strong>Intermediate/High risk</strong>: labs every 6-12 months</li>
                    <li>• Key labs: <strong>SPEP, serum free light chains, CBC, creatinine, calcium</strong></li>
                    <li>• <strong>Report new symptoms immediately</strong>: bone pain, fatigue, recurrent infections,
                        unexplained weight loss, numbness/tingling</li>
                </ul>
            </div>

            <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-2">💡 Beyond Myeloma: Other MGUS-Related Conditions</h4>
                <p className="text-sm text-amber-800">
                    MGUS can cause problems even without progressing to myeloma: <strong>peripheral neuropathy</strong>
                    (~5% of MGUS patients), <strong>kidney disease</strong> (monoclonal gammopathy of renal
                    significance — MGRS), <strong>osteoporosis</strong>, and increased <strong>infection risk</strong>.
                    These "MGUS-associated" conditions may warrant treatment even without myeloma progression.
                </p>
            </div>
        </section>

        {/* Section 4: External Resources */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📚</span> MGUS Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://www.myeloma.org/understanding-mgus"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-blue-800 group-hover:text-blue-900 mb-1">IMF — Understanding MGUS</h4>
                    <p className="text-sm text-blue-600">International Myeloma Foundation patient guide on MGUS.</p>
                    <span className="text-xs text-blue-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
                <a href="https://www.lls.org/myeloma/myeloma-subtypes"
                    target="_blank" rel="noopener noreferrer"
                    className="p-4 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all group">
                    <h4 className="font-bold text-orange-800 group-hover:text-orange-900 mb-1">LLS — Myeloma Subtypes</h4>
                    <p className="text-sm text-orange-600">Overview of MGUS, SMM, and active myeloma.</p>
                    <span className="text-xs text-orange-500 font-semibold mt-2 inline-block">Visit →</span>
                </a>
            </div>
        </section>
    </div>
);

export default MGUSDeepDive;
