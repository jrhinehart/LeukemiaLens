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
}

function App() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedMutation, setSelectedMutation] = useState<string | null>(null)
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null)
  const [stats, setStats] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchArticles()
    fetchStats()
  }, [selectedMutation, selectedDisease])

  const fetchArticles = async () => {
    try {
      const params: any = {}
      if (selectedMutation) params.mutation = selectedMutation
      if (selectedDisease) params.disease = selectedDisease

      const res = await axios.get('http://localhost:8000/articles', { params })
      setArticles(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:8000/stats')
      setStats(res.data.mutations)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h1 className="text-xl font-semibold text-gray-900">LeukemiaLens</h1>
          </div>
          <div className="text-sm text-gray-500">Tracking Scientific Developments</div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">

        {/* Sidebar Filters */}
        <aside className="w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Common Mutations</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedMutation(null)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${!selectedMutation ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                All Mutations
              </button>
              {Object.entries(stats).map(([mut, count]) => (
                <button
                  key={mut}
                  onClick={() => setSelectedMutation(mut)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between ${selectedMutation === mut ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span>{mut}</span>
                  <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-1.5 rounded-full">{count}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Diseases</h3>
            {/* Hardcoded for now as we only detect AML really well */}
            <button
              onClick={() => setSelectedDisease(selectedDisease === 'AML' ? null : 'AML')}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedDisease === 'AML' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              AML
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Latest Articles</h2>
            <span className="text-sm text-gray-500">{articles.length} results</span>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.pubmed_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {article.mutations.map(m => (
                        <span key={m} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {m}
                        </span>
                      ))}
                      {article.diseases.map(d => (
                        <span key={d} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {d}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        {article.title}
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {article.abstract}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 gap-4">
                      <span>PMID: {article.pubmed_id}</span>
                      <span>Published: {article.pub_date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {articles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No articles found matching filters.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
