import React from 'react';

interface EducationPageProps {
    onNavigateToLearn: (topic: string) => void;
}

const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium underline"
    >
        {children}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
    </a>
);

const RelatedTopics: React.FC<{ currentTopic: string; onNavigate: (topic: string) => void }> = ({ currentTopic, onNavigate }) => {
    const topics = [
        { id: 'blood-cells', label: 'Blood Production', icon: '🩸' },
        { id: 'mutations', label: 'Mutations', icon: '🧬' },
        { id: 'risk', label: 'Risk Assessment', icon: '📊' },
        { id: 'transplant', label: 'Transplants', icon: '🏥' },
        { id: 'treatments', label: 'Treatments', icon: '💊' },
        { id: 'medications', label: 'Medications', icon: '🧪' },
        { id: 'palliative', label: 'Supportive Care', icon: '🤝' },
        { id: 'history', label: 'History', icon: '📜' },
    ];

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Continue Learning</h3>
            <div className="flex flex-wrap gap-3">
                {topics.filter(t => t.id !== currentTopic).map(topic => (
                    <button
                        key={topic.id}
                        onClick={() => onNavigate(topic.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl font-medium transition-colors"
                    >
                        <span>{topic.icon}</span>
                        {topic.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const CommonTreatmentsPage: React.FC<EducationPageProps> = ({ onNavigateToLearn }) => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">💊</span>
                    <h1 className="text-3xl font-bold text-gray-900">Understanding Leukemia Treatment</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        Leukemia treatment is a journey that typically unfolds in phases. Understanding these phases—and the various
                        treatment options within them—helps you know what to expect and empowers you to participate in decisions
                        about your care.
                    </p>

                    {/* ===== TREATMENT PHASES SECTION ===== */}
                    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4 flex items-center gap-2">
                        <span className="text-purple-500">📋</span> Treatment Phases
                    </h2>
                    <p>
                        Most leukemia treatment follows a structured approach with distinct phases. Each phase has specific goals
                        and different intensity levels.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100">
                            <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                Induction
                            </h3>
                            <p className="text-sm text-red-800">
                                The first and most intensive phase. The goal is to achieve <strong>remission</strong>—clearing
                                the blood and bone marrow of visible leukemia cells (blasts) so normal blood production can resume.
                                This typically requires a hospital stay of 4-6 weeks.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                Consolidation
                            </h3>
                            <p className="text-sm text-blue-800">
                                After achieving remission, consolidation therapy aims to eliminate any remaining hidden leukemia cells.
                                This may involve additional chemotherapy cycles or a <button onClick={() => onNavigateToLearn('transplant')} className="font-bold underline">stem cell transplant</button>.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl border border-green-100">
                            <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                                Maintenance (Some Leukemias)
                            </h3>
                            <p className="text-sm text-green-800">
                                For certain leukemias (especially ALL and APL), a lower-intensity maintenance phase follows,
                                lasting months to years. The goal is to prevent relapse with oral medications taken at home.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-100">
                            <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                                Salvage / Relapse Therapy
                            </h3>
                            <p className="text-sm text-amber-800">
                                If leukemia returns (relapses) or doesn't respond to initial treatment (refractory), salvage
                                regimens use different drug combinations. This may include clinical trials or advanced therapies like CAR-T.
                            </p>
                        </div>
                    </div>

                    {/* ===== INDUCTION REGIMENS ===== */}
                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-2">
                        <span className="text-blue-500">💉</span> Induction Regimens
                    </h2>

                    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">The "7+3" Standard</h3>
                    <p>
                        For many years, the standard treatment for Acute Myeloid Leukemia (AML) has been the <strong>"7+3" regimen</strong>.
                        It is called 7+3 because it involves two types of chemotherapy:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li><strong>Cytarabine (Ara-C)</strong>: Given continuously for 7 days via IV infusion.</li>
                        <li><strong>Daunorubicin or Idarubicin</strong>: Given as a quick infusion on days 1, 2, and 3.</li>
                    </ul>
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 my-4">
                        <p className="text-blue-800 text-sm">
                            <strong>What to Expect:</strong> You'll be hospitalized for about 4-6 weeks. The first week involves
                            receiving the chemotherapy, followed by several weeks of recovery as your bone marrow regenerates healthy cells.
                        </p>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">HMA + Venetoclax</h3>
                    <p>
                        For patients who may not tolerate intensive chemotherapy (often older adults or those with other health conditions),
                        the combination of a <strong>Hypomethylating Agent (HMA)</strong> and <strong>Venetoclax</strong> has become a standard of care.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2">HMA (Azacitidine/Decitabine)</h4>
                            <p className="text-sm">Works by "turning back on" genes that help blood cells mature normally. Given by injection.</p>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2">Venetoclax (Venclexta)</h4>
                            <p className="text-sm">A "BCL-2 inhibitor" oral pill that helps trigger natural cell death in leukemia cells.</p>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3">Vyxeos (CPX-351)</h3>
                    <p>
                        <strong>CPX-351 (Vyxeos)</strong> is a specialized liposomal formulation combining Cytarabine and Daunorubicin in a fixed ratio.
                        It's specifically approved for patients with newly diagnosed therapy-related AML (t-AML) or AML with myelodysplasia-related changes.
                    </p>

                    {/* ===== FLAG-IDA SECTION ===== */}
                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-2">
                        <span className="text-orange-500">🔥</span> FLAG-IDA Regimen
                    </h2>
                    <p>
                        <strong>FLAG-IDA</strong> is an intensive chemotherapy regimen often used for relapsed or refractory AML,
                        though sometimes it's used as a frontline option for high-risk patients.
                    </p>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100 my-6">
                        <h4 className="font-bold text-orange-900 mb-3">What FLAG-IDA Stands For:</h4>
                        <ul className="space-y-2 text-sm text-orange-800">
                            <li><strong>F</strong> = <strong>Fludarabine</strong> – A chemotherapy drug that makes leukemia cells more sensitive to other drugs</li>
                            <li><strong>L</strong> = Part of the regimen name (used with Ara-C)</li>
                            <li><strong>A</strong> = <strong>High-dose Cytarabine (Ara-C)</strong> – Attacks rapidly dividing cells</li>
                            <li><strong>G</strong> = <strong>G-CSF (Filgrastim)</strong> – Helps white blood cells recover faster</li>
                            <li><strong>IDA</strong> = <strong>Idarubicin</strong> – An anthracycline chemotherapy drug</li>
                        </ul>
                    </div>
                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 my-4">
                        <p className="text-amber-800 text-sm">
                            <strong>What to Expect:</strong> FLAG-IDA is an intensive inpatient regimen requiring a hospital stay of
                            4-6 weeks. Blood counts will drop significantly before recovering. Your team will monitor you closely for
                            infections and provide supportive care.
                        </p>
                    </div>

                    {/* ===== TARGETED THERAPIES ===== */}
                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-2">
                        <span className="text-purple-500">🎯</span> Targeted Therapy Regimens
                    </h2>
                    <p>
                        If your leukemia has specific genetic mutations, your doctor may add a targeted drug to your regimen.
                        These drugs are designed to attack the unique vulnerabilities in your cancer cells.
                    </p>
                    <div className="space-y-6 my-6">
                        <div className="border-l-4 border-amber-400 pl-4">
                            <h4 className="font-bold text-gray-900">FLT3-Mutated AML</h4>
                            <p className="text-sm text-gray-600">
                                <strong>Regimen:</strong> 7+3 plus <strong>Midostaurin</strong> (Rydapt) during induction and consolidation.
                                For relapsed cases, <strong>Gilteritinib</strong> (Xospata) may be used alone.
                            </p>
                        </div>
                        <div className="border-l-4 border-purple-400 pl-4">
                            <h4 className="font-bold text-gray-900">IDH1 or IDH2-Mutated AML</h4>
                            <p className="text-sm text-gray-600">
                                <strong>Regimen:</strong> Targeted inhibitors like <strong>Ivosidenib</strong> (IDH1) or <strong>Enasidenib</strong> (IDH2)
                                can be given with HMA or as single agents.
                            </p>
                        </div>
                        <div className="border-l-4 border-green-400 pl-4">
                            <h4 className="font-bold text-gray-900">Menin Inhibitors (Emerging)</h4>
                            <p className="text-sm text-gray-600">
                                <strong>NPM1-mutated</strong> or <strong>KMT2A-rearranged</strong> leukemias may benefit from newer menin inhibitor drugs
                                like <strong>Revumenib</strong>, often available through clinical trials.
                            </p>
                        </div>
                    </div>

                    {/* ===== CAR-T SECTION ===== */}
                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-2">
                        <span className="text-indigo-500">🧬</span> CAR-T Cell Therapy
                    </h2>
                    <p>
                        <strong>CAR-T (Chimeric Antigen Receptor T-cell) therapy</strong> is a groundbreaking form of immunotherapy
                        that reprograms your own immune cells to fight cancer.
                    </p>

                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                            <div className="text-2xl mb-2">1️⃣</div>
                            <h4 className="font-bold text-indigo-900 text-sm mb-1">Collection</h4>
                            <p className="text-xs text-indigo-700">Your T-cells are collected through apheresis (similar to a blood donation)</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                            <div className="text-2xl mb-2">2️⃣</div>
                            <h4 className="font-bold text-indigo-900 text-sm mb-1">Engineering</h4>
                            <p className="text-xs text-indigo-700">T-cells are genetically modified in a lab to target leukemia cells</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                            <div className="text-2xl mb-2">3️⃣</div>
                            <h4 className="font-bold text-indigo-900 text-sm mb-1">Expansion</h4>
                            <p className="text-xs text-indigo-700">Modified cells multiply to create millions of cancer-fighting cells</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
                            <div className="text-2xl mb-2">4️⃣</div>
                            <h4 className="font-bold text-indigo-900 text-sm mb-1">Infusion</h4>
                            <p className="text-xs text-indigo-700">CAR-T cells are infused back into your body to attack the cancer</p>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3">Current Approvals & Research</h3>
                    <p>
                        CAR-T therapy is currently FDA-approved for certain types of <strong>B-cell Acute Lymphoblastic Leukemia (ALL)</strong>
                        that has relapsed or not responded to other treatments. Products include <strong>Kymriah</strong> and <strong>Tecartus</strong>.
                    </p>
                    <p className="mt-3">
                        For AML, CAR-T research is active but still primarily in clinical trials. If your doctor recommends exploring CAR-T,
                        check our <button onClick={() => onNavigateToLearn('clinical-trials')} className="text-blue-600 font-bold underline">Clinical Trials page</button> for guidance.
                    </p>

                    <div className="bg-red-50 p-5 rounded-xl border border-red-100 my-6">
                        <h4 className="font-bold text-red-900 mb-2">⚠️ Possible Side Effects</h4>
                        <p className="text-red-800 text-sm mb-3">
                            CAR-T therapy can cause significant side effects that require specialized monitoring:
                        </p>
                        <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                            <li><strong>Cytokine Release Syndrome (CRS)</strong> – Flu-like symptoms, fever, low blood pressure. Usually manageable with medications.</li>
                            <li><strong>Neurological Effects (ICANS)</strong> – Confusion, difficulty speaking, or headaches. Usually temporary.</li>
                        </ul>
                        <p className="text-red-800 text-sm mt-3">
                            CAR-T is administered at specialized centers with teams trained to manage these effects.
                        </p>
                    </div>

                    {/* ===== ANCILLARY/SUPPORTIVE TREATMENTS ===== */}
                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 flex items-center gap-2">
                        <span className="text-teal-500">🏥</span> Supportive Care & Ancillary Treatments
                    </h2>
                    <p>
                        Beyond the direct anti-leukemia drugs, you'll receive many supportive treatments to help your body
                        through therapy and prevent complications. These are just as important as the chemotherapy itself.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                            <h4 className="font-bold text-red-900 mb-2">🩸 Blood Transfusions</h4>
                            <p className="text-sm text-red-800">
                                <strong>Red blood cells</strong> to treat anemia and <strong>platelets</strong> to prevent bleeding.
                                You may need transfusions weekly or more often during treatment.
                            </p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                            <h4 className="font-bold text-green-900 mb-2">💊 Antibiotics & Antifungals</h4>
                            <p className="text-sm text-green-800">
                                Given preventively (prophylaxis) or to treat infections when your white blood cell count is low.
                                Examples: Levofloxacin, Fluconazole, Posaconazole.
                            </p>
                        </div>
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2">📈 Growth Factors</h4>
                            <p className="text-sm text-blue-800">
                                <strong>G-CSF (Neupogen/Neulasta)</strong> helps your bone marrow produce white blood cells faster.
                                Some patients also receive <strong>EPO</strong> for red blood cell production.
                            </p>
                        </div>
                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                            <h4 className="font-bold text-purple-900 mb-2">🤢 Anti-Nausea Medications</h4>
                            <p className="text-sm text-purple-800">
                                Modern anti-emetics like <strong>Ondansetron (Zofran)</strong> and <strong>Prochlorperazine</strong>
                                are very effective. You'll typically receive them before and after chemotherapy.
                            </p>
                        </div>
                        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                            <h4 className="font-bold text-amber-900 mb-2">😌 Pain Management</h4>
                            <p className="text-sm text-amber-800">
                                If you experience pain (mouth sores, bone pain, headaches), your team has many options from
                                acetaminophen to stronger medications. Always communicate your pain levels.
                            </p>
                        </div>
                        <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                            <h4 className="font-bold text-teal-900 mb-2">🍎 Nutrition Support</h4>
                            <p className="text-sm text-teal-800">
                                A dietitian may work with you. If eating becomes difficult, <strong>TPN (Total Parenteral Nutrition)</strong>
                                delivers nutrition directly through your IV.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-5 rounded-xl border border-gray-200 my-6">
                        <h4 className="font-bold text-gray-900 mb-2">⚗️ Tumor Lysis Syndrome (TLS) Prevention</h4>
                        <p className="text-sm text-gray-700">
                            When leukemia cells die quickly, they release substances that can harm kidneys. You'll receive
                            <strong> Allopurinol</strong> or <strong>Rasburicase</strong> along with IV fluids to prevent this complication.
                            Blood tests will monitor your kidney function closely.
                        </p>
                    </div>

                    {/* ===== EXTERNAL RESOURCES ===== */}
                    <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Learn More</h3>
                        <div className="space-y-3">
                            <div>
                                <ExternalLink href="https://www.cancer.org/cancer/acute-myeloid-leukemia/treating/typical-treatment-of-aml.html">
                                    Typical Treatment of AML (American Cancer Society)
                                </ExternalLink>
                            </div>
                            <div>
                                <ExternalLink href="https://www.cancer.org/cancer/acute-myeloid-leukemia/treating/typical-treatment-of-aml.html">
                                    Typical Treatment of AML (American Cancer Society)
                                </ExternalLink>
                            </div>
                            <div>
                                <ExternalLink href="https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment">
                                    Types of Treatment (Blood Cancer United)
                                </ExternalLink>
                            </div>
                            <div>
                                <ExternalLink href="https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/immunotherapy/chimeric-antigen-receptor-car-t-cell-therapy">
                                    CAR-T Cell Therapy (BCU)
                                </ExternalLink>
                            </div>
                            <div>
                                <ExternalLink href="https://bloodcancerunited.org/">
                                    Blood Cancer United - Patient Community
                                </ExternalLink>
                            </div>
                        </div>
                    </div>
                </div>

                <RelatedTopics currentTopic="treatments" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};


export const MedicationsPage: React.FC<EducationPageProps> = ({ onNavigateToLearn }) => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🧪</span>
                    <h1 className="text-3xl font-bold text-gray-900">Leukemia Medications</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        Leukemia therapy has evolved from general chemotherapy to highly specific "targeted" medications
                        that attack the unique biology of cancer cells.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Classifying Medications</h2>
                    <p>
                        Leukemia drugs generally fall into four main categories:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                            <h3 className="font-bold text-red-900 mb-2">Cytotoxic Chemotherapy</h3>
                            <p className="text-sm text-red-800">Traditional drugs that kill rapidly dividing cells.</p>
                            <ul className="mt-2 text-xs text-red-700 list-disc pl-4">
                                <li>Cytarabine (Ara-C)</li>
                                <li>Daunorubicin / Idarubicin</li>
                            </ul>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2">Targeted Therapy</h3>
                            <p className="text-sm text-blue-800">Drugs designed to interfere with specific molecules (like FLT3 or IDH).</p>
                            <ul className="mt-2 text-xs text-blue-700 list-disc pl-4">
                                <li>Venetoclax (BCL-2)</li>
                                <li>Midostaurin / Gilteritinib (FLT3)</li>
                                <li>Ivosidenib / Enasidenib (IDH)</li>
                            </ul>
                        </div>
                        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                            <h3 className="font-bold text-green-900 mb-2">Hypomethylating Agents</h3>
                            <p className="text-sm text-green-800">Epigenetic therapies that help cells behave normally.</p>
                            <ul className="mt-2 text-xs text-green-700 list-disc pl-4">
                                <li>Azacitidine (Vidaza)</li>
                                <li>Decitabine (Dacogen)</li>
                            </ul>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                            <h3 className="font-bold text-purple-900 mb-2">Immunotherapy</h3>
                            <p className="text-sm text-purple-800">Treatments that help the immune system find and kill cancer cells.</p>
                            <ul className="mt-2 text-xs text-purple-700 list-disc pl-4">
                                <li>Gemtuzumab Ozogamicin (Mylotarg)</li>
                                <li>BiTE therapies (Blinatumomab for ALL)</li>
                            </ul>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Common Drugs & Their Roles</h2>

                    <div className="overflow-x-auto my-6">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-bold">
                                <tr>
                                    <th className="px-4 py-3 border-b">Drug Name</th>
                                    <th className="px-4 py-3 border-b">Class</th>
                                    <th className="px-4 py-3 border-b">Primary Use</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Cytarabine (Ara-C)</td>
                                    <td className="px-4 py-3 text-gray-600">Chemotherapy</td>
                                    <td className="px-4 py-3 text-gray-600">Standard for AML (7+3), ALL, and Lymphoma</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Daunorubicin / Idarubicin</td>
                                    <td className="px-4 py-3 text-gray-600">Anthracycline</td>
                                    <td className="px-4 py-3 text-gray-600">Induction for AML and ALL</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Venetoclax</td>
                                    <td className="px-4 py-3 text-gray-600">BCL-2 Inhibitor</td>
                                    <td className="px-4 py-3 text-gray-600">AML, CLL (Often with HMA)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Azacitidine / Decitabine</td>
                                    <td className="px-4 py-3 text-gray-600">HMA</td>
                                    <td className="px-4 py-3 text-gray-600">MDS, AML</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Imatinib (Gleevec)</td>
                                    <td className="px-4 py-3 text-gray-600">TKI</td>
                                    <td className="px-4 py-3 text-gray-600">CML (1st Gen), Ph+ ALL</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Dasatinib (Sprycel)</td>
                                    <td className="px-4 py-3 text-gray-600">TKI</td>
                                    <td className="px-4 py-3 text-gray-600">CML, ALL (2nd Gen)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Nilotinib (Tasigna)</td>
                                    <td className="px-4 py-3 text-gray-600">TKI</td>
                                    <td className="px-4 py-3 text-gray-600">CML (2nd Gen)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Ponatinib (Iclusig)</td>
                                    <td className="px-4 py-3 text-gray-600">TKI</td>
                                    <td className="px-4 py-3 text-gray-600">Refractory CML/ALL (3rd Gen)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Midostaurin (Rydapt)</td>
                                    <td className="px-4 py-3 text-gray-600">FLT3 Inhibitor</td>
                                    <td className="px-4 py-3 text-gray-600">Newly diagnosed FLT3+ AML</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Gilteritinib (Xospata)</td>
                                    <td className="px-4 py-3 text-gray-600">FLT3 Inhibitor</td>
                                    <td className="px-4 py-3 text-gray-600">Relapsed/Refractory FLT3+ AML</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Ruxolitinib (Jakafi)</td>
                                    <td className="px-4 py-3 text-gray-600">JAK Inhibitor</td>
                                    <td className="px-4 py-3 text-gray-600">MPNs (MF, PV), Graft-vs-Host Disease</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Blinatumomab (Blincyto)</td>
                                    <td className="px-4 py-3 text-gray-600">BiTE (Immunotherapy)</td>
                                    <td className="px-4 py-3 text-gray-600">B-cell ALL</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Ibrutinib (Imbruvica)</td>
                                    <td className="px-4 py-3 text-gray-600">BTK Inhibitor</td>
                                    <td className="px-4 py-3 text-gray-600">CLL, MCL</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-10 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">🔬 Molecular Profiling is Key</h3>
                        <p className="text-gray-700 text-sm">
                            Many of these drugs only work if your leukemia cells have specific genetic markers.
                            This is why <button onClick={() => onNavigateToLearn('mutations')} className="text-blue-600 font-bold underline">molecular testing (mutations)</button>
                            is performed at the time of diagnosis.
                        </p>
                    </div>

                    <div className="mt-10">
                        <ExternalLink href="https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment">
                            BCU Drug Therapy Information
                        </ExternalLink>
                    </div>
                </div>

                <RelatedTopics currentTopic="medications" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};
