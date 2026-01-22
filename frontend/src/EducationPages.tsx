import React from 'react';
import { PageHeader } from './components';

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
        { id: 'blood-cells', label: 'Blood Cell Production', icon: '🩸' },
        { id: 'mutations', label: 'Mutations', icon: '🧬' },
        { id: 'risk', label: 'Risk Stratification', icon: '📊' },
        { id: 'transplant', label: 'Stem Cell Transplants', icon: '🏥' },
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

export const BloodCellProductionPage: React.FC<EducationPageProps> = ({ onNavigateHome, onNavigateToLearn }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PageHeader title="Understanding Blood Cell Production" onNavigateHome={onNavigateHome} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">🩸</span>
                        <h1 className="text-3xl font-bold text-gray-900">How Your Blood is Made</h1>
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
                    </div>

                    <RelatedTopics currentTopic="blood-cells" onNavigate={onNavigateToLearn} />
                </div>
            </main>
        </div>
    );
};

export const MutationsPage: React.FC<EducationPageProps> = ({ onNavigateHome, onNavigateToLearn }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PageHeader title="Understanding Mutations" onNavigateHome={onNavigateHome} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
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
            </main>
        </div>
    );
};

export const RiskStratificationPage: React.FC<EducationPageProps> = ({ onNavigateHome, onNavigateToLearn }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PageHeader title="Understanding Risk Stratification" onNavigateHome={onNavigateHome} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
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
            </main>
        </div>
    );
};

export const StemCellTransplantPage: React.FC<EducationPageProps> = ({ onNavigateHome, onNavigateToLearn }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PageHeader title="Understanding Stem Cell Transplants" onNavigateHome={onNavigateHome} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
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
            </main>
        </div>
    );
};
