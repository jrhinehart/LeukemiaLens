import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader } from './components'

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

interface CoverageYear {
    year: string
    total: number
    months: Record<string, number>
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

export const StatsPage = ({ onNavigateHome }: { onNavigateHome: () => void }) => {
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

    const getMonthColor = (count: number) => {
        if (count === 0) return 'bg-red-100 text-red-600 border-red-200'
        if (count < 10) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        if (count < 50) return 'bg-blue-100 text-blue-700 border-blue-200'
        return 'bg-green-100 text-green-700 border-green-200'
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Pagination logic
    const totalPages = coverage ? Math.ceil(coverage.coverage.length / yearsPerPage) : 0
    const paginatedCoverage = coverage
        ? coverage.coverage.slice(currentPage * yearsPerPage, (currentPage + 1) * yearsPerPage)
        : []

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-100">
                <PageHeader title="Database Statistics" onNavigateHome={onNavigateHome} />
                <div className="flex-1 flex items-center justify-center">
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
            <div className="min-h-screen flex flex-col bg-gray-100">
                <PageHeader title="Database Statistics" onNavigateHome={onNavigateHome} />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border border-red-100">
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
                                            ~50-60% of modern leukemia research currently has PMC full-text available.
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
                                    {ragStats.recentlyProcessed.slice(0, 4).map((doc) => (
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
                                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
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
                                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
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
                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                                    <span className="text-gray-400">Heatmap:</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span> 0</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></span> 1-9</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></span> 10-49</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-200"></span> 50+</span>
                                </div>

                                {/* Coverage Grid */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="py-3 px-3 text-left font-bold text-gray-400 uppercase tracking-tighter text-[10px]">Year</th>
                                                <th className="py-3 px-2 text-right font-bold text-gray-400 uppercase tracking-tighter text-[10px]">Count</th>
                                                {monthNames.map(m => (
                                                    <th key={m} className="py-3 px-1 text-center font-bold text-gray-400 uppercase tracking-tighter text-[10px]">{m}</th>
                                                ))}
                                                <th className="py-3 px-3 text-center font-bold text-gray-400 uppercase tracking-tighter text-[10px]">Gaps</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedCoverage.map((yearData) => (
                                                <tr key={yearData.year} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                                    <td className="py-3 px-3 font-black text-gray-900 text-lg">{yearData.year}</td>
                                                    <td className="py-3 px-2 text-right font-bold text-blue-600">{yearData.total.toLocaleString()}</td>
                                                    {Array.from({ length: 12 }, (_, i) => {
                                                        const monthKey = (i + 1).toString().padStart(2, '0')
                                                        const count = yearData.months[monthKey] || 0
                                                        return (
                                                            <td key={monthKey} className="py-3 px-1 text-center">
                                                                <div className={`inline-flex items-center justify-center min-w-[2.25rem] h-7 rounded-md text-[10px] font-bold border ${getMonthColor(count)} shadow-sm`}>
                                                                    {count}
                                                                </div>
                                                            </td>
                                                        )
                                                    })}
                                                    <td className="py-3 px-3 text-center">
                                                        {yearData.gaps.length > 0 ? (
                                                            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-[10px] font-black border border-red-200">
                                                                {yearData.gaps.length}
                                                            </div>
                                                        ) : (
                                                            <span className="text-green-500 font-bold text-lg">✓</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-between items-center py-4 border-t border-gray-50 mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    <span>Showing years {paginatedCoverage[0]?.year} - {paginatedCoverage[paginatedCoverage.length - 1]?.year}</span>
                                    <span>Updated: {new Date(coverage.generated_at).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400 italic">
                                No coverage data available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer / Back Link */}
                <div className="mt-16 text-center border-t border-gray-200 pt-12">
                    <button
                        onClick={onNavigateHome}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <span>←</span> Back to Search
                    </button>
                </div>
            </div>
        </div>
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
