import React from 'react';
import bannerImage from './assets/LL-logo-banner.jpg';
import nmdpLogo from './assets/nmdp-logo.png';
import redcrossLogo from './assets/redcross-logo.png';

interface LandingPageProps {
    onNavigateToDisease: (id: string) => void;
    onStartSearch: () => void;
    onNavigateToPage: (page: 'about' | 'contact' | 'stats' | 'resources') => void;
    onNavigateToLearn: (topic: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDisease, onStartSearch, onNavigateToPage, onNavigateToLearn }) => {

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
            {/* Hero Section */}
            <header className="relative bg-gradient-to-r from-blue-950 via-blue-700 to-blue-500 text-white overflow-hidden">
                {/* Top Navigation */}
                <nav className="absolute top-4 right-4 sm:right-8 flex gap-6 text-sm font-medium z-30">
                    <button onClick={() => onNavigateToPage('about')} className="text-blue-100 hover:text-white transition-colors cursor-pointer">About</button>
                    <button onClick={() => onNavigateToPage('contact')} className="text-blue-100 hover:text-white transition-colors cursor-pointer">Contact</button>
                    <button onClick={() => onNavigateToPage('resources')} className="text-blue-100 hover:text-white transition-colors cursor-pointer">Resources</button>
                    <button onClick={() => onNavigateToPage('stats')} className="text-blue-100 hover:text-white transition-colors cursor-pointer">Stats</button>
                </nav>

                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>


                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col items-center text-center">
                    <img src={bannerImage} alt="LeukemiaLens" className="h-20 md:h-24 object-contain mb-4 drop-shadow-xl" />
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                        Compassionate Data for <br />the Leukemia Community
                    </h1>
                    <p className="max-w-3xl text-blue-100 text-lg md:text-xl leading-relaxed mb-6 font-light">
                        Whether you are a patient, caregiver, or researcher, LeukemiaLens translates complex scientific data into actionable insights and tools.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={onStartSearch}
                            className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Scientific Article Search
                        </button>
                        <button
                            onClick={() => onNavigateToPage('about')}
                            className="bg-blue-600/30 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-600/50 transition-all"
                        >
                            Our Mission
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Navigation Path */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Start Your Journey</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">Choose a disease group to find tailored resources, latest news, and treatment information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Myeloid Card */}
                    <button
                        onClick={() => onNavigateToDisease('myeloid')}
                        className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left"
                    >
                        <div className="h-3 bg-blue-500"></div>
                        <div className="p-6">
                            <div className="text-4xl mb-4">🧬</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Myeloid Neoplasms</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">Resources for AML, MDS, CML, and other myeloid-related blood cancers.</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">AML</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">MDS</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">CML</span>
                            </div>
                            <span className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                Explore Resources <span>→</span>
                            </span>
                        </div>
                    </button>

                    {/* Lymphoid Card */}
                    <button
                        onClick={() => onNavigateToDisease('lymphoid')}
                        className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left"
                    >
                        <div className="h-3 bg-purple-500"></div>
                        <div className="p-6">
                            <div className="text-4xl mb-4">🩸</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Lymphoid Neoplasms</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">Dedicated support and information for ALL and CLL conditions.</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-500 bg-purple-50 px-2.5 py-1 rounded-md">ALL</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-500 bg-purple-50 px-2.5 py-1 rounded-md">CLL</span>
                            </div>
                            <span className="text-purple-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                Explore Resources <span>→</span>
                            </span>
                        </div>
                    </button>

                    {/* Myeloma Card */}
                    <button
                        onClick={() => onNavigateToDisease('myeloma')}
                        className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left"
                    >
                        <div className="h-3 bg-amber-500"></div>
                        <div className="p-6">
                            <div className="text-4xl mb-4">🦴</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">Multiple Myeloma</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">Understanding plasma cell disorders and the latest treatment advances.</p>
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md">MM</span>
                            </div>
                            <span className="text-amber-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                                Explore Resources <span>→</span>
                            </span>
                        </div>
                    </button>
                </div>

                {/* Patient Resources Section */}
                <section className="mt-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-[2.5rem] p-8 border border-purple-100">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="text-5xl mb-4 block">💜</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Patient & Caregiver Resources</h2>
                        <p className="text-gray-700 text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
                            Navigating a leukemia diagnosis and treatment is a challenging journey.
                            We provide clear, accessible resources to help you understand blood production,
                            genetic mutations, transplant procedures, and how to interpret your medical reports.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => onNavigateToLearn('blood-cells')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">🩸</span> Blood Production
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('mutations')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-green-50 hover:text-green-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">🧬</span> Mutations
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('risk')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">📊</span> Risk Assessment
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('transplant')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-purple-50 hover:text-purple-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">🏥</span> Transplants
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('lab-results')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-amber-50 hover:text-amber-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">🔬</span> Test Results
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('clinical-trials')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">🧪</span> Clinical Trials
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('treatments')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-pink-50 hover:text-pink-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">💊</span> Treatments
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('medications')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">🔬</span> Medications
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('history')}
                                className="flex items-center justify-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-amber-50 hover:text-amber-700 transition-colors shadow-sm border border-gray-100"
                            >
                                <span className="text-xl">📜</span> History
                            </button>
                        </div>
                    </div>
                </section>

                {/* AI Tools Promo */}
                <section className="mt-16 bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <svg className="w-64 h-64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#FFFFFF" d="M44.7,-76.4C58.2,-69.2,69.7,-57.4,77.3,-43.8C84.8,-30.2,88.4,-15.1,87.5,-0.5C86.7,14.1,70.8,42.2,59.3,53.4C47.8,64.6,40.7,78.8,30.1,83.3C19.5,87.8,5.4,82.5,-8.1,78.2C-21.6,73.8,-34.5,70.3,-46.8,63C-59.1,55.7,-70.9,44.5,-78.3,31.2C-85.7,17.9,-88.7,2.4,-86,-12.3C-83.3,-27,-74.8,-40.8,-63.9,-49.9C-53,-59,-39.6,-63.4,-27.4,-71.4C-15.1,-79.4,-4.1,-91.1,8.3,-93.8C20.7,-96.5,31.2,-83.7,44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-6">AI-Powered Research for Everyone</h2>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Don't let medical jargon stand in your way. Our suite of AI tools helps you find exactly what you need.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-400 text-xl">✨</div>
                                    <div>
                                        <h4 className="font-bold mb-1">Smart Search</h4>
                                        <p className="text-sm text-gray-400">Ask questions in plain English and find matching articles instantly.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400 text-xl">🧠</div>
                                    <div>
                                        <h4 className="font-bold mb-1">Research Insights</h4>
                                        <p className="text-sm text-gray-400">AI-generated summaries across hundreds of scientific studies.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                onClick={onStartSearch}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105"
                            >
                                Launch Search Tools
                            </button>
                        </div>
                    </div>
                </section>

                {/* Give the Gift of Life - Donor Section */}
                <section className="mt-16 bg-gradient-to-br from-red-50 via-white to-rose-50 rounded-[2.5rem] p-8 border border-red-100">
                    <div className="text-center mb-8">
                        <span className="text-5xl mb-4 block">❤️</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Give the Gift of Life</h2>
                        <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                            Blood cancer patients often rely on bone marrow transplants and blood transfusions to survive.
                            You can make a difference by joining the donor registry or donating blood.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* NMDP Card */}
                        <a
                            href="https://www.nmdp.org/get-involved/join-the-registry"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center text-center"
                        >
                            <img src={nmdpLogo} alt="NMDP - Be The Match" className="h-16 object-contain mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                                Join the Bone Marrow Registry
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                Every 3 minutes, someone is diagnosed with a blood cancer. For many, a bone marrow transplant is their best chance at survival.
                                Joining the registry is simple—just a quick cheek swab.
                            </p>
                            <span className="mt-auto inline-flex items-center gap-2 text-orange-600 font-bold group-hover:gap-3 transition-all">
                                Register Now
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </span>
                        </a>

                        {/* Red Cross Card */}
                        <a
                            href="https://www.redcrossblood.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center text-center"
                        >
                            <img src={redcrossLogo} alt="American Red Cross" className="h-16 object-contain mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                Donate Blood
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                Blood transfusions are critical for patients undergoing chemotherapy and transplant procedures.
                                A single donation can save up to 3 lives.
                            </p>
                            <span className="mt-auto inline-flex items-center gap-2 text-red-600 font-bold group-hover:gap-3 transition-all">
                                Find a Blood Drive
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </span>
                        </a>
                    </div>
                </section>
            </main>

            <footer className="bg-white border-t border-gray-200 py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <img src={bannerImage} alt="LeukemiaLens" className="h-12 object-contain mx-auto mb-8 opacity-50 grayscale" />
                    <p className="text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
                        LeukemiaLens is a free platform dedicated to bridging the gap between scientific research and those who need it most.
                    </p>
                    <div className="flex justify-center gap-8 mb-8">
                        <button onClick={() => onNavigateToPage('about')} className="text-gray-400 hover:text-blue-600 transition-colors font-medium">About</button>
                        <button onClick={() => onNavigateToPage('contact')} className="text-gray-400 hover:text-blue-600 transition-colors font-medium">Contact</button>
                        <button onClick={() => onNavigateToPage('stats')} className="text-gray-400 hover:text-blue-600 transition-colors font-medium">Stats</button>
                    </div>
                    <div className="text-xs text-gray-400">
                        © {new Date().getFullYear()} LeukemiaLens. Built for researchers, clinicians, patients, and caregivers.
                    </div>
                </div>
            </footer>
        </div>
    );
};
