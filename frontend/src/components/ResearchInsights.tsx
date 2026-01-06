import { useState } from 'react'
import axios from 'axios'

interface Article {
    title: string
    abstract: string
    pub_date: string
    mutations: string[]
    diseases: string[]
}

export interface ResearchInsightsProps {
    articles: Article[]
    searchQuery?: string
    apiBaseUrl?: string
}

export function ResearchInsights({
    articles,
    searchQuery,
    apiBaseUrl = 'https://leukemialens-api.jr-rhinehart.workers.dev'
}: ResearchInsightsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [articleCount, setArticleCount] = useState(0)
    const [copied, setCopied] = useState(false)

    const handleGetInsights = async () => {
        if (articles.length === 0) {
            setError('No articles to analyze. Try adjusting your filters.')
            setIsOpen(true)
            return
        }

        setIsOpen(true)
        setIsLoading(true)
        setError(null)
        setSummary(null)

        try {
            const response = await axios.post(`${apiBaseUrl}/api/summarize`, {
                articles: articles.map(a => ({
                    title: a.title,
                    abstract: a.abstract,
                    pub_date: a.pub_date,
                    mutations: a.mutations,
                    diseases: a.diseases
                })),
                query: searchQuery
            })

            if (response.data.success) {
                setSummary(response.data.summary)
                setArticleCount(response.data.articleCount)
            } else {
                setError(response.data.error || 'Failed to generate insights')
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate insights. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = async () => {
        if (!summary) return

        try {
            await navigator.clipboard.writeText(summary)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        setSummary(null)
        setError(null)
    }

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={handleGetInsights}
                disabled={articles.length === 0}
                className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
                title={articles.length === 0 ? 'No articles to analyze' : 'Get AI-powered research insights'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                </svg>
                Get Insights
            </button>

            {/* Modal */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[80vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Research Insights</h2>
                                    {summary && (
                                        <p className="text-xs text-gray-500">
                                            Based on {articleCount} of {articles.length} articles
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {summary && (
                                    <button
                                        onClick={handleCopy}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${copied
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        title="Copy to clipboard"
                                    >
                                        {copied ? (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                </svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                                                </svg>
                                                Copy
                                            </>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={handleClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
                                    </div>
                                    <p className="mt-4 text-gray-600 font-medium">Analyzing {Math.min(15, articles.length)} articles...</p>
                                    <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
                                </div>
                            )}

                            {error && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="p-3 bg-red-100 rounded-full mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-900 font-medium">{error}</p>
                                    <button
                                        onClick={handleGetInsights}
                                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}

                            {summary && (
                                <div className="prose prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                        {summary.split('\n').map((line, idx) => {
                                            // Style section headers
                                            if (line.startsWith('## ')) {
                                                return (
                                                    <h3 key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-2 first:mt-0">
                                                        {line.replace('## ', '')}
                                                    </h3>
                                                )
                                            }
                                            // Style bullet points
                                            if (line.startsWith('- ') || line.startsWith('• ')) {
                                                return (
                                                    <p key={idx} className="flex gap-2 mb-2">
                                                        <span className="text-purple-600 flex-shrink-0">•</span>
                                                        <span>{line.replace(/^[-•]\s*/, '')}</span>
                                                    </p>
                                                )
                                            }
                                            // Regular text
                                            if (line.trim()) {
                                                return <p key={idx} className="mb-2">{line}</p>
                                            }
                                            return null
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {summary && (
                            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                                <p className="text-xs text-gray-500 text-center">
                                    AI-generated summary based on article abstracts. Always verify findings with original sources.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </>
    )
}
