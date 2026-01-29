import React from 'react';
import hematopoiesisDiagram from './assets/hematopoiesis-diagram.png';
import dnaMutationDiagram from './assets/dna-mutation-diagram.png';

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
        { id: 'blood-cells', label: 'Blood Cell Production', icon: '🩸' },
        { id: 'mutations', label: 'Mutations', icon: '🧬' },
        { id: 'risk', label: 'Risk Stratification', icon: '📊' },
        { id: 'transplant', label: 'Stem Cell Transplants', icon: '🏥' },
        { id: 'lab-results', label: 'Lab Results', icon: '🔬' },
        { id: 'clinical-trials', label: 'Clinical Trials', icon: '🧪' },
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

export const BloodCellProductionPage: React.FC<EducationPageProps> = ({ onNavigateToLearn }) => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🩸</span>
                    <h1 className="text-3xl font-bold text-gray-900">How Blood is Made</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        Understanding how blood cells are produced helps you make sense of your diagnosis and treatment options.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What is Hematopoiesis?</h2>
                    <p>
                        <strong>Hematopoiesis</strong> (hee-mat-oh-poy-EE-sis) is the process by which your body makes new blood cells.
                        This happens primarily in your <strong>bone marrow</strong>—the soft, spongy tissue inside your bones.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Stem Cells: The Factory Workers</h2>
                    <p>
                        At the heart of blood production are <strong>hematopoietic stem cells</strong>. These remarkable cells can:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li><strong>Self-renew</strong>: Make copies of themselves to keep the factory running</li>
                        <li><strong>Differentiate</strong>: Transform into any type of blood cell your body needs</li>
                    </ul>

                    {/* Hematopoiesis Diagram */}
                    <div className="my-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Blood Cell Differentiation (Hematopoiesis)</h3>
                        <div className="flex justify-center">
                            <img
                                src={hematopoiesisDiagram}
                                alt="Hematopoiesis diagram showing how stem cells differentiate into myeloid and lymphoid lineages, producing red blood cells, platelets, neutrophils, monocytes, T cells, B cells, and NK cells"
                                className="max-w-full md:max-w-2xl rounded-lg shadow-md"
                            />
                        </div>
                        <p className="text-sm text-gray-600 text-center mt-4">
                            Starting from a single hematopoietic stem cell, blood cells differentiate into two main lineages:
                            <strong className="text-green-700"> myeloid</strong> (red cells, platelets, neutrophils, monocytes) and
                            <strong className="text-blue-700"> lymphoid</strong> (T cells, B cells, NK cells).
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">The Three Types of Blood Cells</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <h3 className="font-bold text-red-800 mb-2">🔴 Red Blood Cells</h3>
                            <p className="text-sm text-red-700">Carry oxygen from your lungs to all parts of your body. Low levels cause fatigue and shortness of breath.</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2">⚪ White Blood Cells</h3>
                            <p className="text-sm text-blue-700">Fight infections and disease. Low levels increase your risk of infections.</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <h3 className="font-bold text-purple-800 mb-2">🟣 Platelets</h3>
                            <p className="text-sm text-purple-700">Help your blood clot to stop bleeding. Low levels can cause easy bruising and bleeding.</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What Goes Wrong in Blood Cancer?</h2>
                    <p>
                        Normal stem cells form healthy blood cells such as red and white cells and platelets. AML starts with a mutation in the DNA of a single stem cell in the bone marrow. This changed cell becomes a leukemic cell and multiplies into billions of cells called <strong>leukemic blasts</strong>.
                    </p>
                    <p>Leukemic blasts:</p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li>Do not function normally</li>
                        <li>Block the production of normal cells</li>
                        <li>Grow and survive better than normal cells</li>
                    </ul>
                    <p>
                        As a result, the number of healthy blood cells is usually lower than normal, and can result in the following conditions:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li><strong>Anemia</strong>: a low number of red cells in the blood, causing fatigue and shortness of breath</li>
                        <li><strong>Neutropenia</strong>: a low number of neutrophils (a type of white blood cell), preventing the immune system from effectively guarding against infection</li>
                        <li><strong>Thrombocytopenia</strong>: a low number of platelets, causing bleeding and easy bruising</li>
                        <li><strong>Pancytopenia</strong>: low numbers of all three blood cell types</li>
                    </ul>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
                        <h3 className="font-bold text-blue-900 mb-2">📚 Learn More</h3>
                        <p className="text-blue-800 mb-4">
                            Blood Cancer United provides detailed resources about blood cell production and blood cancers.
                        </p>
                        <ExternalLink href="https://bloodcancerunited.org/blood-cancer-care">
                            Understanding Blood Cancer at Blood Cancer United
                        </ExternalLink>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">The Two Main Cell Lineages</h2>
                    <p>
                        Blood cells develop along two main pathways, called <strong>lineages</strong>. Understanding which lineage is affected helps doctors classify your leukemia:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                            <h3 className="font-bold text-orange-800 mb-2">🔶 Myeloid Lineage</h3>
                            <p className="text-sm text-orange-700 mb-2">
                                Produces red blood cells, platelets, and most white blood cells (neutrophils, monocytes, eosinophils, basophils).
                            </p>
                            <p className="text-xs text-orange-600">
                                Affected in AML (Acute Myeloid Leukemia) and CML (Chronic Myeloid Leukemia).
                            </p>
                        </div>
                        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                            <h3 className="font-bold text-indigo-800 mb-2">🔷 Lymphoid Lineage</h3>
                            <p className="text-sm text-indigo-700 mb-2">
                                Produces lymphocytes (B cells, T cells, and NK cells), which are key players in your immune system.
                            </p>
                            <p className="text-xs text-indigo-600">
                                Affected in ALL (Acute Lymphoblastic Leukemia) and CLL (Chronic Lymphocytic Leukemia).
                            </p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Bone Marrow Tests: What to Expect</h2>
                    <p>
                        To understand what's happening in your blood cell factory, doctors need to examine your bone marrow directly. These tests help diagnose leukemia and monitor treatment.
                    </p>
                    <div className="space-y-4 my-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-2">🩺 Bone Marrow Aspirate</h3>
                            <p className="text-sm text-gray-700">
                                A thin needle extracts liquid marrow containing cells. This sample is used for genetic testing, flow cytometry, and microscopic examination. The procedure takes about 15-20 minutes and is usually done from the back of your hip bone.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-2">🦴 Bone Marrow Biopsy</h3>
                            <p className="text-sm text-gray-700">
                                A slightly larger needle removes a small core of solid bone and marrow tissue. This allows doctors to see how cells are arranged and how full the marrow is with cells (cellularity). Often done together with the aspirate.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Common Blood Count Terms</h2>
                    <p>
                        When you receive lab results, you'll see terms like these. Here's what they mean:
                    </p>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden my-6">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Term</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900">What It Measures</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">CBC</td>
                                    <td className="px-4 py-3 text-gray-700">Complete Blood Count - the overall blood test panel</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">WBC</td>
                                    <td className="px-4 py-3 text-gray-700">White Blood Cell count - your infection fighters</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">ANC</td>
                                    <td className="px-4 py-3 text-gray-700">Absolute Neutrophil Count - a key indicator of infection risk</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">Hgb / Hb</td>
                                    <td className="px-4 py-3 text-gray-700">Hemoglobin - the oxygen-carrying protein in red blood cells</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">Hct</td>
                                    <td className="px-4 py-3 text-gray-700">Hematocrit - percentage of blood volume that is red blood cells</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">PLT</td>
                                    <td className="px-4 py-3 text-gray-700">Platelet count - cells that help your blood clot</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mt-8">
                        <h3 className="font-bold text-purple-900 mb-2">💡 Tip: Track Your Counts</h3>
                        <p className="text-purple-800">
                            Ask your care team for copies of your lab results. Keeping a simple log of your WBC, ANC, hemoglobin, and platelets can help you understand your treatment progress and know when to be extra careful about infections.
                        </p>
                    </div>
                </div>

                <RelatedTopics currentTopic="blood-cells" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};

