import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from './components';

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

interface TreatmentInfo {
    name: string;
    url: string;
}

interface SubDiseaseInfo {
    abbrev: string;
    name: string;
    description: string;
}

interface DiseaseInfo {
    id: string;
    name: string;
    headerQuestion: string;
    description: string;
    subDiseases: SubDiseaseInfo[];
    treatments: TreatmentInfo[];
    diseases: string[]; // Sub-disease abbreviations for filtering
    clinicalTrialsQuery: string;
}

const DISEASE_GROUPS: Record<string, DiseaseInfo> = {
    myeloid: {
        id: 'myeloid',
        name: 'Myeloid Neoplasms',
        headerQuestion: 'What are Myeloid Neoplasms?',
        description: 'Myeloid neoplasms are a group of cancers that affect the myeloid lineage of blood cells—the cells that normally develop into red blood cells, platelets, and certain white blood cells (neutrophils, monocytes).',
        subDiseases: [
            {
                abbrev: 'AML',
                name: 'Acute Myeloid Leukemia',
                description: 'AML is an aggressive cancer where immature myeloid cells (blasts) multiply rapidly and accumulate in the bone marrow, crowding out normal cells. It requires immediate treatment and can develop on its own or evolve from MDS or MPN.'
            },
            {
                abbrev: 'MDS',
                name: 'Myelodysplastic Syndromes',
                description: 'MDS is characterized by abnormal-looking (dysplastic) blood cells and ineffective blood production. While less aggressive than AML, approximately 30% of MDS cases eventually transform into AML, making careful monitoring essential.'
            },
            {
                abbrev: 'CML',
                name: 'Chronic Myeloid Leukemia',
                description: 'CML is caused by the Philadelphia chromosome (BCR-ABL fusion gene) and progresses through chronic, accelerated, and blast phases. Unlike AML, it often responds well to targeted oral therapies (tyrosine kinase inhibitors) that can control the disease long-term.'
            },
            {
                abbrev: 'MPN',
                name: 'Myeloproliferative Neoplasms',
                description: 'MPNs involve the overproduction of mature blood cells—too many red cells (polycythemia vera), platelets (essential thrombocythemia), or bone marrow scarring (myelofibrosis). While chronic, some MPNs can evolve into AML over time.'
            }
        ],
        treatments: [
            { name: 'Chemotherapy (e.g., 7+3 regimen)', url: 'https://bloodcancerunited.org/blood-cancer/leukemia/acute-myeloid-leukemia-aml/treatment#toc-1' },
            { name: 'Targeted Therapies (e.g., FLT3, IDH inhibitors)', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/drug-therapies' },
            { name: 'Hypomethylating Agents (e.g., Azacitidine)', url: 'https://bloodcancerunited.org/blood-cancer/leukemia/acute-myeloid-leukemia-aml/treatment#toc-1' },
            { name: 'Stem Cell Transplant', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/stem-cell-transplantation' },
            { name: 'Venetoclax combinations', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/drug-therapies' }
        ],
        diseases: ['AML', 'MDS', 'CML', 'MPN'],
        clinicalTrialsQuery: 'Acute Myeloid Leukemia OR Myelodysplastic Syndromes OR Chronic Myeloid Leukemia'
    },
    lymphoid: {
        id: 'lymphoid',
        name: 'Lymphoid Neoplasms',
        headerQuestion: 'What are Lymphoid Neoplasms?',
        description: 'Lymphoid neoplasms affect the lymphoid lineage of blood cells—the cells that develop into B-cells, T-cells, and Natural Killer (NK) cells, which are critical for immune function.',
        subDiseases: [
            {
                abbrev: 'ALL',
                name: 'Acute Lymphoblastic Leukemia',
                description: 'ALL is an aggressive leukemia where immature lymphoid cells (lymphoblasts) multiply rapidly. It\'s the most common childhood cancer but also occurs in adults. Intensive chemotherapy regimens, often lasting 2-3 years, combined with newer therapies like CAR T-cell therapy have dramatically improved outcomes.'
            },
            {
                abbrev: 'CLL',
                name: 'Chronic Lymphocytic Leukemia',
                description: 'CLL is a slower-growing leukemia affecting mature B-cells that accumulate in blood, bone marrow, and lymph nodes. Many patients may not need treatment for years ("watch and wait"), while others require targeted therapies like BTK inhibitors. Unlike ALL, CLL primarily affects older adults.'
            }
        ],
        treatments: [
            { name: 'Intensive Chemotherapy', url: 'https://bloodcancerunited.org/blood-cancer/leukemia/acute-lymphoblastic-leukemia-all/treatment' },
            { name: 'Immunotherapy (e.g., Blinatumomab)', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/immunotherapy' },
            { name: 'CAR T-cell Therapy', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/immunotherapy' },
            { name: 'BTK Inhibitors (for CLL)', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/drug-therapies' },
            { name: 'Stem Cell Transplant', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/stem-cell-transplantation' }
        ],
        diseases: ['ALL', 'CLL'],
        clinicalTrialsQuery: 'Acute Lymphoblastic Leukemia OR Chronic Lymphocytic Leukemia'
    },
    myeloma: {
        id: 'myeloma',
        name: 'Multiple Myeloma',
        headerQuestion: 'What is Multiple Myeloma?',
        description: 'Multiple Myeloma is a cancer of plasma cells—specialized B-cells that produce antibodies. When plasma cells become cancerous, they accumulate in the bone marrow and produce abnormal proteins that can damage organs.',
        subDiseases: [
            {
                abbrev: 'MGUS',
                name: 'Monoclonal Gammopathy of Undetermined Significance',
                description: 'MGUS is a precursor condition where abnormal plasma cells produce a small amount of abnormal protein but don\'t yet cause problems. About 1% of MGUS cases progress to myeloma each year, so regular monitoring is important.'
            },
            {
                abbrev: 'SMM',
                name: 'Smoldering Multiple Myeloma',
                description: 'SMM is an intermediate stage between MGUS and active myeloma. There are more abnormal plasma cells and protein than in MGUS, but no organ damage yet. Some patients remain stable for years; others progress more quickly to active myeloma.'
            },
            {
                abbrev: 'MM',
                name: 'Active Multiple Myeloma',
                description: 'Active myeloma requires treatment when it begins causing "CRAB" symptoms: elevated Calcium, Renal (kidney) problems, Anemia, or Bone lesions. Modern combination therapies have significantly improved survival, and many patients achieve deep remissions.'
            }
        ],
        treatments: [
            { name: 'Proteasome Inhibitors', url: 'https://bloodcancerunited.org/blood-cancer/myeloma/treatment#toc-1' },
            { name: 'Immunomodulatory Drugs', url: 'https://bloodcancerunited.org/blood-cancer/myeloma/treatment#toc-1' },
            { name: 'Monoclonal Antibodies', url: 'https://bloodcancerunited.org/blood-cancer/myeloma/treatment#toc-4' },
            { name: 'Stem Cell Transplant', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/stem-cell-transplantation' },
            { name: 'CAR T-cell Therapy', url: 'https://bloodcancerunited.org/blood-cancer-care/adults/types-blood-cancer-treatment/immunotherapy' }
        ],
        diseases: ['MM'],
        clinicalTrialsQuery: 'Multiple Myeloma'
    }
};

interface DiseasePageProps {
    groupId: string;
    apiBaseUrl: string;
    onNavigateHome: () => void;
    onStartSearch: (disease?: string) => void;
}

export const DiseasePage: React.FC<DiseasePageProps> = ({ groupId, apiBaseUrl, onNavigateHome, onStartSearch }) => {
    const info = DISEASE_GROUPS[groupId];
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoadingNews(true);
                const res = await axios.get(`${apiBaseUrl}/api/news/${info.name}`);
                setNews(res.data);
            } catch (err) {
                console.error('Failed to fetch news', err);
            } finally {
                setLoadingNews(false);
            }
        };

        fetchNews();
    }, [info]);

    if (!info) return <div>Disease Group not found</div>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PageHeader title={info.name} onNavigateHome={onNavigateHome} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-blue-600">ℹ️</span> {info.headerQuestion}
                            </h2>
                            <p className="text-gray-700 text-lg leading-relaxed">
                                {info.description}
                            </p>

                            {/* Sub-disease breakout */}
                            <div className="mt-8 space-y-4">
                                {info.subDiseases.map((sd) => (
                                    <div key={sd.abbrev} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-bold">
                                                {sd.abbrev}
                                            </span>
                                            <h3 className="font-bold text-gray-900">{sd.name}</h3>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {sd.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-green-600">💊</span> Common Treatments
                            </h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {info.treatments.map((t, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={t.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-all group h-full"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors group-hover:bg-green-200">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-gray-800 font-medium group-hover:text-green-800">{t.name}</span>
                                            </div>
                                            <span className="text-gray-400 group-hover:text-green-500 ml-2">→</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="text-indigo-600">🛠️</span> Tools & Focused Research
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100">
                                    <h3 className="font-bold text-indigo-900 mb-2">Scientific Literature</h3>
                                    <p className="text-sm text-indigo-700 mb-4">Search thousands of PubMed articles curated for {info.name}.</p>
                                    <button
                                        onClick={() => onStartSearch(info.diseases[0])}
                                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        Start Scientific Search
                                    </button>
                                </div>
                                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                                    <h3 className="font-bold text-amber-900 mb-2">Clinical Trials</h3>
                                    <p className="text-sm text-amber-700 mb-4">Explore actively recruiting clinical trials for this disease group.</p>
                                    <a
                                        href={`https://clinicaltrials.gov/search?term=${encodeURIComponent(info.clinicalTrialsQuery)}&aggFilters=status:rec`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block w-full text-center bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-amber-700 transition-colors shadow-sm"
                                    >
                                        View Clinical Trials
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="text-red-600">🤝</span> Support & Resources
                            </h2>
                            <div className="space-y-4">
                                <a
                                    href="https://www.lls.org/caregiver-support"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-red-50 hover:border-red-200 border border-transparent transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🆘</span>
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-red-700">LLS Caregiver Support</h4>
                                            <p className="text-sm text-gray-600">Resources and communities for those caring for patients.</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 group-hover:text-red-500">→</span>
                                </a>
                                <a
                                    href="https://www.lls.org/support-resources/financial-support"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-200 border border-transparent transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">💰</span>
                                        <div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-green-700">Financial Assistance</h4>
                                            <p className="text-sm text-gray-600">Help with treatment costs and clinical trial expenses.</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 group-hover:text-green-500">→</span>
                                </a>
                            </div>
                        </section>
                    </div>

                    {/* News Feed */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
                            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span>📰</span> Latest News
                                </h2>
                                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Live</span>
                            </div>
                            <div className="p-6">
                                {loadingNews ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="animate-pulse space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                                <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : news.length > 0 ? (
                                    <div className="space-y-6">
                                        {news.map((item, idx) => (
                                            <article key={idx} className="group cursor-pointer">
                                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                    <h3 className="text-gray-900 font-semibold leading-snug group-hover:text-blue-600 transition-colors mb-1 line-clamp-3">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span className="font-medium text-blue-500">{item.source}</span>
                                                        <span>•</span>
                                                        <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                                                    </div>
                                                </a>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm text-center py-8 italic">No recent news found for this group.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white border-t border-gray-200 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-500 text-sm mb-4">
                        Medical information is provided for educational purposes only. Always consult with a healthcare professional.
                    </p>
                    <div className="flex justify-center gap-6">
                        <button onClick={onNavigateHome} className="text-gray-400 hover:text-blue-600 transition-colors text-sm font-medium">Home</button>
                        <button onClick={() => onStartSearch()} className="text-gray-400 hover:text-blue-600 transition-colors text-sm font-medium">Search Articles</button>
                        <a href="/contact" className="text-gray-400 hover:text-blue-600 transition-colors text-sm font-medium">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
