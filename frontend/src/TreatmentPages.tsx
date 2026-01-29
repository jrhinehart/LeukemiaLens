import React from 'react';

interface EducationPageProps {
    onNavigateHome: () => void;
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
                    <h1 className="text-3xl font-bold text-gray-900">Common Treatment Regimens</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        Leukemia treatment is often organized into "regimens"—specific combinations of drugs given on a set schedule.
                        Understanding these regimens helps you know what to expect during each phase of care.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Intensive Induction (The "7+3" Standard)</h2>
                    <p>
                        For many years, the standard treatment for Acute Myeloid Leukemia (AML) has been the <strong>"7+3" regimen</strong>.
                        It is called 7+3 because it involves two types of chemotherapy:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li><strong>Cytarabine</strong>: Given continuously for 7 days.</li>
                        <li><strong>Daunorubicin (or Idarubicin)</strong>: Given as a quick infusion on days 1, 2, and 3.</li>
                    </ul>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-6">
                        <h4 className="font-bold text-blue-900 mb-2">Goal of Induction</h4>
                        <p className="text-blue-800 text-sm">
                            The goal of induction is "remission"—to clear the blood and bone marrow of visible leukemia cells (blasts)
                            so that normal blood production can resume.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Modern Combinations (HMA + Venetoclax)</h2>
                    <p>
                        For patients who may not tolerate intensive chemotherapy, or for certain types of high-risk AML,
                        the combination of a <strong>Hypomethylating Agent (HMA)</strong> and <strong>Venetoclax</strong> has become a standard of care.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2">HMA (Azacitidine/Decitabine)</h4>
                            <p className="text-sm">Works by "turning back on" genes that help blood cells mature normally.</p>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2">Venetoclax (Venclexta)</h4>
                            <p className="text-sm">A "BCL-2 inhibitor" that helps trigger natural cell death in leukemia cells.</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Targeted Therapy Regimens</h2>
                    <p>
                        If your leukemia has specific mutations, your doctor may add a targeted drug to your regimen:
                    </p>
                    <div className="space-y-6 my-6">
                        <div className="border-l-4 border-amber-400 pl-4">
                            <h4 className="font-bold text-gray-900">FLT3-Mutated AML</h4>
                            <p className="text-sm text-gray-600"><strong>Regimen:</strong> 7+3 plus <strong>Midostaurin</strong> (Rydapt) during induction and consolidation. For relapsed cases, <strong>Gilteritinib</strong> (Xospata) may be used alone.</p>
                        </div>
                        <div className="border-l-4 border-purple-400 pl-4">
                            <h4 className="font-bold text-gray-900">IDH1 or IDH2-Mutated AML</h4>
                            <p className="text-sm text-gray-600"><strong>Regimen:</strong> Targeted inhibitors like <strong>Ivosidenib</strong> (IDH1) or <strong>Enasidenib</strong> (IDH2) can be given with HMA or as single agents.</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Secondary/High-Risk AML (Vyxeos)</h2>
                    <p>
                        <strong>CPX-351 (Vyxeos)</strong> is a specialized liposomal formulation of the 7+3 drugs (Cytarabine and Daunorubicin).
                        It is specifically approved for patients with newly diagnosed therapy-related AML (t-AML) or AML with myelodysplasia-related changes (AML-MRC).
                    </p>

                    <div className="mt-10 p-6 bg-amber-50 rounded-xl border border-amber-100">
                        <h3 className="text-lg font-bold text-amber-900 mb-2">💡 Note on Phases</h3>
                        <p className="text-amber-800 text-sm">
                            Treatment is usually divided into <strong>Induction</strong> (getting to remission) and
                            <strong>Consolidation</strong> (keeping the remission after it is achieved). Consolidation may involve more chemo or a
                            <button onClick={() => onNavigateToLearn('transplant')} className="font-bold underline">stem cell transplant</button>.
                        </p>
                    </div>

                    <div className="mt-10">
                        <ExternalLink href="https://www.cancer.org/cancer/acute-myeloid-leukemia/treating/typical-treatment-of-aml.html">
                            Typical Treatment of AML (American Cancer Society)
                        </ExternalLink>
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
                                    <td className="px-4 py-3 font-bold text-gray-900">Venetoclax</td>
                                    <td className="px-4 py-3 text-gray-600">BCL-2 Inhibitor</td>
                                    <td className="px-4 py-3 text-gray-600">AML, CLL (Often with HMA)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Azacitidine</td>
                                    <td className="px-4 py-3 text-gray-600">HMA</td>
                                    <td className="px-4 py-3 text-gray-600">MDS, AML</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Imatinib</td>
                                    <td className="px-4 py-3 text-gray-600">TKI</td>
                                    <td className="px-4 py-3 text-gray-600">CML, Ph+ ALL</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-bold text-gray-900">Gilteritinib</td>
                                    <td className="px-4 py-3 text-gray-600">FLT3 Inhibitor</td>
                                    <td className="px-4 py-3 text-gray-600">Relapsed/Refractory FLT3+ AML</td>
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
                        <ExternalLink href="https://www.lls.org/treatment/types-treatment/drug-therapy">
                            LLS Drug Therapy Information
                        </ExternalLink>
                    </div>
                </div>

                <RelatedTopics currentTopic="medications" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};
