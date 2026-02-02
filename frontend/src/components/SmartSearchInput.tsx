import { useState } from 'react'
import axios from 'axios'

export interface ParsedFilters {
    q?: string
    mutations?: string[]
    diseases?: string[]
    treatments?: string[]
    tags?: string[]
    yearStart?: string
    yearEnd?: string
    author?: string
    journal?: string
}

export interface SmartQueryResult {
    insightId: string
    filters: ParsedFilters
    articleCount: number
    analyzedCount: number
    originalQuery: string
}

export interface SmartSearchInputProps {
    onApplyFilters: (filters: ParsedFilters) => void
    onAskClaude?: (result: SmartQueryResult) => void
    apiBaseUrl?: string
}

type SearchMode = 'ask' | 'filter'

export function SmartSearchInput({
    onApplyFilters,
    onAskClaude,
    apiBaseUrl = 'https://leukemialens-api.jr-rhinehart.workers.dev'
}: SmartSearchInputProps) {
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [parsedFilters, setParsedFilters] = useState<ParsedFilters | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [mode, setMode] = useState<SearchMode>('ask')
    const [noArticlesMessage, setNoArticlesMessage] = useState<string | null>(null)

    const handleAskClaude = async () => {
        if (!query.trim() || !onAskClaude) return

        setIsLoading(true)
        setError(null)
        setParsedFilters(null)
        setNoArticlesMessage(null)

        try {
            const response = await axios.post(`${apiBaseUrl}/api/smart-query`, {
                query: query.trim()
            })

            if (response.data.success) {
                if (response.data.articleCount === 0) {
                    setNoArticlesMessage(response.data.message || 'No articles found. Try broadening your search.')
                    setParsedFilters(response.data.filters)
                } else {
                    onAskClaude({
                        insightId: response.data.insightId,
                        filters: response.data.filters,
                        articleCount: response.data.articleCount,
                        analyzedCount: response.data.analyzedCount,
                        originalQuery: query.trim()
                    })
                    // Reset after successful submission
                    setQuery('')
                }
            } else {
                setError(response.data.error || 'Failed to process your question')
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to process query. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleParseQuery = async () => {
        if (!query.trim()) return

        setIsLoading(true)
        setError(null)
        setParsedFilters(null)
        setNoArticlesMessage(null)

        try {
            const response = await axios.post(`${apiBaseUrl}/api/parse-query`, {
                query: query.trim()
            })

            if (response.data.success) {
                setParsedFilters(response.data.filters)
            } else {
                setError(response.data.error || 'Failed to parse query')
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to process query. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleApply = () => {
        if (parsedFilters) {
            onApplyFilters(parsedFilters)
            setParsedFilters(null)
            setQuery('')
            setNoArticlesMessage(null)
        }
    }

    const handleCancel = () => {
        setParsedFilters(null)
        setError(null)
        setNoArticlesMessage(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (mode === 'ask' && onAskClaude) {
                handleAskClaude()
            } else {
                handleParseQuery()
            }
        }
    }

    const formatFilterValue = (_key: string, value: any): string => {
        if (Array.isArray(value)) {
            return value.join(', ')
        }
        return String(value)
    }

    const getFilterLabel = (key: string): string => {
        const labels: Record<string, string> = {
            q: 'Search Text',
            mutations: 'Mutations',
            diseases: 'Diseases',
            treatments: 'Treatments',
            tags: 'Topics',
            yearStart: 'From Year',
            yearEnd: 'To Year',
            author: 'Author',
            journal: 'Journal'
        }
        return labels[key] || key
    }

    // We want the component to be always visible and prominent now


    return (
        <div className="bg-white rounded-xl p-6 lg:p-8 border border-gray-200 shadow-lg relative group transition-all">
            <div className="relative z-10">
                {/* Header and Mode Toggle in one row for wide screens */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">Advanced Research Assistant</h2>
                            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Intelligent Search & AI Analysis</p>
                        </div>
                    </div>

                    {onAskClaude && (
                        <div className="flex p-1 bg-gray-50 rounded-lg border border-gray-200 w-full md:w-auto">
                            <button
                                onClick={() => { setMode('ask'); handleCancel(); }}
                                className={`flex-1 md:flex-none px-6 py-2 text-xs font-black uppercase tracking-widest rounded-md transition-all ${mode === 'ask'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                AI Insights
                            </button>
                            <button
                                onClick={() => { setMode('filter'); handleCancel(); }}
                                className={`flex-1 md:flex-none px-6 py-2 text-xs font-black uppercase tracking-widest rounded-md transition-all ${mode === 'filter'
                                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                Filter Search
                            </button>
                        </div>
                    )}
                </div>


                {/* Input with prominent styling */}
                <div className="relative group">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={mode === 'ask'
                            ? "Ask a technical research question..."
                            : "Enter study parameters..."
                        }
                        rows={1}
                        className="w-full pl-5 pr-44 py-5 text-base border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 overflow-hidden resize-none bg-gray-50/30 transition-all font-medium placeholder:text-gray-400"
                        style={{ minHeight: '72px', maxHeight: '200px' }}
                        disabled={isLoading}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />

                    <div className="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2">
                        <button
                            onClick={mode === 'ask' && onAskClaude ? handleAskClaude : handleParseQuery}
                            disabled={isLoading || !query.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all font-bold text-sm disabled:opacity-30 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    {mode === 'ask' ? 'Run AI Analysis' : 'Parse Filters'}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Action Button */}
                <div className="md:hidden mt-3">
                    <button
                        onClick={mode === 'ask' && onAskClaude ? handleAskClaude : handleParseQuery}
                        disabled={isLoading || !query.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white rounded-lg shadow-sm transition-all font-bold text-sm disabled:opacity-30"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3">
                                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Processing...</span>
                            </div>
                        ) : (
                            <>
                                <span>{mode === 'ask' ? 'Run AI Analysis' : 'Parse Filters'}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Removed redundant action button as it's now integrated above */}


            {/* Error */}
            {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
                    {error}
                    <button
                        onClick={() => { setParsedFilters(null); setError(null); setNoArticlesMessage(null); }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* No Articles Found (for Ask mode) */}
            {noArticlesMessage && (
                <div className="mt-3 space-y-3">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800 font-medium">No matching articles found</p>
                        <p className="text-xs text-amber-700 mt-1">{noArticlesMessage}</p>
                    </div>

                    {parsedFilters && Object.keys(parsedFilters).length > 0 && (
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                            <p className="text-xs text-gray-500 mb-2">Detected filters you can adjust:</p>
                            {Object.entries(parsedFilters).map(([key, value]) => (
                                value && (
                                    <div key={key} className="flex items-start gap-2 text-xs">
                                        <span className="font-medium text-gray-600">{getFilterLabel(key)}:</span>
                                        <span className="text-purple-700">{formatFilterValue(key, value)}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}

                    <button
                        onClick={handleCancel}
                        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Parsed Filters Preview (Filter mode) */}
            {parsedFilters && Object.keys(parsedFilters).length > 0 && !noArticlesMessage && (
                <div className="mt-3 space-y-3">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Detected Filters:
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-purple-200 space-y-2">
                        {Object.entries(parsedFilters).map(([key, value]) => (
                            value && (
                                <div key={key} className="flex items-start gap-2 text-sm">
                                    <span className="font-medium text-gray-700 min-w-[80px]">
                                        {getFilterLabel(key)}:
                                    </span>
                                    <span className="text-purple-700">
                                        {formatFilterValue(key, value)}
                                    </span>
                                </div>
                            )
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleApply}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Apply Filters
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Empty result (Filter mode) */}
            {parsedFilters && Object.keys(parsedFilters).length === 0 && !noArticlesMessage && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    No specific filters detected. Try being more specific with your query.
                </div>
            )}
        </div>
    )
}