export const MutationsPage: React.FC<EducationPageProps> = ({ onNavigateToLearn }) => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🧬</span>
                    <h1 className="text-3xl font-bold text-gray-900">What Are Mutations?</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        You may hear your medical team talk about "mutations" in your blood cells. Understanding what these are can help you participate in treatment decisions.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Mutations Explained Simply</h2>
                    <p>
                        A <strong>mutation</strong> is a change in the DNA instructions inside a cell. Think of DNA as a recipe book—mutations
                        are like typos or missing pages that can change how the recipe turns out.
                    </p>
                    <p>
                        In blood cancers, certain mutations cause cells to grow and divide when they shouldn't, or prevent them from dying
                        when they should.
                    </p>

                    {/* DNA Mutation Diagram */}
                    <div className="my-8 bg-gradient-to-r from-gray-50 to-green-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">How DNA Mutations Occur</h3>
                        <div className="flex justify-center">
                            <img
                                src={dnaMutationDiagram}
                                alt="DNA mutation diagram showing normal DNA sequence compared to a mutated base pair, illustrating how a single change in the genetic code can occur"
                                className="max-w-full md:max-w-lg rounded-lg shadow-md"
                            />
                        </div>
                        <p className="text-sm text-gray-600 text-center mt-4">
                            A mutation is a change in the DNA sequence. Even a single base pair change (like <span className="text-orange-600 font-semibold">G→T</span>)
                            can alter how a gene functions, potentially leading to abnormal cell behavior.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Why Testing for Mutations Matters</h2>
                    <p>
                        Your doctor will likely test your blood or bone marrow for specific mutations. This is important because:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li><strong>Targeted treatments</strong>: Some drugs work specifically against certain mutations (like FLT3 inhibitors for FLT3 mutations)</li>
                        <li><strong>Predict outcomes</strong>: Some mutations are associated with better or worse prognosis</li>
                        <li><strong>Guide therapy intensity</strong>: Mutation status may influence whether a stem cell transplant is recommended</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Common Mutations You May Hear About</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h3 className="font-bold text-green-800 mb-2">NPM1</h3>
                            <p className="text-sm text-green-700">Often associated with favorable outcomes in AML, especially without FLT3-ITD.</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <h3 className="font-bold text-amber-800 mb-2">FLT3</h3>
                            <p className="text-sm text-amber-700">Common in AML. Targeted therapies are available (midostaurin, gilteritinib).</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <h3 className="font-bold text-red-800 mb-2">TP53</h3>
                            <p className="text-sm text-red-700">Associated with more challenging disease. Research for new treatments is ongoing.</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2">IDH1/IDH2</h3>
                            <p className="text-sm text-blue-700">Targetable with specific inhibitors (ivosidenib, enasidenib).</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                            <h3 className="font-bold text-teal-800 mb-2">CEBPA</h3>
                            <p className="text-sm text-teal-700">Biallelic CEBPA mutations are typically associated with favorable outcomes.</p>
                        </div>
                        <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                            <h3 className="font-bold text-pink-800 mb-2">DNMT3A</h3>
                            <p className="text-sm text-pink-700">One of the most common AML mutations. Often found with NPM1 and FLT3.</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <h3 className="font-bold text-orange-800 mb-2">RUNX1</h3>
                            <p className="text-sm text-orange-700">May indicate intermediate or adverse risk depending on other findings.</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-2">ASXL1</h3>
                            <p className="text-sm text-slate-700">Often associated with adverse outcomes and resistance to some therapies.</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Driver vs. Passenger Mutations</h2>
                    <p>
                        Not all mutations are equally important. Your report may include many genetic changes, but they fall into two categories:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                            <h3 className="font-bold text-red-800 mb-2">🚗 Driver Mutations</h3>
                            <p className="text-sm text-red-700">
                                These mutations actively cause and maintain the cancer. They're the main targets for treatment decisions. Examples: FLT3, NPM1, IDH1/2.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-2">🧳 Passenger Mutations</h3>
                            <p className="text-sm text-gray-700">
                                These mutations happened along the way but don't drive the cancer. They're less important for treatment but may be monitored.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Reading Your Mutation Report</h2>
                    <p>
                        Genetic testing reports can be intimidating. Here's what to look for:
                    </p>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 my-6">
                        <ul className="space-y-3 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span><strong>Gene name</strong> (e.g., FLT3, NPM1): The specific gene affected</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span><strong>Variant type</strong> (e.g., ITD, TKD, point mutation): How the gene is changed</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span><strong>Allelic ratio</strong> or VAF: How much of the leukemia carries this mutation</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-bold">✓</span>
                                <span><strong>Clinical significance</strong>: Whether it impacts prognosis or treatment</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mt-8">
                        <h3 className="font-bold text-purple-900 mb-2">💡 Ask Your Doctor</h3>
                        <p className="text-purple-800">
                            Don't hesitate to ask your care team to walk through your mutation report with you. Good questions include: "Which mutations are most important for my treatment?" and "Are there any targeted therapies for my mutations?"
                        </p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
                        <h3 className="font-bold text-blue-900 mb-2">📚 Learn More</h3>
                        <p className="text-blue-800 mb-4">
                            Blood Cancer United provides detailed information about genetic testing and mutations in blood cancers.
                        </p>
                        <ExternalLink href="https://bloodcancerunited.org/blood-cancer/leukemia/acute-myeloid-leukemia-aml/diagnosis">
                            AML Diagnosis and Testing at Blood Cancer United
                        </ExternalLink>
                    </div>
                </div>

                <RelatedTopics currentTopic="mutations" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};

