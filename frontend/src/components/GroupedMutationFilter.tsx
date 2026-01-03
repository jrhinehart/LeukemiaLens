import { useState, useMemo, useRef, useEffect } from 'react'

export interface MutationItem {
    gene_symbol: string
    name?: string
    category?: string
    risk_class?: string
    disease_relevance?: string
    count?: number
}

export interface GroupedMutationFilterProps {
    title: string
    items: MutationItem[]
    selectedIds: string[]
    onChange: (selectedIds: string[]) => void
    stats?: Record<string, number>
    defaultCollapsed?: boolean
    maxHeight?: string
}

type GroupingMode = 'category' | 'risk'

const CATEGORY_ORDER = [
    'Fusion',
    'Kinase',
    'Signaling',
    'Epigenetic',
    'Transcription Factor',
    'Splicing',
    'Tumor Suppressor',
    'Metabolic',
    'Cohesin',
    'Other'
]

const RISK_ORDER = ['Favorable', 'Intermediate', 'Adverse']

const RISK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Favorable: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    Intermediate: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    Adverse: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

export const GroupedMutationFilter = ({
    title,
    items,
    selectedIds,
    onChange,
    stats = {},
    defaultCollapsed = false,
    maxHeight = '28rem'
}: GroupedMutationFilterProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [searchTerm, setSearchTerm] = useState('')
    const [groupingMode, setGroupingMode] = useState<GroupingMode>('category')
    const [showTooltip, setShowTooltip] = useState(false)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    const tooltipRef = useRef<HTMLDivElement>(null)

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                setShowTooltip(false)
            }
        }
        if (showTooltip) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showTooltip])

    // Enrich items with counts
    const enrichedItems = useMemo(() =>
        items.map(item => ({
            ...item,
            count: stats[item.gene_symbol] || 0
        }))
        , [items, stats])

    // Filter items by search
    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return enrichedItems
        const query = searchTerm.toLowerCase()
        return enrichedItems.filter(item =>
            item.gene_symbol.toLowerCase().includes(query) ||
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.category && item.category.toLowerCase().includes(query))
        )
    }, [enrichedItems, searchTerm])

    // Group items by the selected mode
    const groupedItems = useMemo(() => {
        const groups: Record<string, MutationItem[]> = {}

        filteredItems.forEach(item => {
            let key: string
            if (groupingMode === 'category') {
                key = item.category || 'Other'
            } else {
                key = item.risk_class || 'Unclassified'
            }
            if (!groups[key]) groups[key] = []
            groups[key].push(item)
        })

        // Sort groups by predefined order
        const order = groupingMode === 'category' ? CATEGORY_ORDER : [...RISK_ORDER, 'Unclassified']
        const sortedGroups: [string, MutationItem[]][] = []

        order.forEach(key => {
            if (groups[key]) {
                sortedGroups.push([key, groups[key]])
            }
        })

        // Add any remaining groups not in order
        Object.keys(groups).forEach(key => {
            if (!order.includes(key)) {
                sortedGroups.push([key, groups[key]])
            }
        })

        return sortedGroups
    }, [filteredItems, groupingMode])

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(selectedId => selectedId !== id))
        } else {
            onChange([...selectedIds, id])
        }
    }

    const toggleGroup = (groupName: string) => {
        const newExpanded = new Set(expandedGroups)
        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName)
        } else {
            newExpanded.add(groupName)
        }
        setExpandedGroups(newExpanded)
    }

    // Expand all groups when searching
    useEffect(() => {
        if (searchTerm.trim()) {
            setExpandedGroups(new Set(groupedItems.map(([name]) => name)))
        }
    }, [searchTerm, groupedItems])

    return (
        <div>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1 hover:text-gray-700 transition-colors"
                aria-expanded={!isCollapsed}
            >
                <div className="flex items-center gap-2">
                    <span>{title}</span>
                    {selectedIds.length > 0 && isCollapsed && (
                        <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                            {selectedIds.length}
                        </span>
                    )}
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {!isCollapsed && (
                <div>
                    {/* Toggle and Help */}
                    <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex items-center bg-gray-100 rounded-md p-0.5">
                            <button
                                onClick={() => setGroupingMode('category')}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${groupingMode === 'category'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Category
                            </button>
                            <button
                                onClick={() => setGroupingMode('risk')}
                                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${groupingMode === 'risk'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                ELN Risk
                            </button>
                        </div>

                        {/* Help Button */}
                        <div className="relative" ref={tooltipRef}>
                            <button
                                onClick={() => setShowTooltip(!showTooltip)}
                                className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                aria-label="Help"
                                title="Learn about grouping options"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                                </svg>
                            </button>

                            {/* Tooltip */}
                            {showTooltip && (
                                <div className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-700" style={{ width: '240px', marginTop: '4px', marginLeft: '-200px' }}>
                                    <p className="font-semibold text-gray-900 mb-2">Grouping Options</p>
                                    <p className="mb-2">
                                        <span className="font-medium">Category:</span> Groups by biological function (Kinase, Epigenetic, Fusion, etc.)
                                    </p>
                                    <p>
                                        <span className="font-medium">ELN Risk:</span> Groups by ELN 2022 AML risk (Favorable, Intermediate, Adverse)
                                    </p>
                                    <button
                                        onClick={() => setShowTooltip(false)}
                                        className="mt-2 text-blue-600 hover:underline text-xs"
                                    >
                                        Got it
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="mb-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search mutations..."
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        />
                    </div>

                    {/* Grouped List */}
                    <div
                        className="space-y-2 overflow-y-auto custom-scrollbar pr-1"
                        style={{ maxHeight }}
                    >
                        {groupedItems.map(([groupName, groupItems]) => {
                            const isExpanded = expandedGroups.has(groupName)
                            const selectedInGroup = groupItems.filter(i => selectedIds.includes(i.gene_symbol)).length
                            const riskColors = groupingMode === 'risk' && RISK_COLORS[groupName]

                            return (
                                <div key={groupName} className={`rounded-md border ${riskColors ? riskColors.border : 'border-gray-200'}`}>
                                    {/* Group Header */}
                                    <button
                                        onClick={() => toggleGroup(groupName)}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${riskColors
                                            ? `${riskColors.bg} ${riskColors.text}`
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={2}
                                                stroke="currentColor"
                                                className={`w-3 h-3 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                            </svg>
                                            <span>{groupName}</span>
                                            <span className="text-gray-400">({groupItems.length})</span>
                                        </div>
                                        {selectedInGroup > 0 && (
                                            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                {selectedInGroup}
                                            </span>
                                        )}
                                    </button>

                                    {/* Group Items */}
                                    {isExpanded && (
                                        <div className="p-1 space-y-0.5">
                                            {groupItems.map(item => {
                                                const isSelected = selectedIds.includes(item.gene_symbol)
                                                return (
                                                    <button
                                                        key={item.gene_symbol}
                                                        onClick={() => handleToggle(item.gene_symbol)}
                                                        className={`w-full text-left px-3 py-1.5 rounded text-sm font-medium transition-colors flex justify-between items-center ${isSelected
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <span className="truncate">{item.gene_symbol}</span>
                                                        <div className="flex items-center gap-2">
                                                            {item.count !== undefined && item.count > 0 && (
                                                                <span
                                                                    className={`text-xs py-0.5 px-1.5 rounded-full ${isSelected
                                                                        ? 'bg-blue-500 text-white'
                                                                        : 'bg-gray-200 text-gray-600'
                                                                        }`}
                                                                >
                                                                    {item.count}
                                                                </span>
                                                            )}
                                                            {isSelected && (
                                                                <span className="text-xs font-bold">✕</span>
                                                            )}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {groupedItems.length === 0 && (
                            <p className="text-xs text-gray-400 px-3 py-2">
                                {searchTerm ? 'No matching mutations found.' : 'No mutations available.'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
