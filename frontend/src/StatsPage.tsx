import { useState, useEffect } from 'react'
import axios from 'axios'
import architectureDiagram from './assets/architecture_diagram_v4.png'


interface DatabaseStats {
    main_tables: {
        studies: number
        mutation_records: number
        topic_records: number
        treatment_records: number
    }
    ontology_tables: {
        reference_diseases: number
        reference_mutations: number
        reference_treatments: number
    }
    unique_values: {
        unique_mutations: number
        unique_topics: number
    }
    date_range: {
        oldest_article: string | null
        newest_article: string | null
    }
    generated_at: string
}

interface CoverageMonth {
    pubmed: number
    tagged: number
    rag: number
}

interface CoverageYear {
    year: string
    total: number
    months: Record<string, CoverageMonth>
    gaps: string[]
}

interface CoverageData {
    summary: {
        total_articles: number
        years_with_data: number
        total_month_gaps: number
    }
    coverage: CoverageYear[]
    generated_at: string
}

interface RAGStats {
    totalDocuments: number
    readyDocuments: number
    totalChunks: number
    totalStudies: number
    ragCoveragePercent: number
    byFormat: Record<string, number>
    recentlyProcessed: Array<{
        id: string
        pmcid: string
        filename: string
        format: string
        chunkCount: number
        processedAt: string
        title?: string
    }>
    generatedAt: string
}