export const RiskStratificationPage: React.FC<EducationPageProps> = ({ onNavigateToLearn }) => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">📊</span>
                    <h1 className="text-3xl font-bold text-gray-900">Risk Stratification</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        Risk stratification helps doctors predict how your disease might behave and choose the best treatment approach for you.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What is Risk Stratification?</h2>
                    <p>
                        <strong>Risk stratification</strong> is the process of categorizing patients into groups based on the likely
                        course of their disease. It's not about blame or fault—it's a scientific tool to personalize treatment.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">The Three Risk Categories</h2>
                    <div className="space-y-4 my-6">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h3 className="font-bold text-green-800 mb-2">✅ Favorable Risk</h3>
                            <p className="text-sm text-green-700">
                                Better response to standard chemotherapy expected. May not require a stem cell transplant in first remission.
                                Examples: NPM1 mutation without FLT3-ITD, certain chromosome changes like t(8;21).
                            </p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <h3 className="font-bold text-amber-800 mb-2">⚠️ Intermediate Risk</h3>
                            <p className="text-sm text-amber-700">
                                Treatment decisions are often individualized. A stem cell transplant may be considered based on other factors.
                            </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <h3 className="font-bold text-red-800 mb-2">⚡ Adverse Risk</h3>
                            <p className="text-sm text-red-700">
                                More intensive approaches often recommended, including stem cell transplant. Clinical trials may offer promising options.
                                Examples: TP53 mutations, complex karyotype.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Factors That Determine Risk</h2>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li><strong>Genetic mutations</strong>: Specific gene changes in your cancer cells</li>
                        <li><strong>Chromosome changes</strong>: Also called cytogenetics or karyotype</li>
                        <li><strong>Response to initial treatment</strong>: How quickly the disease responds</li>
                        <li><strong>Patient factors</strong>: Age and overall health</li>
                    </ul>

                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mt-8">
                        <h3 className="font-bold text-purple-900 mb-2">💡 Important to Remember</h3>
                        <p className="text-purple-800">
                            Risk categories are based on statistics from many patients. Your individual journey may differ.
                            Always discuss your specific situation with your medical team.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">The ELN 2022 Classification</h2>
                    <p>
                        Doctors use standardized guidelines to classify AML risk. The most current is the <strong>ELN 2022</strong> (European LeukemiaNet 2022) classification, which considers both genetic mutations and chromosome changes.
                    </p>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 my-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Changes in ELN 2022:</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                Added <strong>MRD assessment</strong> as a factor in determining risk after treatment begins
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                Recognizes more <strong>favorable mutations</strong> including bZIP CEBPA mutations
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                Considers <strong>FLT3-ITD allelic ratio</strong> no longer a factor for risk category
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                New adverse-risk genetic markers including <strong>MECOM rearrangements</strong>
                            </li>
                        </ul>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">MRD: Minimal Residual Disease</h2>
                    <p>
                        <strong>MRD</strong> (Minimal Residual Disease) refers to tiny amounts of cancer cells that remain after treatment—too few to detect with standard tests. MRD status is increasingly used to refine your risk category.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h3 className="font-bold text-green-800 mb-2">MRD Negative</h3>
                            <p className="text-sm text-green-700">
                                No detectable leukemia cells with sensitive tests. Associated with better outcomes and may influence transplant decisions.
                            </p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <h3 className="font-bold text-amber-800 mb-2">MRD Positive</h3>
                            <p className="text-sm text-amber-700">
                                Some leukemia cells still detectable. May indicate a higher risk of relapse and could prompt more intensive treatment.
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        MRD is typically measured using <strong>flow cytometry</strong> or <strong>PCR testing</strong> at specific time points during treatment.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What Happens After Risk Assessment?</h2>
                    <p>
                        Your risk category helps guide the next steps in your treatment plan:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li><strong>Favorable risk</strong>: May receive chemotherapy alone in first remission, with transplant reserved if disease returns</li>
                        <li><strong>Intermediate risk</strong>: Treatment decisions weigh MRD status, age, fitness, and donor availability</li>
                        <li><strong>Adverse risk</strong>: Stem cell transplant often recommended in first remission; clinical trials may offer best options</li>
                    </ul>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
                        <h3 className="font-bold text-blue-900 mb-2">📚 Learn More</h3>
                        <p className="text-blue-800 mb-4">
                            Blood Cancer United explains treatment outcomes and what influences them.
                        </p>
                        <ExternalLink href="https://bloodcancerunited.org/blood-cancer/leukemia/acute-myeloid-leukemia-aml/treatment">
                            AML Treatment Information at Blood Cancer United
                        </ExternalLink>
                    </div>
                </div>

                <RelatedTopics currentTopic="risk" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};

