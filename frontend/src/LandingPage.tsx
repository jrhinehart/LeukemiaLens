import React, { useState } from 'react';
import bannerImage from './assets/LL-logo-banner.jpg';

interface LandingPageProps {
    onNavigateToDisease: (id: string) => void;
    onStartSearch: () => void;
    onNavigateToPage: (page: 'about' | 'contact' | 'stats' | 'resources') => void;
    onNavigateToLearn: (topic: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDisease, onStartSearch, onNavigateToPage, onNavigateToLearn }) => {
    const [showBetaBanner, setShowBetaBanner] = useState<boolean>(() => {
        const dismissed = localStorage.getItem('betaBannerDismissed');
        return dismissed !== 'true';
    });

    const dismissBetaBanner = () => {
        setShowBetaBanner(false);
        localStorage.setItem('betaBannerDismissed', 'true');
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
            {/* Hero Section */}
            <header className="relative bg-gradient-to-r from-blue-950 via-blue-700 to-blue-500 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                    </svg>
                </div>

                {/* Beta Overlay Banner */}
                {showBetaBanner && (
                    <div className="absolute top-4 right-4 z-30 max-w-xs md:max-w-sm bg-white/90 backdrop-blur-xl border border-blue-200 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <button
                            onClick={dismissBetaBanner}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="flex gap-3">
                            <span className="text-xl">🧪</span>
                            <div className="text-left">
                                <h3 className="text-gray-900 font-bold text-sm mb-1">Welcome to LeukemiaLens Beta!</h3>
                                <p className="text-gray-600 text-xs leading-relaxed">
                                    Our database now contains over <strong className="text-blue-700">12,000+ research articles</strong> with full 2025 coverage ingested.
                                    Visit the <button onClick={() => onNavigateToPage('stats')} className="text-blue-600 underline font-medium hover:text-blue-800">Stats</button> page for details.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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

                {/* For Newly Diagnosed Patients */}
                <section className="mt-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-[2.5rem] p-8 border border-purple-100">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-5xl mb-4 block">💜</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">For Newly Diagnosed Patients</h2>
                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                            Navigating a new diagnosis is a challenging time for patients, as well as family and friends.
                            Blood production is also more complicated than many people think, so here are some resources to
                            learn more about how hematopoiesis works, and some of the language you will hear in discussing
                            blood cancers with your medical providers.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <button
                                onClick={() => onNavigateToLearn('blood-cells')}
                                className="flex items-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-purple-100 hover:text-purple-800 transition-colors shadow-sm border border-gray-200"
                            >
                                <span className="text-xl">🩸</span> Blood Cell Production
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('mutations')}
                                className="flex items-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-purple-100 hover:text-purple-800 transition-colors shadow-sm border border-gray-200"
                            >
                                <span className="text-xl">🧬</span> Mutations
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('risk')}
                                className="flex items-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-purple-100 hover:text-purple-800 transition-colors shadow-sm border border-gray-200"
                            >
                                <span className="text-xl">📊</span> Risk Stratification
                            </button>
                            <button
                                onClick={() => onNavigateToLearn('transplant')}
                                className="flex items-center gap-2 bg-white text-gray-800 px-5 py-3 rounded-xl font-semibold hover:bg-purple-100 hover:text-purple-800 transition-colors shadow-sm border border-gray-200"
                            >
                                <span className="text-xl">🏥</span> Stem Cell Transplants
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