export const StatsPage = () => {
    const [stats, setStats] = useState<DatabaseStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Coverage widget state
    const [coverage, setCoverage] = useState<CoverageData | null>(null)
    const [coverageLoading, setCoverageLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(0)
    const yearsPerPage = 5

    // RAG stats state
    const [ragStats, setRagStats] = useState<RAGStats | null>(null)
    const [hoveredMonth, setHoveredMonth] = useState<{
        year: string,
        month: string,
        data: CoverageMonth,
        x: number,
        y: number
    } | null>(null)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('https://leukemialens-api.jr-rhinehart.workers.dev/api/database-stats')
                setStats(res.data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        const fetchAllCoverage = async () => {
            setCoverageLoading(true)
            try {
                const res = await axios.get('https://leukemialens-api.jr-rhinehart.workers.dev/api/coverage')
                // Ensure years are sorted descending
                if (res.data.coverage) {
                    res.data.coverage.sort((a: any, b: any) => parseInt(b.year) - parseInt(a.year))
                }
                setCoverage(res.data)
            } catch (err: any) {
                console.error('Coverage fetch error:', err)
            } finally {
                setCoverageLoading(false)
            }
        }

        const fetchRAGStats = async () => {
            try {
                const res = await axios.get('https://leukemialens-api.jr-rhinehart.workers.dev/api/rag/stats')
                setRagStats(res.data)
            } catch (err: any) {
                console.error('RAG stats fetch error:', err)
            }
        }

        fetchStats()
        fetchAllCoverage()
        fetchRAGStats()
    }, [])

    const getMonthColor = (data: CoverageMonth) => {
        if (!data || data.pubmed === 0) {
            return data?.tagged > 0 ? 'bg-blue-200 text-blue-900 border-blue-300' : 'bg-gray-100 border-gray-200'
        }

        const coveragePercent = (data.tagged / data.pubmed) * 100

        if (coveragePercent === 0) return 'bg-gray-100 text-gray-500 border-gray-200'
        if (coveragePercent < 50) return 'bg-red-200 text-red-900 border-red-300'
        if (coveragePercent < 75) return 'bg-amber-200 text-amber-950 border-amber-300'
        return 'bg-emerald-300 text-emerald-950 border-emerald-400 shadow-sm'
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Pagination logic
    const totalPages = coverage ? Math.ceil(coverage.coverage.length / yearsPerPage) : 0
    const paginatedCoverage = coverage
        ? coverage.coverage.slice(currentPage * yearsPerPage, (currentPage + 1) * yearsPerPage)
        : []

    if (loading) {
        return (
            <div className="py-6">
                <div className="flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading statistics...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
                            <span>⚠️</span> Error
                        </h2>
                        <p className="text-gray-700">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="py-6">
            <div className="max-w-7xl mx-auto">
                {/* Secondary Header */}
                <div className="text-center mb-12">
                    <p className="text-gray-600 text-lg">Real-time insights into our research database</p>
                    <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(stats.generated_at).toLocaleString()}</p>
                </div>

                {/* Compact Metrics Grid */}
                <div className="mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <StatCard
                            title="Articles"
                            value={stats.main_tables.studies.toLocaleString()}
                            icon="📄"
                            color="blue"
                        />
                        <StatCard
                            title="Mutations"
                            value={stats.main_tables.mutation_records.toLocaleString()}
                            icon="🧬"
                            color="green"
                        />
                        <StatCard
                            title="Topics"
                            value={stats.main_tables.topic_records.toLocaleString()}
                            icon="🏷️"
                            color="purple"
                        />
                        <StatCard
                            title="AI Ready"
                            value={ragStats?.readyDocuments.toLocaleString() || '0'}
                            icon="🤖"
                            color="blue"
                        />
                        <StatCard
                            title="Diseases"
                            value={stats.ontology_tables.reference_diseases.toLocaleString()}
                            icon="🦠"
                            color="red"
                        />
                        <StatCard
                            title="Treatments"
                            value={stats.ontology_tables.reference_treatments.toLocaleString()}
                            icon="💊"
                            color="pink"
                        />
                    </div>
                </div>

                {/* System Architecture Diagram */}
                <div className="mb-12">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span>🏗️</span> System Architecture
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                A high-level overview of the LeukemiaLens data pipeline and technology stack.
                            </p>
                        </div>
                        <div className="p-4 sm:p-8 bg-blue-50/30 flex justify-center">
                            <img
                                src={architectureDiagram}
                                alt="System Architecture Diagram"
                                className="max-w-full h-auto rounded-lg shadow-xl border border-blue-100"
                            />
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50/30">
                            <div>
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">1. Daily Ingest</h4>
                                <p className="text-xs text-gray-600 font-medium">Cloudflare Workers pull daily metadata from PubMed (NCBI) for real-time tracking.</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">2. Historical Processing</h4>
                                <p className="text-xs text-gray-600 font-medium">Local backfill scripts handle deep embedding and vectorization of historical research stacks.</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">3. AI Engine</h4>
                                <p className="text-xs text-gray-600 font-medium">Anthropic's Claude 3.5 Sonnet performs deep synthesis and citation-backed reasoning.</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">4. Analytics</h4>
                                <p className="text-xs text-gray-600 font-medium">Real-time metrics tracking and coverage monitoring across the entire database.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Educational Context: RAG Explained */}
                <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-xl">🤖</div>
                            <h2 className="text-xl font-bold text-gray-900">What is a RAG Pipeline?</h2>
                        </div>
                        <div className="prose prose-sm text-gray-600 space-y-3">
                            <p>
                                <strong>Retrieval-Augmented Generation (RAG)</strong> is the architecture that powers LeukemiaLens's "Smart Search." Instead of relying on a model's static training data, RAG allows the AI to first <em>retrieve</em> specific, peer-reviewed articles matching your query and then <em>generate</em> an answer based strictly on those sources.
                            </p>
                            <p>
                                This ensures that citations are real, hallucinations are minimized, and insights are grounded in the most current hematology research.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">🚀</div>
                            <h2 className="text-xl font-bold text-gray-900">Why this matters</h2>
                        </div>
                        <div className="prose prose-sm text-gray-600 space-y-3">
                            <p>
                                By utilizing a serverless RAG pipeline, LeukemiaLens can leverage <strong>Anthropic-hosted Claude</strong>—giving us immediate access to newest frontier models while maintaining low infrastructure costs.
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Accuracy:</strong> Access to Claude's industry-leading reasoning and medical analysis.</li>
                                <li><strong>Speed:</strong> Real-time processing on the edge with no server management.</li>
                                <li><strong>Scalability:</strong> Able to analyze 30+ full-text articles in parallel for deep synthesis.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Date Range & Insights */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Coverage Timeline</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Oldest</span>
                                    <span className="text-2xl font-black text-blue-600 tracking-tighter">{stats.date_range.oldest_article || 'N/A'}</span>
                                </div>
                                <div className="h-1 bg-gray-100 rounded-full relative">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full"></div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Newest</span>
                                    <span className="text-2xl font-black text-blue-600 tracking-tighter">{stats.date_range.newest_article || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ontology Density</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Unique Mutations</p>
                                    <p className="text-xl font-black text-gray-800">{stats.unique_values.unique_mutations.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Unique Topics</p>
                                    <p className="text-xl font-black text-gray-800">{stats.unique_values.unique_topics.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 & 3: RAG & Coverage Progress */}
                    <div className="lg:col-span-2 space-y-8">
                        {ragStats && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">RAG Engine Stats</h3>
                                        <p className="text-lg font-black text-gray-800">
                                            {ragStats.ragCoveragePercent}% Research Analyzed
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase">PDF: {ragStats.byFormat.pdf || 0}</div>
                                        <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase">XML: {ragStats.byFormat.xml || 0}</div>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                        style={{ width: `${ragStats.ragCoveragePercent}%` }}
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-gray-50 pt-4">
                                    <div>
                                        <p className="text-lg font-black text-gray-800">{ragStats.readyDocuments.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Docs Ready</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-gray-800">{ragStats.totalChunks.toLocaleString()}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">AI Chunks</p>
                                    </div>
                                    <div className="col-span-2 text-left md:text-right">
                                        <p className="text-[10px] text-gray-500 italic leading-tight">
                                            <strong>Note on Coverage:</strong> The "Research Analyzed" metric represents articles where we have successfully retrieved full-text content. While we track metadata for all articles, full-text access is limited to Open Access journals and those indexed by PMC. Realistically, this will never reach 100% due to publisher paywalls.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recently Processed - Compact */}
                        {ragStats && ragStats.recentlyProcessed.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Latest AI Vectorization</h3>
                                <div className="divide-y divide-gray-50">
                                    {ragStats.recentlyProcessed.slice(0, 4).map((doc: any) => (
                                        <div key={doc.id} className="py-2 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center text-sm ${doc.format === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {doc.format === 'pdf' ? '📕' : '📘'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 truncate">{doc.title || doc.filename}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black">{doc.pmcid}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <span className="text-[10px] font-black text-blue-600 block">{doc.chunkCount} Chunks</span>
                                                <span className="text-[9px] text-gray-400 uppercase">{doc.processedAt ? new Date(doc.processedAt).toLocaleDateString() : ''}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-12" />


                {/* Coverage Explorer */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span>📊</span> Coverage Explorer
                    </h2>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        {/* Controls moved inside the results section below */}

                        {/* Results */}
                        {coverageLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-500 text-sm italic">Analyzing monthly article coverage...</p>
                            </div>
                        ) : coverage ? (
                            <div className="space-y-6">
                                {/* Summary & Pagination Header */}
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-6">
                                    <div className="flex gap-8">
                                        <div className="text-center md:text-left">
                                            <p className="text-xl font-bold text-blue-600">{coverage.summary.total_articles.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Articles</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-xl font-bold text-green-600">{coverage.summary.years_with_data}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Years Active</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-xl font-bold text-red-600">{coverage.summary.total_month_gaps}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Gaps</p>
                                        </div>
                                    </div>

                                    {/* Pagination Controls */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setCurrentPage((p: number) => Math.max(0, p - 1))}
                                            disabled={currentPage === 0}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                            </svg>
                                        </button>
                                        <span className="text-sm font-medium text-gray-600 min-w-[100px] text-center">
                                            Page {currentPage + 1} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((p: number) => Math.min(totalPages - 1, p + 1))}
                                            disabled={currentPage === totalPages - 1}
                                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span>Heatmap:</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-50 border border-gray-200"></span> 0%</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-200 border border-red-300"></span> {'<'}50%</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-200 border border-amber-300"></span> 50-75%</span>
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-300 border border-emerald-400"></span> {'>'}75%</span>
                                    <span className="flex items-center gap-1.5 ml-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> RAG Ready</span>
                                </div>

                                {/* Coverage Grid */}
                                <div className="overflow-x-auto relative">
                                    {/* Hover Tooltip */}
                                    {hoveredMonth && (
                                        <div
                                            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-4 px-4 py-3 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-blue-100 min-w-[200px]"
                                            style={{ left: hoveredMonth.x, top: hoveredMonth.y - 12 }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                    {monthNames[parseInt(hoveredMonth.month) - 1] || 'Month'} {hoveredMonth.year}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    {hoveredMonth.data?.pubmed ? Math.round((hoveredMonth.data.tagged / hoveredMonth.data.pubmed) * 100) : 0}% Coverage
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">PubMed Volume</span>
                                                    <span className="text-xs font-bold text-gray-900">{(hoveredMonth.data?.pubmed || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">Tagged & Structured</span>
                                                    <span className="text-xs font-bold text-emerald-600">{(hoveredMonth.data?.tagged || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">RAG Processed</span>
                                                    <span className="text-xs font-bold text-blue-600">{(hoveredMonth.data?.rag || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-gray-50">
                                                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                                    <div
                                                        className="bg-emerald-500 h-full transition-all duration-500"
                                                        style={{ width: `${Math.min(100, (hoveredMonth.data?.pubmed ? (hoveredMonth.data.tagged / hoveredMonth.data.pubmed) * 100 : 0))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="p-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Year</th>
                                                {monthNames.map((m) => (
                                                    <th key={m} className="p-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{m}</th>
                                                ))}
                                                <th className="p-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {paginatedCoverage.map((y) => (
                                                <tr key={y.year} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-3 font-bold text-gray-900 text-sm">{y.year}</td>
                                                    {Object.entries(y.months).map(([m, data]) => (
                                                        <td key={m} className="p-1 text-center">
                                                            <div
                                                                onMouseEnter={(e) => {
                                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                                    setHoveredMonth({
                                                                        year: y.year,
                                                                        month: m,
                                                                        data: { ...data } as CoverageMonth,
                                                                        x: rect.left + rect.width / 2,
                                                                        y: rect.top
                                                                    });
                                                                }}
                                                                onMouseLeave={() => setHoveredMonth(null)}
                                                                className={`
                                                                    h-8 w-full rounded-md border text-[10px] font-black 
                                                                    flex flex-col items-center justify-center transition-all duration-150
                                                                    cursor-help relative overflow-hidden
                                                                    ${getMonthColor(data as CoverageMonth)}
                                                                `}
                                                            >
                                                                {((data as CoverageMonth).pubmed || 0) > 0 ? (
                                                                    <span className="relative z-10 text-gray-950/90 drop-shadow-sm">
                                                                        {Math.round(((data as CoverageMonth).tagged / (data as CoverageMonth).pubmed) * 100)}%
                                                                    </span>
                                                                ) : ((data as CoverageMonth).tagged || 0) > 0 ? (
                                                                    <span className="relative z-10 text-gray-950/90">{(data as CoverageMonth).tagged}</span>
                                                                ) : null}
                                                                {(data as CoverageMonth).rag > 0 && (
                                                                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-white/50 shadow-sm z-20" />
                                                                )}
                                                            </div>
                                                        </td>
                                                    ))}
                                                    <td className="p-3 text-right">
                                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600">
                                                            {y.total.toLocaleString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-between items-center py-4 border-t border-gray-50 mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <span>Showing years {paginatedCoverage[0]?.year} - {paginatedCoverage[paginatedCoverage.length - 1]?.year}</span>
                                    <span>Updated: {coverage ? new Date(coverage.generated_at).toLocaleTimeString() : '...'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400 italic">
                                No coverage data available.
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    )
}

interface StatCardProps {
    title: string
    value: string
    icon: string
    color: string
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
    const colorDots = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        pink: 'bg-pink-500',
        red: 'bg-red-500',
        indigo: 'bg-indigo-500',
        teal: 'bg-teal-500',
        emerald: 'bg-emerald-500',
        violet: 'bg-violet-500'
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 transition-all hover:shadow-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-50 border border-gray-100 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight truncate">{title}</p>
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${colorDots[color as keyof typeof colorDots]} shrink-0`} />
                    <p className="text-lg font-black text-gray-900 tracking-tighter truncate">{value}</p>
                </div>
            </div>
        </div>
    )
}