export const StemCellTransplantPage: React.FC<EducationPageProps> = ({ onNavigateToLearn }) => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🏥</span>
                    <h1 className="text-3xl font-bold text-gray-900">Stem Cell Transplants</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        A stem cell transplant (also called a bone marrow transplant) can be a life-saving treatment for many blood cancers.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What is a Stem Cell Transplant?</h2>
                    <p>
                        A stem cell transplant replaces your diseased bone marrow with healthy blood-forming stem cells.
                        This gives you a new, healthy immune system capable of fighting your cancer.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Types of Transplants</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2">Allogeneic Transplant</h3>
                            <p className="text-sm text-blue-700 mb-2">
                                Stem cells come from a <strong>donor</strong>—either a family member or unrelated matched donor.
                            </p>
                            <p className="text-xs text-blue-600">
                                The donor's immune system can help fight remaining cancer cells (graft-versus-leukemia effect).
                            </p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                            <h3 className="font-bold text-green-800 mb-2">Autologous Transplant</h3>
                            <p className="text-sm text-green-700 mb-2">
                                Uses your <strong>own stem cells</strong>, collected and stored before high-dose chemotherapy.
                            </p>
                            <p className="text-xs text-green-600">
                                More common for lymphoma and myeloma than for leukemia.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">The Transplant Process</h2>
                    <ol className="list-decimal pl-6 space-y-3 my-4">
                        <li><strong>Conditioning</strong>: High-dose chemotherapy (and sometimes radiation) to destroy cancer cells and make room for new stem cells</li>
                        <li><strong>Transplant day</strong>: Healthy stem cells are infused through an IV, similar to a blood transfusion</li>
                        <li><strong>Engraftment</strong>: New stem cells travel to your bone marrow and begin making healthy blood cells (usually 2-4 weeks)</li>
                        <li><strong>Recovery</strong>: Gradual immune system recovery over months to years</li>
                    </ol>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Finding a Donor</h2>
                    <p>
                        If you need an allogeneic transplant, your medical team will search for a matching donor. Options include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li>Siblings (about 25-30% chance of a match)</li>
                        <li>Parents or children (haploidentical, or half-matched)</li>
                        <li>Unrelated donors through registries like <ExternalLink href="https://bethematch.org">Be The Match</ExternalLink></li>
                        <li>Umbilical cord blood</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Preparing for Transplant</h2>
                    <p>
                        Before your transplant, you'll go through an extensive workup to ensure you're ready. This typically includes:
                    </p>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 my-6">
                        <ul className="space-y-3 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">📋</span>
                                <span><strong>Medical evaluation</strong>: Heart, lung, liver, and kidney function tests</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">🦷</span>
                                <span><strong>Dental clearance</strong>: Treating infections before immunosuppression</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">💉</span>
                                <span><strong>Central line placement</strong>: A catheter for medications and blood draws</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">🏠</span>
                                <span><strong>Caregiver planning</strong>: Arranging 24/7 support for the first 100 days</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">📚</span>
                                <span><strong>Education sessions</strong>: Learning about what to expect and how to care for yourself</span>
                            </li>
                        </ul>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Understanding GVHD</h2>
                    <p>
                        <strong>Graft-versus-Host Disease (GVHD)</strong> is a common complication of allogeneic transplants where the donor's immune cells recognize your body as "foreign" and attack it.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
                            <h3 className="font-bold text-amber-800 mb-2">Acute GVHD</h3>
                            <p className="text-sm text-amber-700 mb-2">
                                Occurs within the first 100 days. May affect skin (rash), gut (diarrhea), and liver.
                            </p>
                            <p className="text-xs text-amber-600">
                                Treated with steroids and other immunosuppressive medications.
                            </p>
                        </div>
                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                            <h3 className="font-bold text-purple-800 mb-2">Chronic GVHD</h3>
                            <p className="text-sm text-purple-700 mb-2">
                                Develops after 100 days. Can affect skin, eyes, mouth, joints, and other organs.
                            </p>
                            <p className="text-xs text-purple-600">
                                May require long-term management but often improves over time.
                            </p>
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <h4 className="font-bold text-green-800 mb-2">💡 The Silver Lining</h4>
                        <p className="text-sm text-green-700">
                            Mild GVHD can actually be beneficial—it's a sign that the donor immune cells are active and may help prevent cancer relapse (graft-versus-leukemia effect).
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Life After Transplant</h2>
                    <p>
                        Recovery from a stem cell transplant is a marathon, not a sprint. Here's what to expect:
                    </p>
                    <div className="space-y-4 my-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h4 className="font-semibold text-blue-800 mb-1">First 100 Days</h4>
                            <p className="text-sm text-blue-700">High infection risk, frequent clinic visits, dietary restrictions, close monitoring for GVHD.</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                            <h4 className="font-semibold text-teal-800 mb-1">3-12 Months</h4>
                            <p className="text-sm text-teal-700">Gradual immune recovery, possible tapering of immunosuppression, energy slowly returning.</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <h4 className="font-semibold text-green-800 mb-1">1-2 Years and Beyond</h4>
                            <p className="text-sm text-green-700">Re-vaccination, return to many normal activities, ongoing monitoring, potential long-term effects management.</p>
                        </div>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mt-8">
                        <h3 className="font-bold text-purple-900 mb-2">🌟 Survivorship Resources</h3>
                        <p className="text-purple-800">
                            Many transplant centers have survivorship programs to help with the physical, emotional, and practical challenges of life after transplant. Ask your team about available resources.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
                        <h3 className="font-bold text-blue-900 mb-2">📚 Learn More</h3>
                        <p className="text-blue-800 mb-4">
                            Blood Cancer United provides comprehensive information about stem cell transplantation.
                        </p>
                        <ExternalLink href="https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/stem-cell-transplantation">
                            Stem Cell Transplantation at Blood Cancer United
                        </ExternalLink>
                    </div>
                </div>

                <RelatedTopics currentTopic="transplant" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};

