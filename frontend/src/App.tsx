import { useState, useEffect } from 'react'
import axios from 'axios'
import bannerImage from '../../assets/images/LL-logo-banner.png'

// Helper to serialize arrays as repeat params: key=val1&key=val2
const paramsSerializer = (params: any) => {
  const parts: string[] = []
  Object.keys(params).forEach(key => {
    const val = params[key]
    if (Array.isArray(val)) {
      if (val.length > 0) parts.push(`${key}=${encodeURIComponent(val.join(','))}`)
    } else if (val !== null && val !== undefined && val !== '') {
      parts.push(`${key}=${encodeURIComponent(val)}`)
    }
  })
  return parts.join('&')
}

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

// Helper component for highlighting text
const HighlightText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight || !highlight.trim()) return <>{text}</>

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-gray-900 font-medium px-0.5 rounded-sm">{part}</span>
        ) : (
          part
        )
      )}
    </span>
  )
}

function App() {
  const [articles, setArticles] = useState<Article[]>([])

  // Filters
  const [selectedMutation, setSelectedMutation] = useState<string[]>([])
  const [selectedDisease, setSelectedDisease] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string[]>([])

  const [searchQuery, setSearchQuery] = useState("")
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
    // Removed searchQuery from dependencies to make search manual (Enter/Click)
  }, [selectedMutation, selectedDisease, selectedTag, authorFilter, journalFilter, institutionFilter, startDate, endDate])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchArticles = async () => {
    try {
      const params: any = {}
      if (searchQuery) params.q = searchQuery // Changed from 'search' to 'q'
      if (selectedMutation.length > 0) params.mutation = selectedMutation
      if (selectedDisease.length > 0) params.disease = selectedDisease
      if (selectedTag.length > 0) params.tag = selectedTag

      if (authorFilter) params.author = authorFilter // API: not impl in filtering but ignored safely
      if (journalFilter) params.journal = journalFilter // API: not impl
      if (institutionFilter) params.institution = institutionFilter // API: not impl
      if (startDate) params.year_start = startDate
      if (endDate) params.year_end = endDate

      const res = await axios.get('https://leukemialens-api.jr-rhinehart.workers.dev/api/search', {
        params,
        paramsSerializer: { serialize: paramsSerializer }
      })

      const mapped = res.data.map((r: any) => ({
        pubmed_id: r.source_id ? r.source_id.replace('PMID:', '') : String(r.id),
        title: r.title,
        abstract: r.abstract,
        pub_date: r.pub_date,
        url: r.source_id ? `https://pubmed.ncbi.nlm.nih.gov/${r.source_id.replace('PMID:', '')}/` : '#',
        mutations: r.mutations || [],
        diseases: r.disease_subtype ? r.disease_subtype.split(',') : [],
        authors: r.authors,
        journal: r.journal,
        affiliations: '',
        tags: []
      }))
      setArticles(mapped)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('https://leukemialens-api.jr-rhinehart.workers.dev/api/stats')
      setStats(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const resetAll = () => {
    setSelectedMutation([])
    setSelectedDisease([])
    setSelectedTag([])
    setSearchQuery("")
    setAuthorFilter("")
    setJournalFilter("")
    setInstitutionFilter("")
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-200">
      {/* Header */}
      {/* Hero Section */}
      <div className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 bg-white p-4 rounded-xl shadow-lg">
            <img src={bannerImage} alt="LeukemiaLens" className="h-20 md:h-24 object-contain" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-3 text-white">Accelerating Leukemia Research</h2>
            <p className="max-w-3xl text-blue-100 text-lg leading-relaxed">
              LeukemiaLens empowers researchers and clinicians by aggregating the latest scientific findings from PubMed.
              We categorize articles by mutations, diseases, and topics to help you discover insights faster.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">

        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0 space-y-6">

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

          <button
            onClick={resetAll}
            className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Reset All Filters
          </button>

          {/* Study Tags */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Study Topics</h3>
            <div className="space-y-1">
              {Object.entries(stats.tags).map(([tag, count]) => {
                const isSelected = selectedTag.includes(tag)
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (isSelected) setSelectedTag(prev => prev.filter(x => x !== tag))
                      else setSelectedTag(prev => [...prev, tag])
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center group ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <span className="truncate">{tag}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs py-0.5 px-1.5 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
                      {isSelected && <span className="text-xs font-bold hover:text-blue-200">✕</span>}
                    </div>
                  </button>
                )
              })}
              {Object.keys(stats.tags).length === 0 && <p className="text-xs text-gray-400 px-3">No topics found.</p>}
            </div>
          </div>

          <hr className="border-gray-300" />

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Common Mutations</h3>
            <div className="space-y-1">
              {Object.entries(stats.mutations).map(([mut, count]) => {
                const isSelected = selectedMutation.includes(mut)
                return (
                  <button
                    key={mut}
                    onClick={() => {
                      if (isSelected) setSelectedMutation(prev => prev.filter(x => x !== mut))
                      else setSelectedMutation(prev => [...prev, mut])
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center group ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <span>{mut}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs py-0.5 px-1.5 rounded-full ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>
                      {isSelected && <span className="text-xs font-bold hover:text-blue-200">✕</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Diseases</h3>
            {['AML', 'CML', 'ALL'].map(d => {
              const isSelected = selectedDisease.includes(d)
              return (
                <button
                  key={d}
                  onClick={() => {
                    if (isSelected) setSelectedDisease(prev => prev.filter(x => x !== d))
                    else setSelectedDisease(prev => [...prev, d])
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1 flex justify-between items-center group ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                >
                  <span>{d}</span>
                  {isSelected && <span className="text-xs font-bold hover:text-blue-200 mr-2">✕</span>}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">

          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search titles and abstracts..."
                className="w-full pl-5 pr-12 py-3 border border-gray-300 rounded-xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
              />
              <button
                onClick={fetchArticles}
                className="absolute right-2 top-2 p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Latest Articles</h2>
            <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">{articles.length} results</span>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.pubmed_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
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
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 break-words">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                        <HighlightText text={article.title} highlight={searchQuery} />
                      </a>
                    </h3>
                    <div className="text-xs text-gray-500 mb-3 flex flex-col gap-1">
                      <span className="font-semibold text-gray-800 break-words">{article.authors}</span>
                      {article.affiliations && <span className="text-gray-400 italic truncate w-full" title={article.affiliations}>{article.affiliations}</span>}
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed break-words">
                      <HighlightText text={article.abstract} highlight={searchQuery} />
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
