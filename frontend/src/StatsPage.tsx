import { useState, useEffect } from 'react'
import axios from 'axios'

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

export const StatsPage = () => {
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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading statistics...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700">{error}</p>
                </div>
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">LeukemiaLens Database Statistics</h1>
                    <p className="text-gray-600">Real-time insights into our research database</p>
                    <p className="text-sm text-gray-500 mt-2">Last updated: {new Date(stats.generated_at).toLocaleString()}</p>
                </div>

                {/* Main Tables Stats */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Main Database</h2>
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
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📖 Reference Tables</h2>
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
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">🔍 Unique Values Found</h2>
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
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 Publication Date Range</h2>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex flex-col md:flex-row justify-around items-center gap-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Oldest Article</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.date_range.oldest_article || 'N/A'}</p>
                            </div>
                            <div className="text-4xl text-gray-300">→</div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Newest Article</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.date_range.newest_article || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-12 text-center">
                    <a
                        href="/"
                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        ← Back to Search
                    </a>
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
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform">
            <div className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    <span className="text-4xl">{icon}</span>
                    <h3 className="text-sm font-medium text-right">{title}</h3>
                </div>
            </div>
            <div className="p-6">
                <p className="text-4xl font-bold text-gray-900 text-center">{value}</p>
            </div>
        </div>
    )
}