export const LabResultsPage: React.FC<EducationPageProps> = ({ onNavigateToLearn }) => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🔬</span>
                    <h1 className="text-3xl font-bold text-gray-900">Understanding Your Lab Results</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        Lab results can feel overwhelming at first. This guide will help you understand the most common blood tests you'll encounter during your leukemia journey.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">The Complete Blood Count (CBC)</h2>
                    <p>
                        The <strong>CBC</strong> is the most frequently ordered blood test. It measures the three main types of blood cells and provides insight into your bone marrow function.
                    </p>

                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Red Blood Cells (RBC)</h3>
                    <div className="bg-red-50 p-5 rounded-xl border border-red-100 mb-6">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-red-100">
                                    <td className="py-2 font-medium text-red-800">Hemoglobin (Hgb)</td>
                                    <td className="py-2 text-red-700">Normal: 12-16 g/dL (women), 14-18 g/dL (men)</td>
                                </tr>
                                <tr className="border-b border-red-100">
                                    <td className="py-2 font-medium text-red-800">Hematocrit (Hct)</td>
                                    <td className="py-2 text-red-700">Normal: 36-44% (women), 41-50% (men)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-medium text-red-800">RBC Count</td>
                                    <td className="py-2 text-red-700">Normal: 4.0-5.5 million/µL</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-red-600 mt-3">
                            Low values indicate anemia. You may need a transfusion if hemoglobin drops below 7-8 g/dL or you have symptoms.
                        </p>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">White Blood Cells (WBC)</h3>
                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-6">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-b border-blue-100">
                                    <td className="py-2 font-medium text-blue-800">WBC Count</td>
                                    <td className="py-2 text-blue-700">Normal: 4,500-11,000/µL</td>
                                </tr>
                                <tr className="border-b border-blue-100">
                                    <td className="py-2 font-medium text-blue-800">Absolute Neutrophil Count (ANC)</td>
                                    <td className="py-2 text-blue-700">Normal: 1,500-8,000/µL</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-medium text-blue-800">Lymphocytes</td>
                                    <td className="py-2 text-blue-700">Normal: 1,000-4,800/µL</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-blue-600 mt-3">
                            ANC &lt; 500 = severe neutropenia (high infection risk). ANC &lt; 1000 = moderate neutropenia.
                        </p>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Platelets (PLT)</h3>
                    <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mb-6">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr>
                                    <td className="py-2 font-medium text-purple-800">Platelet Count</td>
                                    <td className="py-2 text-purple-700">Normal: 150,000-400,000/µL</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-purple-600 mt-3">
                            &lt; 50,000 = increased bleeding risk. &lt; 10,000 = may need platelet transfusion.
                        </p>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">The Differential (Diff)</h2>
                    <p>
                        The <strong>differential</strong> breaks down your white blood cells into subtypes. In leukemia, this helps track the percentage of abnormal cells.
                    </p>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 my-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Normal Cells</h4>
                                <ul className="space-y-1 text-gray-700">
                                    <li>• Neutrophils: 40-70%</li>
                                    <li>• Lymphocytes: 20-40%</li>
                                    <li>• Monocytes: 2-8%</li>
                                    <li>• Eosinophils: 1-4%</li>
                                    <li>• Basophils: 0.5-1%</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Abnormal Findings</h4>
                                <ul className="space-y-1 text-gray-700">
                                    <li>• <strong>Blasts</strong>: Immature cells (normally 0%)</li>
                                    <li>• High blast % = active leukemia</li>
                                    <li>• Disappearing blasts = response to treatment</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Other Important Labs</h2>
                    <div className="space-y-4 my-6">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <h4 className="font-bold text-amber-800 mb-1">Comprehensive Metabolic Panel (CMP)</h4>
                            <p className="text-sm text-amber-700">Checks kidney function (creatinine, BUN), liver function (AST, ALT, bilirubin), and electrolytes. Important for monitoring treatment side effects.</p>
                        </div>
                        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                            <h4 className="font-bold text-teal-800 mb-1">LDH (Lactate Dehydrogenase)</h4>
                            <p className="text-sm text-teal-700">Marker of cell turnover. High levels may indicate active disease or rapid cell breakdown (tumor lysis).</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-800 mb-1">Uric Acid</h4>
                            <p className="text-sm text-indigo-700">Can rise when leukemia cells break down during treatment. Monitored to prevent tumor lysis syndrome.</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Flow Cytometry</h2>
                    <p>
                        <strong>Flow cytometry</strong> is a specialized test that identifies cell types by their surface markers (called CDs, like CD34, CD33). It's used for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 my-4">
                        <li>Diagnosing the specific type of leukemia</li>
                        <li>Measuring MRD (minimal residual disease) after treatment</li>
                        <li>Monitoring for relapse</li>
                    </ul>

                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mt-8">
                        <h3 className="font-bold text-purple-900 mb-2">💡 Tip: Keep a Lab Tracker</h3>
                        <p className="text-purple-800">
                            Create a simple spreadsheet to track your key values (ANC, Hgb, Platelets) over time. This helps you see trends and understand how your body responds to treatment.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
                        <h3 className="font-bold text-blue-900 mb-2">📚 Learn More</h3>
                        <p className="text-blue-800 mb-4">
                            The Leukemia & Lymphoma Society has detailed guides on understanding blood test results.
                        </p>
                        <ExternalLink href="https://www.lls.org/treatment/lab-and-imaging-tests">
                            Lab and Imaging Tests at LLS
                        </ExternalLink>
                    </div>
                </div>

                <RelatedTopics currentTopic="lab-results" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};

