import bcuLogo from './assets/bcu-logo.png'
import nmdpLogo from './assets/nmdp-logo.png'
import acsLogo from './assets/acs-logo.svg'
import cancercareLogo from './assets/cancercare-logo.png'
import redcrossLogo from './assets/redcross-logo.png'

export const AboutPage = () => {
    return (
        <div className="py-6">
            {/* Mission Statement */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-3">
                        LeukemiaLens is intended to empower researchers and clinicians by aggregating the latest scientific findings about Leukemia of all sorts from PubMed.
                        We categorize articles by mutations, diseases, and topics to help you drill down faster, then use cutting edge AI to provide you with a summary of the articles and ask further questions.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        Along with that, we also want to provide additional learning resources to the leukemia and bone marrow transplant community.
                        We are currently working on a series of articles that will provide a comprehensive overview of leukemia and bone marrow transplant.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        As an AML patient and bone marrow transplant survivor myself, I wanted to provide additional resources to the leukemia and bone marrow transplant community.
                        I found it hard to navigate the vast amount of information available during my journey.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        I created LeukemiaLens in order to help others along this journey, whether it be patients and caregivers navigating a new diagnosis, or researchers and transplant physicians that need to constantly stay up to date with the latest research and treatment options.
                        Looking around the web, there didn't seem to be a good solution for filtering the large amount of information available on PubMed and other sources in ways that made sense for leukemia and bone marrow transplant research.
                        With that in mind, I thought that current breakthroughs in AI and cloud infrastructure would allow me to create a solution that would be both fast and scalable, and most importantly, helpful to the community.
                    </p>
                </div>
            </section>

            {/* Usage & Licensing */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage & Licensing</h2>
                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-3">
                        LeukemiaLens is provided as a free service to the research and medical community. Our goal is to accelerate
                        leukemia research and improve patient outcomes by making scientific literature more accessible and discoverable.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Copyright Notice</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            © {new Date().getFullYear()} LeukemiaLens. All rights reserved. This website and its content, including
                            but not limited to text, graphics, user interface, and the selection and arrangement thereof, are protected
                            by copyright and other intellectual property laws.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed mt-3">
                            <strong>Free to Use:</strong> LeukemiaLens is free to use for research, clinical, and educational purposes.
                            No commercial use of this platform is permitted without prior written authorization.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed mt-3">
                            All PubMed article data is sourced from the National Library of Medicine and is subject to their respective
                            copyright and usage terms.
                        </p>
                    </div>

                    {/* Medical Disclaimer */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
                        <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                            <span>⚠️</span> Medical Disclaimer
                        </h3>
                        <p className="text-sm text-amber-800 leading-relaxed mb-3">
                            <strong>LeukemiaLens is for informational and educational purposes only.</strong> The content provided on this website,
                            including but not limited to research summaries, AI-generated insights, and educational materials, does not constitute
                            medical advice, diagnosis, or treatment recommendations.
                        </p>
                        <p className="text-sm text-amber-800 leading-relaxed mb-3">
                            I am not a physician, licensed healthcare provider, or medical professional. The information presented here is
                            intended to supplement—not replace—the relationship between you and your qualified healthcare providers.
                        </p>
                        <p className="text-sm text-amber-800 leading-relaxed mb-3">
                            <strong>Always consult with your doctor, oncologist, or other qualified medical professional</strong> before making
                            any decisions regarding your health or treatment options. Never disregard professional medical advice or delay
                            seeking it because of something you have read on this website.
                        </p>
                        <p className="text-sm text-amber-800 leading-relaxed">
                            If you are experiencing a medical emergency, please call your local emergency services immediately.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}


export const ContactPage = () => {
    return (
        <div className="py-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                    We welcome your feedback, feature requests, and bug reports. Your input helps us improve LeukemiaLens
                    and better serve the research and medical community.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">Get in Touch</h2>
                    <p className="text-gray-700 mb-2">
                        For all inquiries, please email us at:
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                        <a href="mailto:admin@leukemialens.com" className="hover:underline">
                            admin@leukemialens.com
                        </a>
                    </p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">What to Include:</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5">
                            <div className="text-3xl mb-3">💡</div>
                            <h4 className="font-semibold text-gray-900 mb-2">Feature Requests</h4>
                            <p className="text-sm text-gray-700">
                                Have an idea for a new feature or improvement? We'd love to hear it!
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-5">
                            <div className="text-3xl mb-3">🐛</div>
                            <h4 className="font-semibold text-gray-900 mb-2">Bug Reports</h4>
                            <p className="text-sm text-gray-700">
                                Found a bug? Please include steps to reproduce and any error messages.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-5">
                            <div className="text-3xl mb-3">📝</div>
                            <h4 className="font-semibold text-gray-900 mb-2">General Feedback</h4>
                            <p className="text-sm text-gray-700">
                                Share your experience using LeukemiaLens and how we can improve.
                            </p>
                        </div>
                    </div>
                </div>

                {/* GitHub Contribution Section */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6 mt-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-4xl">💻</div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contribute to LeukemiaLens</h3>
                            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                                LeukemiaLens is an open-source project! We welcome developers, researchers, and contributors
                                to review the architecture, suggest improvements, or contribute code directly.
                            </p>
                            <a
                                href="https://github.com/jrhinehart/LeukemiaLens"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                View on GitHub
                            </a>
                            <p className="text-xs text-gray-500 mt-3">
                                Star the repo, open an issue, or submit a pull request - all contributions are appreciated!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const ResourcesPage = ({ onNavigateToLearn }: { onNavigateToLearn: (topic: string) => void }) => {
    return (
        <div className="py-6">
            <p className="text-lg text-gray-600 mb-10">
                A curated collection of databases, organizations, and tools for researchers, clinicians, and patients.
            </p>

            {/* Disease Information */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">🩺</span>
                    Disease Information
                </h2>
                <p className="text-gray-600 mb-4">
                    Comprehensive overviews of different types of blood cancers, their subtypes, and common treatment approaches.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => { window.history.pushState({}, '', '/myeloid'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                        className="text-left p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-1">Myeloid Neoplasms</h3>
                        <p className="text-sm text-gray-600">AML, MDS, CML, and MPN</p>
                    </button>
                    <button
                        onClick={() => { window.history.pushState({}, '', '/lymphoid'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                        className="text-left p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-1">Lymphoid Neoplasms</h3>
                        <p className="text-sm text-gray-600">ALL and CLL</p>
                    </button>
                    <button
                        onClick={() => { window.history.pushState({}, '', '/myeloma'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                        className="text-left p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-1">Plasma Cell Disorders</h3>
                        <p className="text-sm text-gray-600">Multiple Myeloma and precursors</p>
                    </button>
                </div>
            </section>

            {/* Learning Center - Educational Content */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">📚</span>
                    Learning Center
                </h2>
                <p className="text-gray-600 mb-4">
                    Educational resources designed to help newly diagnosed patients and caregivers understand blood cancer fundamentals.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <a
                        href="/learn/blood-cells"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('blood-cells'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🩸</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Blood Cell Production</h3>
                        </div>
                        <p className="text-sm text-gray-600">Understanding how blood cells are made and what goes wrong in leukemia.</p>
                    </a>
                    <a
                        href="/learn/mutations"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('mutations'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🧬</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-green-600">Mutations</h3>
                        </div>
                        <p className="text-sm text-gray-600">Learn about common genetic mutations and how they affect treatment.</p>
                    </a>
                    <a
                        href="/learn/risk"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('risk'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">📊</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Risk Stratification</h3>
                        </div>
                        <p className="text-sm text-gray-600">How doctors categorize risk to personalize your treatment plan.</p>
                    </a>
                    <a
                        href="/learn/transplant"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('transplant'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🏥</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">Stem Cell Transplants</h3>
                        </div>
                        <p className="text-sm text-gray-600">What to expect before, during, and after a transplant.</p>
                    </a>
                    <a
                        href="/learn/lab-results"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('lab-results'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🔬</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-amber-600">Lab Results</h3>
                        </div>
                        <p className="text-sm text-gray-600">Understanding your CBC, differential, and other common blood tests.</p>
                    </a>
                    <a
                        href="/learn/clinical-trials"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('clinical-trials'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🧪</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-teal-600">Clinical Trials</h3>
                        </div>
                        <p className="text-sm text-gray-600">How trials work, where to find them, and questions to ask.</p>
                    </a>
                    <a
                        href="/learn/treatments"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('treatments'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">💊</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-pink-600">Treatments</h3>
                        </div>
                        <p className="text-sm text-gray-600">Overview of treatment approaches including chemotherapy, targeted therapy, and immunotherapy.</p>
                    </a>
                    <a
                        href="/learn/medications"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('medications'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">💉</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600">Medications</h3>
                        </div>
                        <p className="text-sm text-gray-600">Common leukemia medications, how they work, and what to expect.</p>
                    </a>
                    <a
                        href="/learn/history"
                        onClick={(e) => { e.preventDefault(); onNavigateToLearn('history'); }}
                        className="block p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">📜</span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-amber-600">History of Leukemia</h3>
                        </div>
                        <p className="text-sm text-gray-600">The journey from earliest descriptions to modern targeted therapies and immunotherapy breakthroughs.</p>
                    </a>
                </div>
            </section>

            {/* Cancer Genomic Databases */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">🧬</span>
                    Cancer Genomic Databases
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a
                        href="https://www.cbioportal.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">cBioPortal</h3>
                        <p className="text-sm text-gray-600">
                            Explore, visualize, and analyze multidimensional cancer genomics data from large-scale cancer studies.
                        </p>
                    </a>

                    <a
                        href="https://cancer.sanger.ac.uk/cosmic"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">COSMIC</h3>
                        <p className="text-sm text-gray-600">
                            Catalogue of Somatic Mutations in Cancer - the world's largest source of expert manually curated somatic mutation information.
                        </p>
                    </a>

                    <a
                        href="https://www.cancer.gov/ccg/research/genome-sequencing/tcga"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">The Cancer Genome Atlas (TCGA)</h3>
                        <p className="text-sm text-gray-600">
                            Comprehensive genomic characterization of more than 20,000 primary cancer samples across 33 cancer types.
                        </p>
                    </a>

                    <a
                        href="https://portal.gdc.cancer.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">GDC Data Portal</h3>
                        <p className="text-sm text-gray-600">
                            NIH Genomic Data Commons - unified data repository enabling data sharing across cancer genomic studies.
                        </p>
                    </a>

                    <a
                        href="https://www.vizome.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">Vizome</h3>
                        <p className="text-sm text-gray-600">
                            A collaborative platform for exploring and visualizing multidimensional cancer genomics data, with a strong focus on hematologic malignancies.
                        </p>
                    </a>
                </div>
            </section>

            {/* Patient Advocacy Groups */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">🤝</span>
                    Patient Advocacy & Support Organizations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a
                        href="https://www.lls.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col sm:flex-row items-center sm:items-start gap-6"
                    >
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg p-2">
                            <img src={bcuLogo} alt="Blood Cancer United" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">Blood Cancer United</h3>
                            <p className="text-sm text-gray-600">
                                The world's largest voluntary health organization dedicated to funding blood cancer research and providing patient support.
                            </p>
                        </div>
                    </a>

                    <a
                        href="https://bethematch.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col sm:flex-row items-center sm:items-start gap-6"
                    >
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg p-2">
                            <img src={nmdpLogo} alt="Be The Match (NMDP)" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">Be The Match (NMDP)</h3>
                            <p className="text-sm text-gray-600">
                                National Marrow Donor Program - connecting patients with life-saving marrow and cord blood transplants.
                            </p>
                        </div>
                    </a>

                    <a
                        href="https://www.cancer.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col sm:flex-row items-center sm:items-start gap-6"
                    >
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg p-2">
                            <img src={acsLogo} alt="American Cancer Society" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">American Cancer Society</h3>
                            <p className="text-sm text-gray-600">
                                Nationwide organization providing cancer research, patient support, and educational resources for all cancer types.
                            </p>
                        </div>
                    </a>

                    <a
                        href="https://www.cancercare.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col sm:flex-row items-center sm:items-start gap-6"
                    >
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg p-2">
                            <img src={cancercareLogo} alt="CancerCare" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">CancerCare</h3>
                            <p className="text-sm text-gray-600">
                                Free, professional support services for anyone affected by cancer, including counseling, support groups, and financial assistance.
                            </p>
                        </div>
                    </a>

                    <a
                        href="https://www.redcross.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col sm:flex-row items-center sm:items-start gap-6"
                    >
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center bg-gray-50 rounded-lg p-2">
                            <img src={redcrossLogo} alt="American Red Cross" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">American Red Cross</h3>
                            <p className="text-sm text-gray-600">
                                Providing critical blood products and support services to patients across the country, especially those undergoing intensive treatment.
                            </p>
                        </div>
                    </a>
                </div>
            </section>

            {/* Clinical Trials */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span className="text-3xl">🔬</span>
                    Clinical Trials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <a
                        href="https://clinicaltrials.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">ClinicalTrials.gov</h3>
                        <p className="text-sm text-gray-600">
                            U.S. government database of clinical studies conducted around the world. Search for leukemia trials by location, phase, and type.
                        </p>
                    </a>

                    <a
                        href="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">NCI Clinical Trials Search</h3>
                        <p className="text-sm text-gray-600">
                            National Cancer Institute's comprehensive database of cancer clinical trials supported by NCI and other organizations.
                        </p>
                    </a>

                    <a
                        href="https://www.clinicaltrialsregister.eu/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all group"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">EU Clinical Trials Register</h3>
                        <p className="text-sm text-gray-600">
                            European Union's database of clinical trials conducted in the EU/EEA, providing information on trial protocols and results.
                        </p>
                    </a>
                </div>
            </section>
        </div>
    )
}
