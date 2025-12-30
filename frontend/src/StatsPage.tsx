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

export const StatsPage = ({ onNavigateHome }: { onNavigateHome: () => void }) => {
    const [stats, setStats] = useState<DatabaseStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
