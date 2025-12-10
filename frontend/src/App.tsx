import { useState, useEffect } from 'react'
import axios from 'axios'

interface Article {
  pubmed_id: string
  title: string
  abstract: string
  pub_date: string
  url: string
  mutations: string[]
  diseases: string[]
  authors: string
  journal: string
  affiliations: string
  tags: string[]
}

function App() {
  const [articles, setArticles] = useState<Article[]>([])

  // Filters
  const [selectedMutation, setSelectedMutation] = useState<string | null>(null)
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const [authorFilter, setAuthorFilter] = useState("")
  const [journalFilter, setJournalFilter] = useState("")
  const [institutionFilter, setInstitutionFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [stats, setStats] = useState<{ mutations: { [key: string]: number }, tags: { [key: string]: number } }>({ mutations: {}, tags: {} })

  useEffect(() => {
    // Debounce text inputs if needed, but for now just fetch on effect
    const timeoutId = setTimeout(() => {
      fetchArticles()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [selectedMutation, selectedDisease, selectedTag, authorFilter, journalFilter, institutionFilter, startDate, endDate])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchArticles = async () => {
    try {
      const params: any = {}
      if (selectedMutation) params.mutation = selectedMutation
      if (selectedDisease) params.disease = selectedDisease
      if (selectedTag) params.tag = selectedTag

      if (authorFilter) params.author = authorFilter
      if (journalFilter) params.journal = journalFilter
      if (institutionFilter) params.institution = institutionFilter
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const res = await axios.get('http://localhost:8000/articles', { params })
      setArticles(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:8000/stats')
      setStats(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const resetAll = () => {
    setSelectedMutation(null)
    setSelectedDisease(null)
    setSelectedTag(null)
    setAuthorFilter("")
    setJournalFilter("")
    setInstitutionFilter("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-200">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h1 className="text-xl font-semibold text-gray-900">LeukemiaLens</h1>
          </div>
          <div className="text-sm text-gray-500">Tracking Scientific Developments</div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">

        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0 space-y-6">

          <button
            onClick={resetAll}
            className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Reset All Filters
          </button>

          {/* Advanced Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Advanced Search</h3>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  placeholder="Author (e.g. Smith)"
                  value={authorFilter}
                  onChange={e => setAuthorFilter(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  placeholder="Journal (e.g. Blood)"
                  value={journalFilter}
                  onChange={e => setJournalFilter(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="text"
                  className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  placeholder="Institution"
                  value={institutionFilter}
                  onChange={e => setInstitutionFilter(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                    placeholder="Start Year"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                    placeholder="End Year"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Study Tags */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Study Topics</h3>
            <div className="space-y-1">
              {Object.entries(stats.tags).map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center group ${selectedTag === tag ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                >
                  <span className="truncate">{tag}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs py-0.5 px-1.5 rounded-full ${selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
                    {selectedTag === tag && <span className="text-xs font-bold hover:text-blue-200">✕</span>}
                  </div>
                </button>
              ))}
              {Object.keys(stats.tags).length === 0 && <p className="text-xs text-gray-400 px-3">No topics found.</p>}
            </div>
          </div>

          <hr className="border-gray-300" />

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Common Mutations</h3>
            <div className="space-y-1">
              {Object.entries(stats.mutations).map(([mut, count]) => (
                <button
                  key={mut}
                  onClick={() => setSelectedMutation(selectedMutation === mut ? null : mut)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center group ${selectedMutation === mut ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                >
                  <span>{mut}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs py-0.5 px-1.5 rounded-full ${selectedMutation === mut ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
                    {selectedMutation === mut && <span className="text-xs font-bold hover:text-blue-200">✕</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Diseases</h3>
            {['AML', 'CML', 'ALL'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDisease(selectedDisease === d ? null : d)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1 flex justify-between items-center group ${selectedDisease === d ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                  }`}
              >
                <span>{d}</span>
                {selectedDisease === d && <span className="text-xs font-bold hover:text-blue-200 mr-2">✕</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Latest Articles</h2>
            <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">{articles.length} results</span>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.pubmed_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.mutations.map(m => (
                        <span key={m} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          {m}
                        </span>
                      ))}
                      {article.diseases.map(d => (
                        <span key={d} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {d}
                        </span>
                      ))}
                      {article.tags.map(t => (
                        <span key={t} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          {t}
                        </span>
                      ))}
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {article.journal}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                        {article.title}
                      </a>
                    </h3>
                    <div className="text-xs text-gray-500 mb-3 flex flex-col gap-1">
                      <span className="font-semibold text-gray-800">{article.authors}</span>
                      {article.affiliations && <span className="text-gray-400 italic truncate w-full" title={article.affiliations}>{article.affiliations}</span>}
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                      {article.abstract}
                    </p>
                    <div className="flex items-center text-xs font-medium text-gray-500 gap-4 border-t border-gray-100 pt-3">
                      <span>PMID: {article.pubmed_id}</span>
                      <span>Published: {article.pub_date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {articles.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No articles found matching filters.</p>
                <button onClick={resetAll} className="mt-4 text-blue-600 hover:underline text-sm">Clear all filters</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
