import React, { useState, useEffect } from 'react'
import axios from 'axios'

// Types
interface Article {
    title: string
    abstract: string
    pub_date: string
    mutations: string[]
    diseases: string[]
    pubmed_id?: string
    authors?: string
    journal?: string
    url?: string
}

interface AnalyzedArticle {
    num: number
    title: string
    year: string
    url?: string
    hasFullText?: boolean
    authors?: string
    journal?: string
    pubDate?: string
    pmid?: string
}

interface InsightEntry {
    id: string
    backendId?: string
    timestamp: number
    filterSummary: string
    summary: string
    analyzedArticles: AnalyzedArticle[]
    articleCount: number
    totalArticles: number
    isRagEnhanced?: boolean
    fullTextDocCount?: number
    modelUsed?: string
    chatHistory?: Message[]
}

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export interface ResearchInsightsProps {
    articles: Article[]
    searchQuery?: string
    apiBaseUrl?: string
    selectedFilters?: {
        mutations?: string[]
        diseases?: string[]
        treatments?: string[]
        tags?: string[]
    }
    isOpen: boolean
    onToggleOpen: () => void
    // New props for Smart Search integration
    initialInsightId?: string | null
    initialQuestion?: string | null
    initialArticleCount?: number
    onClearInitial?: () => void
}

// localStorage helpers
const STORAGE_KEY = 'leukemialens_insights_history'
const MAX_ENTRIES = 20
const EXPIRY_DAYS = 7

function loadHistory(): InsightEntry[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) return []
        const entries: InsightEntry[] = JSON.parse(data)
        // Filter out expired entries
        const now = Date.now()
        const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000
        return entries.filter(e => now - e.timestamp < expiryMs)
    } catch {
        return []
    }
}

function saveHistory(entries: InsightEntry[]) {
    try {
        // Keep only the most recent entries
        const trimmed = entries.slice(0, MAX_ENTRIES)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    } catch (e) {
        console.error('Failed to save insights history:', e)
    }
}

