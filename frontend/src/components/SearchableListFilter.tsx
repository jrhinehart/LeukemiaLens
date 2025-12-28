import { useState, useMemo } from 'react'

export interface SearchableListFilterItem {
    id: string
    label: string
    count?: number
}

export interface SearchableListFilterProps {
    title: string
    items: SearchableListFilterItem[]
    selectedIds: string[]
    onChange: (selectedIds: string[]) => void
    defaultCollapsed?: boolean
    searchPlaceholder?: string
    maxHeight?: string
}

export const SearchableListFilter = ({
    title,
    items,
    selectedIds,
    onChange,
    defaultCollapsed = false,
    searchPlaceholder = 'Search...',
    maxHeight = '24rem'
}: SearchableListFilterProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items
        const query = searchTerm.toLowerCase()
        return items.filter(item =>
            item.label.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query)
        )
    }, [items, searchTerm])

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(selectedId => selectedId !== id))
        } else {
            onChange([...selectedIds, id])
        }
    }

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
                    {/* Search Input */}
                    <div className="mb-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        />
                    </div>

                    {/* Scrollable List */}
                    <div
                        className="space-y-1 overflow-y-auto custom-scrollbar pr-1"
                        style={{ maxHeight }}
                    >
                        {filteredItems.map(item => {
                            const isSelected = selectedIds.includes(item.id)
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleToggle(item.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex justify-between items-center group ${isSelected
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                                        }`}
                                >
                                    <span className="truncate">{item.label}</span>
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
                                            <span className="text-xs font-bold hover:text-blue-200">✕</span>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                        {filteredItems.length === 0 && (
                            <p className="text-xs text-gray-400 px-3 py-2">
                                {searchTerm ? 'No matching items found.' : 'No items found.'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