export const ClinicalTrialsPage: React.FC<EducationPageProps> = ({ onNavigateToLearn }) => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🧪</span>
                    <h1 className="text-3xl font-bold text-gray-900">Clinical Trial Basics</h1>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700">
                    <p className="lead text-xl text-gray-600 mb-6">
                        Clinical trials offer access to promising new treatments before they're widely available. Understanding how they work can help you decide if a trial is right for you.
                    </p>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What is a Clinical Trial?</h2>
                    <p>
                        A <strong>clinical trial</strong> is a carefully designed research study that tests new treatments, drugs, or procedures in people. Every approved cancer treatment was once tested in a clinical trial.
                    </p>
                    <div className="bg-green-50 p-5 rounded-xl border border-green-100 my-6">
                        <h4 className="font-bold text-green-800 mb-2">✨ Why Consider a Trial?</h4>
                        <ul className="space-y-2 text-sm text-green-700">
                            <li>• Access to cutting-edge treatments not yet available</li>
                            <li>• Close monitoring by specialized research teams</li>
                            <li>• Contribute to advancing treatment for future patients</li>
                            <li>• Many trial treatments are provided at no cost</li>
                        </ul>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Phases of Clinical Trials</h2>
                    <div className="space-y-4 my-6">
                        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2">Phase 1</h3>
                            <p className="text-sm text-blue-700 mb-2">
                                <strong>Goal:</strong> Determine safe dosage and identify side effects.
                            </p>
                            <p className="text-xs text-blue-600">
                                Small number of patients (20-80). First time in humans. Focus on safety, not effectiveness.
                            </p>
                        </div>
                        <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                            <h3 className="font-bold text-teal-800 mb-2">Phase 2</h3>
                            <p className="text-sm text-teal-700 mb-2">
                                <strong>Goal:</strong> Test effectiveness and further evaluate safety.
                            </p>
                            <p className="text-xs text-teal-600">
                                Larger group (100-300). Does the treatment work? What's the response rate?
                            </p>
                        </div>
                        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                            <h3 className="font-bold text-indigo-800 mb-2">Phase 3</h3>
                            <p className="text-sm text-indigo-700 mb-2">
                                <strong>Goal:</strong> Compare new treatment to current standard of care.
                            </p>
                            <p className="text-xs text-indigo-600">
                                Large scale (1,000-3,000). Randomized controlled trials. Required for FDA approval.
                            </p>
                        </div>
                        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                            <h3 className="font-bold text-purple-800 mb-2">Phase 4</h3>
                            <p className="text-sm text-purple-700 mb-2">
                                <strong>Goal:</strong> Monitor long-term safety after FDA approval.
                            </p>
                            <p className="text-xs text-purple-600">
                                Post-marketing surveillance. Detects rare side effects.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">How to Find Clinical Trials</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <a href="https://clinicaltrials.gov" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group no-underline">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 mb-2">ClinicalTrials.gov</h4>
                            <p className="text-sm text-gray-600">The official U.S. database of all registered clinical trials worldwide.</p>
                        </a>
                        <a href="https://www.lls.org/treatment/types-treatment/clinical-trials" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group no-underline">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 mb-2">LLS Clinical Trial Support</h4>
                            <p className="text-sm text-gray-600">Free personalized trial searches and nurse navigators.</p>
                        </a>
                        <a href="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search" target="_blank" rel="noopener noreferrer" className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group no-underline">
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 mb-2">NCI Cancer Trials</h4>
                            <p className="text-sm text-gray-600">National Cancer Institute's trial finder with detailed information.</p>
                        </a>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-2">Your Treatment Center</h4>
                            <p className="text-sm text-gray-600">Ask your oncologist about trials at your hospital or nearby academic centers.</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Questions to Ask About a Trial</h2>
                    <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 my-6">
                        <ul className="space-y-3 text-sm text-amber-800">
                            <li className="flex items-start gap-2">
                                <span>❓</span>
                                <span>What is the goal of this trial? What phase is it?</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>❓</span>
                                <span>What are the potential benefits and risks?</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>❓</span>
                                <span>How often will I need to visit the clinic?</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>❓</span>
                                <span>Will my insurance cover any costs not covered by the trial?</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>❓</span>
                                <span>Can I leave the trial if I change my mind?</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span>❓</span>
                                <span>What happens if the treatment doesn't work for me?</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mt-8">
                        <h3 className="font-bold text-purple-900 mb-2">💡 Know Your Rights</h3>
                        <p className="text-purple-800">
                            Participating in a clinical trial is always voluntary. You can leave at any time without affecting your regular care. All trials require informed consent—a detailed document explaining everything about the study.
                        </p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mt-8">
                        <h3 className="font-bold text-blue-900 mb-2">📚 Learn More</h3>
                        <p className="text-blue-800 mb-4">
                            The National Cancer Institute provides comprehensive guides on understanding clinical trials.
                        </p>
                        <ExternalLink href="https://www.cancer.gov/about-cancer/treatment/clinical-trials/what-are-trials">
                            What Are Clinical Trials? at NCI
                        </ExternalLink>
                    </div>
                </div>

                <RelatedTopics currentTopic="clinical-trials" onNavigate={onNavigateToLearn} />
            </div>
        </div>
    );
};