function generateFilterSummary(
    searchQuery?: string,
    filters?: { mutations?: string[], diseases?: string[], treatments?: string[], tags?: string[] }
): string {
    const parts: string[] = []
    if (filters?.mutations?.length) parts.push(filters.mutations.slice(0, 3).join(', '))
    if (filters?.diseases?.length) parts.push(filters.diseases.slice(0, 2).join(', '))
    if (filters?.treatments?.length) parts.push(filters.treatments.slice(0, 2).join(', '))
    if (filters?.tags?.length) parts.push(filters.tags.slice(0, 2).join(', '))
    if (searchQuery) parts.push(`"${searchQuery}"`)
    return parts.join(' + ') || 'All articles'
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function ResearchInsights({
    articles,
    searchQuery,
    selectedFilters,
    isOpen,
    onToggleOpen,
    apiBaseUrl = 'https://leukemialens-api.jr-rhinehart.workers.dev',
    initialInsightId,
    initialQuestion,
    initialArticleCount,
    onClearInitial
}: ResearchInsightsProps) {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)
    const [analyzedArticles, setAnalyzedArticles] = useState<AnalyzedArticle[]>([])
    const [error, setError] = useState<string | null>(null)
    const [articleCount, setArticleCount] = useState(0)
    const [copied, setCopied] = useState(false)
    const [showArticleList, setShowArticleList] = useState(false)
    const [history, setHistory] = useState<InsightEntry[]>([])
    const [viewingHistoryEntry, setViewingHistoryEntry] = useState<InsightEntry | null>(null)
    const [isCached, setIsCached] = useState(false)
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false)
    const [isRagEnhanced, setIsRagEnhanced] = useState(false)
    const [fullTextDocCount, setFullTextDocCount] = useState(0)
    const [modelUsed, setModelUsed] = useState<string | null>(null)

    // Follow-up chat state
    const [chatMessages, setChatMessages] = useState<Message[]>([])
    const [chatInput, setChatInput] = useState('')
    const [isChatLoading, setIsChatLoading] = useState(false)
    const [backendId, setBackendId] = useState<string | null>(null)
    const [activePollId, setActivePollId] = useState<string | null>(null)

    // Smart Search question display
    const [userQuestion, setUserQuestion] = useState<string | null>(null)
    const [totalArticlesToProcess, setTotalArticlesToProcess] = useState(30)

    // Load history on mount
    useEffect(() => {
        setHistory(loadHistory())
    }, [])

    // Persist history whenever it changes
    useEffect(() => {
        if (history.length > 0) {
            saveHistory(history)
        }
    }, [history])

    // Handle Smart Search initial insight
    useEffect(() => {
        if (initialInsightId && initialQuestion && isOpen) {
            // Reset state for new Smart Search query
            setIsLoading(true)
            setError(null)
            setSummary(null)
            setAnalyzedArticles([])
            setViewingHistoryEntry(null)
            setIsCached(false)
            setIsRagEnhanced(false)
            setFullTextDocCount(0)
            setChatMessages([])
            setChatInput('')
            setBackendId(null)
            setModelUsed(null)
            setUserQuestion(initialQuestion)
            setActivePollId(initialInsightId)
            const count = initialArticleCount || 30
            setTotalArticlesToProcess(count)

            // Start polling for the insight
            pollInsightStatus(initialInsightId, count)

            // Clear the initial props
            onClearInitial?.()
        }
    }, [initialInsightId, initialQuestion, isOpen])

    const pollInsightStatus = async (id: string, totalArticles: number) => {
        setIsLoading(true)
        setError(null)
        setActivePollId(id)
        setTotalArticlesToProcess(totalArticles)
        let attempts = 0
        const maxAttempts = 120 // 4 minutes total (2s intervals)

        const interval = setInterval(async () => {
            attempts++
            if (attempts > maxAttempts) {
                clearInterval(interval)
                setError('Technical request timed out. High-depth reports may take longer during peak times. You can check again in a few minutes via History.')
                setIsLoading(false)
                return
            }

            try {
                const response = await axios.get(`${apiBaseUrl}/api/insights/${id}`)
                if (response.data.success) {
                    const insight = response.data.insight
                    if (insight.status === 'completed') {
                        clearInterval(interval)
                        setSummary(insight.summary)
                        setArticleCount(insight.article_count)
                        const analyzed = JSON.parse(insight.analyzed_articles_json || '[]')
                        setAnalyzedArticles(analyzed)
                        setIsRagEnhanced(insight.is_rag_enhanced || false)
                        setFullTextDocCount(insight.full_text_count || 0)
                        setModelUsed(insight.model_used || null)
                        setBackendId(id)

                        // Update local history
                        const newEntry: InsightEntry = {
                            id: generateId(),
                            backendId: id,
                            timestamp: Date.now(),
                            filterSummary: generateFilterSummary(searchQuery, selectedFilters),
                            summary: insight.summary,
                            analyzedArticles: analyzed,
                            articleCount: insight.article_count,
                            totalArticles: totalArticles,
                            isRagEnhanced: insight.is_rag_enhanced,
                            fullTextDocCount: insight.full_text_count,
                            modelUsed: insight.model_used,
                            chatHistory: []
                        }
                        setHistory(prev => [newEntry, ...prev.slice(0, 19)])
                        setIsLoading(false)
                    } else if (insight.status === 'error') {
                        clearInterval(interval)
                        const serverError = insight.error || 'The technical analysis encountered an error.'
                        setError(`Analysis failed: ${serverError} `)
                        setIsLoading(false)
                    }
                }
            } catch (err: any) {
                console.error('Polling error:', err)
                // If it's a 4xx error (not found yet etc), we might want to keep polling
                // but if it's a 500 or connection refused, we should eventually bail.
                if (err.response?.status === 500) {
                    clearInterval(interval)
                    setError(`Server error during status check: ${err.response?.data?.error || err.message} `)
                    setIsLoading(false)
                }
            }
        }, 2000)
    }

    const handleRetryPoll = () => {
        if (activePollId) {
            pollInsightStatus(activePollId, totalArticlesToProcess)
        } else {
            handleGetInsights()
        }
    }

    const handleGetInsights = async () => {
        if (articles.length === 0) {
            setError('No articles to analyze. Try adjusting your filters.')
            if (!isOpen) onToggleOpen()
            return
        }

        onToggleOpen()
        setIsLoading(true)
        setError(null)
        setAnalyzedArticles([])
        setViewingHistoryEntry(null)
        setIsCached(false)
        setIsRagEnhanced(false)
        setFullTextDocCount(0)
        setChatMessages([])
        setChatInput('')
        setBackendId(null)
        setModelUsed(null)

        const maxArticles = 30
        const articlesToAnalyze = articles.slice(0, maxArticles).map((a) => ({
            title: a.title,
            abstract: a.abstract,
            pub_date: a.pub_date,
            mutations: Array.isArray(a.mutations) ? a.mutations : [],
            diseases: Array.isArray(a.diseases) ? a.diseases : [],
            pubmed_id: a.pubmed_id
        }))

        try {
            const response = await axios.post(`${apiBaseUrl}/api/summarize`, {
                articles: articlesToAnalyze,
                query: userQuestion || searchQuery, // Prioritize the conversational question
                filter_summary: generateFilterSummary(searchQuery, selectedFilters)
            })

            if (response.data.success && response.data.insightId) {
                if (response.data.status === 'processing') {
                    // Start polling
                    pollInsightStatus(response.data.insightId, articles.length)
                } else if (response.data.summary) {
                    // Immediate response (unlikely with new Map-Reduce)
                    setSummary(response.data.summary)
                    setIsLoading(false)
                    setBackendId(response.data.insightId)
                }
            } else {
                setError(response.data.error || 'Failed to initiate insights analysis. Please try again.')
                setIsLoading(false)
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to start analysis. The server might be busy.'
            setError(`Request failed: ${errorMsg} `)
            setIsLoading(false)
        }
    }

    const handleSendFollowUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!chatInput.trim() || isChatLoading) return

        const userMessage = chatInput.trim()
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setChatInput('')
        setIsChatLoading(true)

        try {
            // Use the RAG query endpoint
            const response = await axios.post(`${apiBaseUrl}/api/rag/query`, {
                query: userMessage,
                topK: 15
            })

            if (response.data.answer) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }])
            } else {
                setChatMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an error while searching the research database. Please try again.' }])
            }
        } catch (err: any) {
            console.error('Follow-up error:', err)
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I failed to connect to the research database. Please try again later.' }])
        } finally {
            setIsChatLoading(false)
        }
    }

    const handleViewHistoryEntry = (entry: InsightEntry) => {
        setViewingHistoryEntry(entry)
        setSummary(entry.summary)
        setAnalyzedArticles(entry.analyzedArticles)
        setArticleCount(entry.articleCount)
        setIsRagEnhanced(entry.isRagEnhanced || false)
        setFullTextDocCount(entry.fullTextDocCount || 0)
        setBackendId(entry.backendId || null)
        setError(null)
        setIsCached(true)
        setIsHistoryOpen(false)
        if (!isOpen) onToggleOpen()
        setChatMessages(entry.chatHistory || [])
        setChatInput('')
        setModelUsed(entry.modelUsed || null)
    }

    const handleClearHistory = () => {
        setHistory([])
        localStorage.removeItem(STORAGE_KEY)
    }

    const handleExport = (type: 'combined' | 'csv' | 'copy') => {
        if (!summary) return
        setIsExportMenuOpen(false)

        if (type === 'copy') {
            handleCopy()
            return
        }

        if (type === 'csv') {
            handleExportCSVOnly()
            return
        }

        const filterSummary = viewingHistoryEntry?.filterSummary || generateFilterSummary(searchQuery, selectedFilters)
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

        let content = `LEUKEMIALENS RESEARCH INSIGHTS\nGenerated: ${date} \nInsight ID: ${backendId || 'Local-only'} \nQuery: ${filterSummary} \n\n${'─'.repeat(50)} \nINSIGHTS SUMMARY\n${'─'.repeat(50)} \n\n${summary} \n\n${'─'.repeat(50)} \nARTICLES ANALYZED(${analyzedArticles.length}) \n${'─'.repeat(50)} \n`
        analyzedArticles.forEach(a => {
            content += `#${a.num}: ${a.title} (${a.year}) \n`
        })

        content += `\n${'─'.repeat(50)} \n` + `FULL ARTICLE DATA(CSV FORMAT) \n` + `${'─'.repeat(50)} \n` + `PMID, Title, Authors, Journal, PubDate, Mutations, Diseases\n`
        articles.slice(0, 50).forEach(a => {
            const row = [
                a.pubmed_id || '',
                `"${(a.title || '').replace(/"/g, '""')}"`,
                `"${(a.authors || '').replace(/"/g, '""')}"`,
                `"${(a.journal || '').replace(/"/g, '""')}"`,
                a.pub_date || '',
                `"${(a.mutations || []).join(', ')}"`,
                `"${(a.diseases || []).join(', ')}"`
            ]
            content += row.join(',') + '\n'
        })

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `leukemialens-insights-${Date.now()}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handleExportCSVOnly = () => {
        let csv = 'PMID,Title,Authors,Journal,PubDate,Mutations,Diseases,Link\n'
        articles.forEach(a => {
            const pmid = a.pubmed_id || ''
            const link = pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid.replace('PMID:', '')}/` : ''
            const row = [
                pmid,
                `"${(a.title || '').replace(/"/g, '""')}"`,
                `"${(a.authors || '').replace(/"/g, '""')}"`,
                `"${(a.journal || '').replace(/"/g, '""')}"`,
                a.pub_date || '',
                `"${(a.mutations || []).join(', ')}"`,
                `"${(a.diseases || []).join(', ')}"`,
                link
            ]
            csv += row.join(',') + '\n'
        })

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `leukemialens-articles-${Date.now()}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handleCopy = async () => {
        if (!summary) return

        let textToCopy = summary
        if (analyzedArticles.length > 0) {
            textToCopy += '\n\n---\nArticles Analyzed:\n'
            analyzedArticles.forEach(a => {
                textToCopy += `#${a.num}: ${a.title} (${a.year})\n`
            })
        }

        if (backendId) {
            textToCopy += `\n\nReference ID: ${backendId}`
        }

        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleShareLink = async () => {
        if (!backendId) return
        const shareUrl = `${window.location.origin}/insights/${backendId}`
        try {
            await navigator.clipboard.writeText(shareUrl)
            alert('Share link copied to clipboard!')
        } catch (err) {
            console.error('Failed to copy share link:', err)
        }
    }

    const handleClose = () => {
        onToggleOpen()
        setSummary(null)
        setError(null)
        setAnalyzedArticles([])
        setShowArticleList(false)
        setViewingHistoryEntry(null)
        setIsCached(false)
        setIsRagEnhanced(false)
        setFullTextDocCount(0)
        setChatMessages([])
        setChatInput('')
        setBackendId(null)
        setModelUsed(null)
    }

    // Render markdown-like content
    const renderContent = (text: string) => {
        const lines = text.split('\n')
        const elements: React.ReactNode[] = []
        let listItems: string[] = []
        let listStartIdx = 0

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${listStartIdx}`} className="space-y-2 mb-4">
                        {listItems.map((item, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="text-purple-600 flex-shrink-0 mt-1">•</span>
                                <span className="text-gray-700">{renderInlineMarkdown(item)}</span>
                            </li>
                        ))}
                    </ul>
                )
                listItems = []
            }
        }

        lines.forEach((line, idx) => {
            if (line.startsWith('## ')) {
                flushList()
                elements.push(
                    <h3 key={idx} className="text-lg font-bold text-gray-900 mt-5 mb-3 first:mt-0 border-b border-gray-200 pb-2">
                        {line.replace('## ', '')}
                    </h3>
                )
                return
            }
            if (line.startsWith('### ')) {
                flushList()
                elements.push(
                    <h4 key={idx} className="text-md font-semibold text-gray-800 mt-4 mb-2">
                        {line.replace('### ', '')}
                    </h4>
                )
                return
            }
            if (line.match(/^[-•*]\s+/)) {
                if (listItems.length === 0) listStartIdx = idx
                listItems.push(line.replace(/^[-•*]\s+/, ''))
                return
            }
            if (line.match(/^\d+\.\s+/)) {
                flushList()
                const content = line.replace(/^\d+\.\s+/, '')
                const num = line.match(/^(\d+)\./)?.[1]
                elements.push(
                    <div key={idx} className="flex gap-2 mb-2">
                        <span className="text-purple-600 font-medium flex-shrink-0">{num}.</span>
                        <span className="text-gray-700">{renderInlineMarkdown(content)}</span>
                    </div>
                )
                return
            }
            if (!line.trim()) {
                flushList()
                return
            }
            flushList()
            elements.push(
                <p key={idx} className="text-gray-700 mb-3 leading-relaxed">
                    {renderInlineMarkdown(line)}
                </p>
            )
        })

        flushList()
        return elements
    }

    const renderInlineMarkdown = (text: string): React.ReactNode => {
        const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|Article #\d+|#\d+)/g)

        const handleArticleClick = () => {
            setShowArticleList(true)
            // Scroll to references section after a brief delay for DOM update
            setTimeout(() => {
                const referencesSection = document.getElementById('scientific-references-section')
                if (referencesSection) {
                    referencesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }, 100)
        }

        return parts.map((part, i) => {
            if (part.match(/^\*\*[^*]+\*\*$/) || part.match(/^__[^_]+__$/)) {
                return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
            }
            if (part.match(/^`[^`]+`$/)) {
                return <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>
            }
            if (part.match(/^(Article )?#\d+$/)) {
                const numMatch = part.match(/#(\d+)/)
                const articleNum = numMatch ? parseInt(numMatch[1], 10) : 0
                const article = analyzedArticles.find(a => a.num === articleNum)

                if (article?.url) {
                    return (
                        <a
                            key={i}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium text-sm hover:bg-purple-200 hover:text-purple-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title={article.title}
                        >
                            {part}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </a>
                    )
                }
                return (
                    <button
                        key={i}
                        onClick={() => handleArticleClick()}
                        className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium text-sm hover:bg-purple-200 hover:text-purple-800 transition-colors cursor-pointer"
                    >
                        {part}
                    </button>
                )
            }
            return part
        })
    }

    return (
        <>
            {/* Button Group */}
            <div className="flex items-center gap-2">
                {/* Get Insights Button */}
                <button
                    onClick={handleGetInsights}
                    disabled={articles.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 sm:px-3 rounded-md text-sm font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 border-transparent"
                    title={articles.length === 0 ? 'No articles to analyze' : 'Get AI-powered research insights'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    <span className="hidden sm:inline">Get Insights</span>
                </button>

                {/* History Button */}
                {history.length > 0 && (
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="bg-white border border-gray-300 text-gray-700 px-2 py-1 sm:px-3 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1.5"
                        title="View insights history"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="hidden sm:inline">History</span>
                        <span className="text-xs bg-gray-100 px-1 rounded">{history.length}</span>
                    </button>
                )}
            </div>

            {/* History Modal */}
            {isHistoryOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[70vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                <h2 className="text-lg font-bold text-gray-900">Insights History</h2>
                            </div>
                            <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {history.map((entry) => (
                                <button
                                    key={entry.id}
                                    onClick={() => handleViewHistoryEntry(entry)}
                                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                                >
                                    <div className="font-medium text-gray-900 truncate">{entry.filterSummary}</div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{entry.articleCount} articles</span>
                                        {entry.isRagEnhanced && (
                                            <>
                                                <span>•</span>
                                                <span className="text-blue-600 font-medium italic">RAG+</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={handleClearHistory}
                                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Clear History
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Insights Panel */}
            <div className={`
                fixed inset-y-0 right-0 z-[60] w-full lg:w-1/2 xl:w-[65%] bg-white shadow-2xl transition-transform duration-500 ease-in-out transform
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                flex flex-col border-l border-gray-200
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-900">Research Insights</h2>
                                {isCached && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        Cached
                                    </span>
                                )}
                            </div>
                            {summary && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <p className="text-xs text-gray-500">
                                        {articleCount} of {viewingHistoryEntry?.totalArticles || articles.length} articles
                                    </p>
                                    <div className="relative group">
                                        <button type="button" className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold flex items-center justify-center hover:bg-gray-300 transition-colors">
                                            ?
                                        </button>
                                        <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                            <p className="font-bold mb-1">Analysis Metadata</p>
                                            <p className="text-gray-300 leading-relaxed">
                                                Model: <span className="text-blue-300 font-mono">{modelUsed || 'Claude 3.5 Sonnet'}</span>
                                                <br />
                                                Strategy: {isRagEnhanced ? "Map-Reduce with Full-Text RAG fallback." : "Map-Reduce (Abstract-only) due to limited full-text availability."}
                                            </p>
                                            <div className="absolute bottom-full left-4 border-4 border-transparent border-b-gray-900"></div>
                                        </div>
                                    </div>
                                    {modelUsed && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">
                                            {modelUsed.includes('sonnet') ? '🚀 Sonnet 3.5' : modelUsed.includes('haiku') ? '⚡ Haiku' : modelUsed}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {summary && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Export
                                </button>

                                {isExportMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                                        <button
                                            onClick={() => handleExport('combined')}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex flex-col transition-colors"
                                        >
                                            <span className="font-semibold">Full Summary (.txt)</span>
                                            <span className="text-xs text-gray-500">Includes summary, chat & CSV data</span>
                                        </button>
                                        <button
                                            onClick={() => handleExport('csv')}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex flex-col border-t border-gray-100 transition-colors"
                                        >
                                            <span className="font-semibold">Article Data (CSV)</span>
                                            <span className="text-xs text-gray-500">Metadata for all {articles.length} articles</span>
                                        </button>
                                        <button
                                            onClick={() => handleExport('copy')}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex flex-col border-t border-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">Copy Text</span>
                                                {copied && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">COPIED!</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">Clean text for pasting</span>
                                        </button>
                                        {backendId && (
                                            <button
                                                onClick={handleShareLink}
                                                className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 flex flex-col border-t border-gray-100 transition-colors"
                                            >
                                                <span className="font-semibold">Share Link</span>
                                                <span className="text-xs text-blue-500/70">Copy permanent URL</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                            {/* Show user question if this came from Smart Search */}
                            {userQuestion && (
                                <div className="mb-8 max-w-md">
                                    <p className="text-xs text-purple-600 uppercase tracking-wider font-semibold mb-2">Your Question</p>
                                    <p className="text-gray-800 font-medium italic">"{userQuestion}"</p>
                                </div>
                            )}
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-purple-100 rounded-full animate-spin border-t-purple-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-600 animate-pulse">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="mt-8 text-xl font-bold text-gray-900">{userQuestion ? 'Researching Your Question...' : 'Analyzing Literature...'}</h3>
                            <p className="mt-3 text-sm text-gray-600 leading-relaxed max-w-sm">
                                {userQuestion
                                    ? 'Our AI is searching relevant articles and synthesizing findings to answer your question. This may take a few minutes.'
                                    : `Our AI is synthesizing findings across ${Math.min(30, articles.length)} articles using specialized map-reduce orchestration. This may take a few minutes.`
                                }
                            </p>
                            <div className="mt-8 w-full max-w-xs bg-gray-100 rounded-full h-1.5 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full animate-progress-fast w-full"></div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">Deep Synthesis Active</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                            <div className="p-4 bg-red-50 rounded-2xl mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-red-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Analysis Interrupted</h3>
                            <p className="text-sm text-gray-600 mb-8 max-w-xs">{error}</p>
                            <button
                                onClick={handleRetryPoll}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold text-sm shadow-md hover:shadow-lg active:scale-95"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {summary && (
                        <div className="p-6 lg:p-8 space-y-8 pb-32">
                            {/* Show user question at top if from Smart Search */}
                            {userQuestion && (
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                                    <p className="text-xs text-purple-600 uppercase tracking-wider font-semibold mb-1">Your Question</p>
                                    <p className="text-gray-900 font-medium">"{userQuestion}"</p>
                                </div>
                            )}

                            {/* Model Info Banner */}
                            {isRagEnhanced && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-900">Deep Search Enhanced</h4>
                                        <p className="text-xs text-blue-700/80 leading-relaxed mt-0.5">
                                            This analysis incorporated full-text content from {fullTextDocCount} articles for higher precision findings.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="prose prose-purple prose-sm max-w-none">
                                {renderContent(summary)}
                            </div>

                            {/* Reference Section */}
                            {analyzedArticles.length > 0 && (
                                <div id="scientific-references-section" className="border-t border-gray-100 pt-8">
                                    <button
                                        onClick={() => setShowArticleList(!showArticleList)}
                                        className="w-full flex items-center justify-between mb-4 group/btn"
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Scientific References</h3>
                                            <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded">Count: {analyzedArticles.length}</span>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showArticleList ? 'rotate-180' : ''}`}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>

                                    {showArticleList && (
                                        <div className="grid gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {analyzedArticles.map((article) => {
                                                // Generate URL from PMID if article.url is not available
                                                const articleUrl = article.url || (article.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${article.pmid.replace('PMID:', '')}/` : undefined);
                                                return (
                                                    <a
                                                        key={article.num}
                                                        href={articleUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`group flex gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-sm transition-all ${articleUrl ? 'cursor-pointer' : 'cursor-default'}`}
                                                        onClick={(e) => { if (!articleUrl) e.preventDefault(); }}
                                                    >
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center font-bold text-xs group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:border-purple-100 transition-colors">
                                                            {article.num}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors leading-snug">
                                                                {article.title}
                                                            </h4>
                                                            {/* Author & Journal Line */}
                                                            {(article.authors || article.journal) && (
                                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                                    {article.authors && (
                                                                        <span className="font-medium">{article.authors.split(',')[0]?.trim()}{article.authors.includes(',') ? ' et al.' : ''}</span>
                                                                    )}
                                                                    {article.authors && article.journal && ' • '}
                                                                    {article.journal && (
                                                                        <span className="italic">{article.journal}</span>
                                                                    )}
                                                                </p>
                                                            )}
                                                            <div className="mt-2 flex items-center gap-3 flex-wrap">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                                    {article.pubDate || article.year}
                                                                </span>
                                                                {article.pmid && (
                                                                    <span className="text-[10px] font-medium text-gray-400">
                                                                        PMID: {article.pmid}
                                                                    </span>
                                                                )}
                                                                {article.hasFullText && (
                                                                    <span className="flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-100/50">
                                                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                                        Full-Text Analysed
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* External Link Icon */}
                                                        <div className="flex-shrink-0 w-6 h-6 text-gray-300 group-hover:text-purple-500 transition-colors self-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                            </svg>
                                                        </div>
                                                    </a>
                                                );
                                            })}

                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Conversation Section */}
                            <div className="border-t border-gray-100 pt-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Follow-up Discussion</h3>
                                </div>

                                <div className="space-y-6">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className={`
                                                max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                                ${msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                }
                                            `}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-300 mt-2 uppercase tracking-tight">
                                                {msg.role === 'user' ? 'Scientist' : 'Claude Insight'}
                                            </span>
                                        </div>
                                    ))}

                                    {isChatLoading && (
                                        <div className="flex flex-col items-start bg-gray-50/50 rounded-2xl p-4 border border-gray-100 w-full animate-pulse">
                                            <div className="flex gap-1.5 mb-2">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Scanning technical database...</span>
                                        </div>
                                    )}

                                    {/* Chat Input Field Container (Sticky at bottom if needed, but here inline) */}
                                    <form onSubmit={handleSendFollowUp} className="relative mt-8 group">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Ask a technical follow-up..."
                                            className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 pr-16 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all shadow-sm group-hover:shadow-md"
                                            disabled={isChatLoading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!chatInput.trim() || isChatLoading}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2.5 rounded-xl hover:bg-purple-700 disabled:opacity-30 transition-all shadow-lg active:scale-90"
                                            aria-label="Send message"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer */}
                {summary && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                        <p className="text-[10px] font-medium text-gray-400 text-center uppercase tracking-widest leading-loose">
                            AI synthesis is experimental • Verified {articleCount} clinical abstracts • No medical advice
                        </p>
                    </div>
                )}
            </div>

            {/* Panel Backdrop (Mobile only or for closing) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[55] lg:hidden"
                    onClick={handleClose}
                />
            )}
        </>
    )
}
