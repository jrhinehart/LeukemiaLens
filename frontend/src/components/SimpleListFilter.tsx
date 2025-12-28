import { useState } from 'react'

export interface SimpleListFilterItem {
    id: string
    label: string
    description?: string  // Optional secondary text in smaller, lighter font
    count?: number
}

export interface SimpleListFilterProps {
    title: string
    items: SimpleListFilterItem[]
    selectedIds: string[]
    onChange: (selectedIds: string[]) => void
    defaultCollapsed?: boolean
}

export const SimpleListFilter = ({
    title,
    items,
    selectedIds,
    onChange,
    defaultCollapsed = false
}: SimpleListFilterProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

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
                <div className="space-y-1">
                    {items.map(item => {
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
                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                    <span className="flex-shrink-0">{item.label}</span>
                                    {item.description && (
                                        <span className={`text-xs truncate flex-1 min-w-0 ${isSelected ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-500'
                                            }`}>{item.description}</span>
                                    )}
                                </div>
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
                                        <span className="text-xs font-bold hover:text-blue-200 flex-shrink-0">✕</span>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                    {items.length === 0 && (
                        <p className="text-xs text-gray-400 px-3 py-2">No items found.</p>
                    )}
                </div>
            )}
        </div>
    )
}
