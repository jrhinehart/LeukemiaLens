import { useState, useEffect } from 'react'
import axios from 'axios'
import bannerImage from './assets/LL-logo-banner.jpg'
import { AboutPage, ContactPage, ResourcesPage } from './Pages'
import { StatsPage } from './StatsPage'
import { LandingPage } from './LandingPage'
import { DiseasePage } from './DiseasePage'
import { BloodCellProductionPage, MutationsPage, RiskStratificationPage, StemCellTransplantPage, LabResultsPage, ClinicalTrialsPage } from './EducationPages'
import { SimpleListFilter, SearchableListFilter, TextSearchFilter, DateRangeFilter, ErrorModal, GroupedMutationFilter, SmartSearchInput, ResearchInsights } from './components'
import type { ParsedFilters } from './components'

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

// Development vs Production API URL
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8787'
  : 'https://leukemialens-api.jr-rhinehart.workers.dev';

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
  treatments?: { code: string, name: string, type: string }[]
  full_text_type?: 'pdf' | 'xml' | null
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
  // Page routing - check URL pathname
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'contact' | 'resources' | 'stats' | 'search' | 'myeloid' | 'lymphoid' | 'myeloma' | 'learn-blood-cells' | 'learn-mutations' | 'learn-risk' | 'learn-transplant' | 'learn-lab-results' | 'learn-clinical-trials'>(() => {
    const path = window.location.pathname
    if (path === '/stats') return 'stats'
    if (path === '/about') return 'about'
    if (path === '/contact') return 'contact'
    if (path === '/resources') return 'resources'
    if (path === '/search') return 'search'
    if (path === '/myeloid') return 'myeloid'
    if (path === '/lymphoid') return 'lymphoid'
    if (path === '/myeloma') return 'myeloma'
    if (path === '/learn/blood-cells') return 'learn-blood-cells'
    if (path === '/learn/mutations') return 'learn-mutations'
    if (path === '/learn/risk') return 'learn-risk'
    if (path === '/learn/transplant') return 'learn-transplant'
    if (path === '/learn/lab-results') return 'learn-lab-results'
    if (path === '/learn/clinical-trials') return 'learn-clinical-trials'
    return 'home'
  })


  // Listen for browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      if (path === '/stats') setCurrentPage('stats')
      else if (path === '/about') setCurrentPage('about')
      else if (path === '/contact') setCurrentPage('contact')
      else if (path === '/resources') setCurrentPage('resources')
      else if (path === '/search') setCurrentPage('search')
      else if (path === '/myeloid') setCurrentPage('myeloid')
      else if (path === '/lymphoid') setCurrentPage('lymphoid')
      else if (path === '/myeloma') setCurrentPage('myeloma')
      else if (path === '/learn/blood-cells') setCurrentPage('learn-blood-cells')
      else if (path === '/learn/mutations') setCurrentPage('learn-mutations')
      else if (path === '/learn/risk') setCurrentPage('learn-risk')
      else if (path === '/learn/transplant') setCurrentPage('learn-transplant')
      else if (path === '/learn/lab-results') setCurrentPage('learn-lab-results')
      else if (path === '/learn/clinical-trials') setCurrentPage('learn-clinical-trials')
      else setCurrentPage('home')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])


  const [articles, setArticles] = useState<Article[]>([])

  // Filters
  const [selectedMutation, setSelectedMutation] = useState<string[]>([])
  const [selectedDisease, setSelectedDisease] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string[]>([])
  const [selectedTreatment, setSelectedTreatment] = useState<string[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [authorFilter, setAuthorFilter] = useState("")
  const [journalFilter, setJournalFilter] = useState("")
  const [institutionFilter, setInstitutionFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [stats, setStats] = useState<{ mutations: { [key: string]: number }, tags: { [key: string]: number }, treatments: { [key: string]: number } }>({ mutations: {}, tags: {}, treatments: {} })
  const [ontology, setOntology] = useState<{ diseases: any[], mutations: any[], treatments: any[], treatment_components: any[] }>({ diseases: [], mutations: [], treatments: [], treatment_components: [] })

  // Error state
  const [error, setError] = useState<{ title: string, message: string } | null>(null)

  // Pagination state
  const [resultsPage, setResultsPage] = useState(1)
  const itemsPerPage = 25

  // Scroll tracking for return-to-top button
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Sidebar visibility for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false)

  const hasActiveFilters = selectedMutation.length > 0 ||
    selectedDisease.length > 0 ||
    selectedTag.length > 0 ||
    selectedTreatment.length > 0 ||
    searchQuery !== "" ||
    authorFilter !== "" ||
    journalFilter !== "" ||
    institutionFilter !== "" ||
    startDate !== "" ||
    endDate !== ""

  useEffect(() => {
    // Prevent default fetch if no filters are active
    if (!hasActiveFilters && articles.length === 0) {
      return
    }

    // Debounce text inputs if needed
    const timeoutId = setTimeout(() => {
      fetchArticles()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [selectedMutation, selectedDisease, selectedTag, selectedTreatment, searchQuery, authorFilter, journalFilter, institutionFilter, startDate, endDate])

  useEffect(() => {
    fetchStats()
    fetchOntology()

    // Handle hash navigation
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash === 'about' || hash === 'contact' || hash === 'resources') {
        setCurrentPage(hash)
      } else {
        setCurrentPage('home')
      }
    }
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Scroll listener for return-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      setShowScrollTop(scrollPercent > 25)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setResultsPage(1)
  }, [selectedMutation, selectedDisease, selectedTag, selectedTreatment, searchQuery, authorFilter, journalFilter, institutionFilter, startDate, endDate])

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  const fetchArticles = async () => {
    try {
      const params: any = {}
      if (searchQuery) params.q = searchQuery // Changed from 'search' to 'q'
      if (selectedMutation.length > 0) params.mutation = selectedMutation
      if (selectedDisease.length > 0) params.disease = selectedDisease
      if (selectedTag.length > 0) params.tag = selectedTag
      if (selectedTreatment.length > 0) params.treatment = selectedTreatment

      if (authorFilter) params.author = authorFilter // API: not impl in filtering but ignored safely
      if (journalFilter) params.journal = journalFilter // API: not impl
      if (institutionFilter) params.institution = institutionFilter // API: not impl
      if (startDate) params.year_start = startDate
      if (endDate) params.year_end = endDate

      // Request up to 1000 results (API will handle pagination internally)
      params.limit = '1000'

      const res = await axios.get(`${API_BASE_URL}/api/search`, {
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
        treatments: r.treatments || [],
        authors: r.authors,
        journal: r.journal,
        affiliations: '',
        tags: [],
        full_text_type: r.full_text_type
      }))
      setArticles(mapped)
    } catch (err: any) {
      console.error(err)
      setError({
        title: 'Failed to Load Articles',
        message: err.response?.data?.error || 'Unable to fetch articles. Please check your connection and try again.'
      })
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/stats`)
      setStats(res.data)
    } catch (err: any) {
      console.error(err)
      setError({
        title: 'Failed to Load Statistics',
        message: 'Unable to load filter statistics. Some filters may not display properly.'
      })
    }
  }

  const fetchOntology = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/ontology`)
      setOntology(res.data)
    } catch (err: any) {
      console.error("Failed to fetch ontology", err)
      setError({
        title: 'Failed to Load Ontology',
        message: 'Unable to load disease and mutation data. Some filters may not be available.'
      })
    }
  }

  const resetAll = () => {
    setSelectedMutation([])
    setSelectedDisease([])
    setSelectedTag([])
    setSelectedTreatment([])
    setSearchQuery("")
    setAuthorFilter("")
    setJournalFilter("")
    setInstitutionFilter("")
    setStartDate("")
    setEndDate("")
    setArticles([])
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedMutation.length) params.append('mutation', selectedMutation.join(','))
    if (selectedDisease.length) params.append('disease', selectedDisease.join(','))
    if (selectedTag.length) params.append('tag', selectedTag.join(','))
    if (selectedTreatment.length) params.append('treatment', selectedTreatment.join(','))
    if (authorFilter) params.append('author', authorFilter)
    if (journalFilter) params.append('journal', journalFilter)
    if (institutionFilter) params.append('institution', institutionFilter)
    if (startDate) params.append('year_start', startDate)
    if (endDate) params.append('year_end', endDate)
    params.append('limit', '500') // Limit exports to 500 rows

    // Trigger download
    window.location.href = `${API_BASE_URL}/api/export?${params.toString()}`
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Calculate pagination
  const totalPages = Math.ceil(articles.length / itemsPerPage)
  const startIndex = (resultsPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = articles.slice(startIndex, endIndex)

  // Check current page state and render appropriate component
  if (currentPage === 'stats') {
    return <StatsPage onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }} />
  }
  if (currentPage === 'about') {
    return <AboutPage onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }} />
  }
  if (currentPage === 'contact') {
    return <ContactPage onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }} />
  }
  if (currentPage === 'resources') {
    return <ResourcesPage onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }} />
  }

  // Handle disease group pages
  if (['myeloid', 'lymphoid', 'myeloma'].includes(currentPage)) {
    return (
      <DiseasePage
        groupId={currentPage}
        apiBaseUrl={API_BASE_URL}
        onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }}
        onStartSearch={(initialDisease) => {
          if (initialDisease) {
            setSelectedDisease([initialDisease]);
          }
          setCurrentPage('search');
          window.history.pushState({}, '', '/search');
          window.scrollTo(0, 0);
        }}
      />
    );
  }

  // Handle educational pages
  const navigateToLearn = (topic: string) => {
    setCurrentPage(`learn-${topic}` as any);
    window.history.pushState({}, '', `/learn/${topic}`);
    window.scrollTo(0, 0);
  };

  if (currentPage === 'learn-blood-cells') {
    return (
      <BloodCellProductionPage
        onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }}
        onNavigateToLearn={navigateToLearn}
      />
    );
  }
  if (currentPage === 'learn-mutations') {
    return (
      <MutationsPage
        onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }}
        onNavigateToLearn={navigateToLearn}
      />
    );
  }
  if (currentPage === 'learn-risk') {
    return (
      <RiskStratificationPage
        onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }}
        onNavigateToLearn={navigateToLearn}
      />
    );
  }
  if (currentPage === 'learn-transplant') {
    return (
      <StemCellTransplantPage
        onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }}
        onNavigateToLearn={navigateToLearn}
      />
    );
  }
  if (currentPage === 'learn-lab-results') {
    return (
      <LabResultsPage
        onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }}
        onNavigateToLearn={navigateToLearn}
      />
    );
  }
  if (currentPage === 'learn-clinical-trials') {
    return (
      <ClinicalTrialsPage
        onNavigateHome={() => { setCurrentPage('home'); window.history.pushState({}, '', '/') }}
        onNavigateToLearn={navigateToLearn}
      />
    );
  }

  // If home, show the new landing page
  if (currentPage === 'home') {
    return (
      <LandingPage
        onNavigateToDisease={(id) => {
          setCurrentPage(id as any);
          window.history.pushState({}, '', `/${id}`);
          window.scrollTo(0, 0);
        }}
        onStartSearch={() => {
          setCurrentPage('search');
          window.history.pushState({}, '', '/search');
          window.scrollTo(0, 0);
        }}
        onNavigateToPage={(page) => {
          setCurrentPage(page);
          window.history.pushState({}, '', `/${page}`);
          window.scrollTo(0, 0);
        }}
        onNavigateToLearn={navigateToLearn}
      />
    );
  }

  // If search, continue with the existing search UI below

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-200">
      {/* Error Modal */}
      <ErrorModal
        isOpen={error !== null}
        onClose={() => setError(null)}
        title={error?.title || 'Error'}
        message={error?.message || 'An unexpected error occurred.'}
      />
      {/* Return to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50 group"
          aria-label="Return to top"
          title="Return to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Header */}
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-950 via-blue-700 to-blue-500 text-white shadow-md">
        {/* Top Navigation */}
        <nav className="absolute top-4 right-4 sm:right-8 flex gap-6 text-sm font-medium z-10">
          <a href="/about" onClick={(e) => { e.preventDefault(); setCurrentPage('about'); window.history.pushState({}, '', '/about') }} className="text-blue-100 hover:text-white transition-colors cursor-pointer">About</a>
          <a href="/contact" onClick={(e) => { e.preventDefault(); setCurrentPage('contact'); window.history.pushState({}, '', '/contact') }} className="text-blue-100 hover:text-white transition-colors cursor-pointer">Contact</a>
          <a href="/resources" onClick={(e) => { e.preventDefault(); setCurrentPage('resources'); window.history.pushState({}, '', '/resources') }} className="text-blue-100 hover:text-white transition-colors cursor-pointer">Resources</a>
          <a href="/stats" onClick={(e) => { e.preventDefault(); setCurrentPage('stats'); window.history.pushState({}, '', '/stats') }} className="text-blue-100 hover:text-white transition-colors cursor-pointer">Stats</a>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('home');
                window.history.pushState({}, '', '/');
              }}
              className="cursor-pointer"
              title="Back to Home"
            >
              <img src={bannerImage} alt="LeukemiaLens" className="h-20 md:h-24 object-contain hover:opacity-90 transition-opacity" />
            </a>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-3 text-white">Your AI-Powered Leukemia Research Assistant</h2>
            <p className="max-w-3xl text-blue-100 text-lg leading-relaxed mb-3">
              Stop sifting through irrelevant articles. LeukemiaLens aggregates the latest research from PubMed and enriches it with intelligent tagging for <strong className="text-white">65+ gene mutations</strong>, disease subtypes, treatments, and research topics.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white px-3 py-1.5 rounded-full text-sm font-medium">
                ✨ Smart Search — Ask questions in plain English
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white px-3 py-1.5 rounded-full text-sm font-medium">
                🧠 Research Insights — AI synthesis of findings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area with Split View Support */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isInsightsPanelOpen ? 'lg:mr-[50%] xl:mr-[65%]' : ''}`}>
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 relative h-full">

            {/* Sidebar Filters */}
            <aside className={`
              fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 p-6 shadow-2xl transition-transform duration-300 ease-in-out transform
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              md:relative md:translate-x-0 md:w-64 md:flex-shrink-0 md:bg-transparent md:p-0 md:shadow-none md:z0
            `}>
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="sticky top-8 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar px-2">

                {/* Smart Search - AI-powered natural language query */}
                <SmartSearchInput
                  onApplyFilters={(filters: ParsedFilters) => {
                    // Only set search query if there are unparsed terms
                    setSearchQuery(filters.q || '')
                    setSelectedMutation(filters.mutations || [])
                    setSelectedDisease(filters.diseases || [])
                    setSelectedTreatment(filters.treatments || [])
                    setSelectedTag(filters.tags || [])
                    setStartDate(filters.yearStart || '')
                    setEndDate(filters.yearEnd || '')
                    setAuthorFilter(filters.author || '')
                    setJournalFilter(filters.journal || '')
                    // Note: useEffect will trigger fetchArticles when state updates
                  }}
                />

                <hr className="border-gray-300" />

                {/* Main Search - Moved to top of filters */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Search</h3>
                  <TextSearchFilter
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={fetchArticles}
                    placeholder="Search articles..."
                  />
                </div>

                <hr className="border-gray-300" />

                {/* Diseases */}
                <SimpleListFilter
                  title="Diseases"
                  items={ontology.diseases.length > 0
                    ? ontology.diseases.map(d => ({
                      id: d.code,
                      label: d.code,
                      description: d.name !== d.code ? d.name : undefined
                    }))
                    : ['AML', 'CML', 'ALL'].map(d => ({ id: d, label: d }))
                  }
                  selectedIds={selectedDisease}
                  onChange={setSelectedDisease}
                  defaultCollapsed={true}
                />

                <hr className="border-gray-300" />

                {/* Mutations */}
                <GroupedMutationFilter
                  title="Mutations"
                  items={ontology.mutations}
                  selectedIds={selectedMutation}
                  onChange={setSelectedMutation}
                  stats={stats.mutations}
                  defaultCollapsed={true}
                />

                <hr className="border-gray-300" />

                {/* Treatments */}
                <SearchableListFilter
                  title="Treatments"
                  items={ontology.treatments.length > 0
                    ? ontology.treatments.map(t => ({
                      id: t.code,
                      label: t.type === 'protocol' ? `⚕️ ${t.name}` : `💊 ${t.name}`,
                      count: stats.treatments[t.code] || 0
                    }))
                    : Object.entries(stats.treatments || {}).map(([code, count]) => ({
                      id: code,
                      label: code,
                      count: count as number
                    }))
                  }
                  selectedIds={selectedTreatment}
                  onChange={(newSelection) => {
                    // Auto-select component drugs when a protocol is selected
                    const addedTreatments = newSelection.filter(id => !selectedTreatment.includes(id));
                    const removedTreatments = selectedTreatment.filter(id => !newSelection.includes(id));

                    let finalSelection = [...newSelection];

                    // If a protocol was added, also add its component drugs
                    addedTreatments.forEach(treatmentCode => {
                      const treatment = ontology.treatments?.find(t => t.code === treatmentCode);
                      if (treatment && treatment.type === 'protocol') {
                        // Find component drugs for this protocol
                        const components = (ontology.treatment_components || [])
                          .filter(tc => tc.protocol_code === treatmentCode)
                          .map(tc => tc.drug_code);

                        // Add components if not already selected
                        components.forEach(drugCode => {
                          if (!finalSelection.includes(drugCode)) {
                            finalSelection.push(drugCode);
                          }
                        });
                      }
                    });

                    // If a drug was removed that is part of a selected protocol, remove the protocol too
                    removedTreatments.forEach(treatmentCode => {
                      const treatment = ontology.treatments?.find(t => t.code === treatmentCode);
                      if (treatment && treatment.type === 'drug') {
                        // Find protocols that include this drug
                        const relatedProtocols = (ontology.treatment_components || [])
                          .filter(tc => tc.drug_code === treatmentCode)
                          .map(tc => tc.protocol_code);

                        // Remove related protocols from selection
                        finalSelection = finalSelection.filter(code => !relatedProtocols.includes(code));
                      }
                    });

                    setSelectedTreatment(finalSelection);
                  }}
                  searchPlaceholder="Search treatments..."
                  maxHeight="24rem"
                  defaultCollapsed={true}
                />

                <hr className="border-gray-300" />

                {/* Study Tags */}
                <SimpleListFilter
                  title="Study Topics"
                  items={Object.entries(stats.tags).map(([tag, count]) => ({
                    id: tag,
                    label: tag,
                    count: count as number
                  }))}
                  selectedIds={selectedTag}
                  onChange={setSelectedTag}
                  defaultCollapsed={true}
                />

                <hr className="border-gray-300" />

                {/* Advanced Filters */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Additional Filters</h3>

                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
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
                  </div>

                  <DateRangeFilter
                    title="Publication Date"
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    defaultCollapsed={false}
                  />
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
              {/* Active Filters Display */}
              {searchQuery && (
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Search:</span>
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                      <span>"{searchQuery}"</span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        aria-label="Clear search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 text-gray-500 hover:text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0m-9.75 0h9.75" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-bold text-gray-900">
                    {articles.length > 0 ? `${articles.length} Research Articles` : 'Search Results'}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetAll}
                    disabled={!hasActiveFilters}
                    className="bg-white border border-gray-300 text-gray-700 px-2 py-1 sm:px-3 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
                    title="Clear all filters"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.48a8.25 8.25 0 1 1-2.427-4.688l1.134-1.134M18 3.375l-.669.669m0 0 1.5 1.5m-1.5-1.5-1.5-1.5m1.5 1.5.669.669" />
                    </svg>
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                  <button
                    onClick={handleExport}
                    className="bg-white border border-gray-300 text-gray-700 px-2 py-1 sm:px-3 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1.5"
                    title="Export results to CSV"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <ResearchInsights
                    articles={articles}
                    searchQuery={searchQuery}
                    selectedFilters={{
                      mutations: selectedMutation,
                      diseases: selectedDisease,
                      treatments: selectedTreatment,
                      tags: selectedTag
                    }}
                    isOpen={isInsightsPanelOpen}
                    onToggleOpen={() => setIsInsightsPanelOpen(!isInsightsPanelOpen)}
                  />
                </div>
              </div>

              <div className="space-y-4 pb-12">
                {!hasActiveFilters && articles.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to explore?</h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                      Select a disease, mutation, or use the <strong>Smart Search</strong> bar above to start browsing the scientific literature.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 text-sm font-semibold">
                        Step 1: Use the search bar
                      </div>
                      <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-100 text-sm font-semibold">
                        Step 2: Apply filters
                      </div>
                    </div>
                  </div>
                ) : paginatedArticles.length > 0 ? (
                  paginatedArticles.map((article) => (
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
                            {article.treatments?.map((t, idx) => (
                              <span
                                key={`${t.code}-${idx}`}
                                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"
                                title={t.type === 'protocol' ? 'Protocol' : 'Drug'}
                              >
                                {t.type === 'protocol' ? '⚕️' : '💊'} {t.name}
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
                          <div className="flex items-center gap-4">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                            >
                              VIEW ON PUBMED
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                              </svg>
                            </a>
                            <span className="text-xs text-gray-400 font-medium">
                              PMID: {article.pubmed_id}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {article.pub_date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">No matching articles found. Try loosening your filters.</p>
                  </div>
                )}

                {/* Pagination Controls - Bottom */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between flex-wrap gap-4 border-t border-gray-200 pt-6 px-2">
                    <button
                      onClick={() => { setResultsPage(p => Math.max(1, p - 1)); scrollToTop(); }}
                      disabled={resultsPage === 1}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          if (page === 1 || page === totalPages) return true
                          if (Math.abs(page - resultsPage) <= 3) return true
                          return false
                        })
                        .map((page, index, array) => {
                          const prevPage = array[index - 1]
                          const showEllipsis = prevPage && page - prevPage > 1

                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                              <button
                                onClick={() => { setResultsPage(page); scrollToTop(); }}
                                className={`min-w-[2.5rem] px-3 py-2 rounded-md text-sm font-medium transition-colors ${resultsPage === page
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                              >
                                {page}
                              </button>
                            </div>
                          )
                        })}
                    </div>

                    <button
                      onClick={() => { setResultsPage(p => Math.min(totalPages, p + 1)); scrollToTop(); }}
                      disabled={resultsPage === totalPages}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
