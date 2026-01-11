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

export const StatsPage = ({ onNavigateHome }: { onNavigateHome: () => void }) => {
    const [stats, setStats] = useState<DatabaseStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Coverage widget state
    const [coverage, setCoverage] = useState<CoverageData | null>(null)
    const [coverageLoading, setCoverageLoading] = useState(false)
    const [selectedYear, setSelectedYear] = useState<string>('all')

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
        fetchStats()
    }, [])

    const fetchCoverage = async () => {
        setCoverageLoading(true)
        try {
            const url = selectedYear === 'all'
                ? 'https://leukemialens-api.jr-rhinehart.workers.dev/api/coverage'
                : `https://leukemialens-api.jr-rhinehart.workers.dev/api/coverage?year=${selectedYear}`
            const res = await axios.get(url)
            setCoverage(res.data)
        } catch (err: any) {
            console.error('Coverage fetch error:', err)
        } finally {
            setCoverageLoading(false)
        }
    }

    const getMonthColor = (count: number) => {
        if (count === 0) return 'bg-red-100 text-red-600 border-red-200'
        if (count < 10) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        if (count < 50) return 'bg-blue-100 text-blue-700 border-blue-200'
        return 'bg-green-100 text-green-700 border-green-200'
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
        <div className="min-h-screen flex flex-col bg-gray-100">
            <PageHeader title="Database Statistics" onNavigateHome={onNavigateHome} />

            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Secondary Header */}
                    <div className="text-center mb-12">
                        <p className="text-gray-600 text-lg">Real-time insights into our research database</p>
                        <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(stats.generated_at).toLocaleString()}</p>
                    </div>

                    {/* Main Tables Stats */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span>📚</span> Main Database
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Articles"
                                value={stats.main_tables.studies.toLocaleString()}
                                icon="📄"
                                color="blue"
                            />
                            <StatCard
                                title="Mutation Records"
                                value={stats.main_tables.mutation_records.toLocaleString()}
                                icon="🧬"
                                color="green"
                            />
                            <StatCard
                                title="Study Topics"
                                value={stats.main_tables.topic_records.toLocaleString()}
                                icon="🏷️"
                                color="purple"
                            />
                            <StatCard
                                title="Treatment Records"
                                value={stats.main_tables.treatment_records.toLocaleString()}
                                icon="💊"
                                color="pink"
                            />
                        </div>
                    </div>

                    {/* Ontology Tables Stats */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span>📖</span> Reference Tables
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard
                                title="Disease Types"
                                value={stats.ontology_tables.reference_diseases.toLocaleString()}
                                icon="🦠"
                                color="red"
                            />
                            <StatCard
                                title="Tracked Mutations"
                                value={stats.ontology_tables.reference_mutations.toLocaleString()}
                                icon="🔬"
                                color="indigo"
                            />
                            <StatCard
                                title="Treatment Options"
                                value={stats.ontology_tables.reference_treatments.toLocaleString()}
                                icon="💉"
                                color="teal"
                            />
                        </div>
                    </div>

                    {/* Unique Values */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span>🔍</span> Unique Values Found
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatCard
                                title="Unique Mutations Found"
                                value={stats.unique_values.unique_mutations.toLocaleString()}
                                icon="🧬"
                                color="emerald"
                            />
                            <StatCard
                                title="Unique Topics"
                                value={stats.unique_values.unique_topics.toLocaleString()}
                                icon="📌"
                                color="violet"
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span>📅</span> Publication Date Range
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="flex flex-col md:flex-row justify-around items-center gap-8">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Oldest Article</p>
                                    <p className="text-4xl font-black text-blue-600 tracking-tight">{stats.date_range.oldest_article || 'N/A'}</p>
                                </div>
                                <div className="hidden md:block text-5xl text-gray-200 font-light">→</div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Newest Article</p>
                                    <p className="text-4xl font-black text-blue-600 tracking-tight">{stats.date_range.newest_article || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coverage Explorer */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span>📊</span> Coverage Explorer
                        </h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            {/* Controls */}
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700">Year:</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Years</option>
                                        {Array.from({ length: 30 }, (_, i) => 2025 - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={fetchCoverage}
                                    disabled={coverageLoading}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {coverageLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                            </svg>
                                            Query Coverage
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Results */}
                            {coverage ? (
                                <div className="space-y-6">
                                    {/* Summary */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{coverage.summary.total_articles.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Articles</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{coverage.summary.years_with_data}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Years with Data</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-red-600">{coverage.summary.total_month_gaps}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Month Gaps</p>
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="flex flex-wrap items-center gap-4 text-xs">
                                        <span className="font-medium text-gray-600">Legend:</span>
                                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-100 border border-red-200"></span> No data</span>
                                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></span> 1-9</span>
                                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></span> 10-49</span>
                                        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-100 border border-green-200"></span> 50+</span>
                                    </div>

                                    {/* Coverage Grid */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="py-2 px-3 text-left font-semibold text-gray-700">Year</th>
                                                    <th className="py-2 px-2 text-right font-semibold text-gray-700">Total</th>
                                                    {monthNames.map(m => (
                                                        <th key={m} className="py-2 px-1 text-center font-medium text-gray-500 text-xs">{m}</th>
                                                    ))}
                                                    <th className="py-2 px-3 text-center font-semibold text-gray-700">Gaps</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coverage.coverage.slice(0, 20).map((yearData) => (
                                                    <tr key={yearData.year} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-2 px-3 font-bold text-gray-900">{yearData.year}</td>
                                                        <td className="py-2 px-2 text-right font-medium text-gray-700">{yearData.total.toLocaleString()}</td>
                                                        {Array.from({ length: 12 }, (_, i) => {
                                                            const monthKey = (i + 1).toString().padStart(2, '0')
                                                            const count = yearData.months[monthKey] || 0
                                                            return (
                                                                <td key={monthKey} className="py-2 px-1 text-center">
                                                                    <span className={`inline-block min-w-[2rem] px-1 py-0.5 rounded text-xs font-medium border ${getMonthColor(count)}`}>
                                                                        {count}
                                                                    </span>
                                                                </td>
                                                            )
                                                        })}
                                                        <td className="py-2 px-3 text-center">
                                                            {yearData.gaps.length > 0 ? (
                                                                <span className="text-red-600 font-medium">{yearData.gaps.length}</span>
                                                            ) : (
                                                                <span className="text-green-600">✓</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <p className="text-xs text-gray-400 text-right">
                                        Generated: {new Date(coverage.generated_at).toLocaleString()}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="mb-2">Click "Query Coverage" to view monthly article distribution</p>
                                    <p className="text-sm text-gray-400">This helps identify gaps in database coverage for backfill planning</p>
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
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        pink: 'from-pink-500 to-pink-600',
        red: 'from-red-500 to-red-600',
        indigo: 'from-indigo-500 to-indigo-600',
        teal: 'from-teal-500 to-teal-600',
        emerald: 'from-emerald-500 to-emerald-600',
        violet: 'from-violet-500 to-violet-600'
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all hover:shadow-md">
            <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    <span className="text-3xl">{icon}</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">{title}</h3>
                </div>
            </div>
            <div className="p-8">
                <p className="text-4xl font-black text-gray-900 text-center tracking-tight">{value}</p>
            </div>
        </div>
    )
}
