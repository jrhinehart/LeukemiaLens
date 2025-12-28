import { useEffect, useState } from 'react'

export interface TextSearchFilterProps {
    value: string
    onChange: (value: string) => void
    onSearch?: () => void
    placeholder?: string
    debounceMs?: number
    isLoading?: boolean
}

export const TextSearchFilter = ({
    value,
    onChange,
    onSearch,
    placeholder = 'Search...',
    debounceMs = 0,
    isLoading = false
}: TextSearchFilterProps) => {
    const [localValue, setLocalValue] = useState(value)

    // Sync local value with prop value
    useEffect(() => {
        setLocalValue(value)
    }, [value])

    // Handle debounced onChange
    useEffect(() => {
        if (debounceMs > 0) {
            const timeoutId = setTimeout(() => {
                onChange(localValue)
            }, debounceMs)
            return () => clearTimeout(timeoutId)
        }
    }, [localValue, debounceMs, onChange])

    const handleChange = (newValue: string) => {
        setLocalValue(newValue)
        if (debounceMs === 0) {
            onChange(newValue)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onSearch) {
            onSearch()
        }
    }

    const handleClear = () => {
        setLocalValue('')
        onChange('')
    }

    return (
        <div className="relative">
            <input
                type="text"
                placeholder={placeholder}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
            />

            {/* Loading Spinner or Search Icon */}
            <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                {localValue && (
                    <button
                        onClick={handleClear}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                        title="Clear"
                        aria-label="Clear search"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {isLoading ? (
                    <div className="p-1">
                        <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : onSearch ? (
                    <button
                        onClick={onSearch}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Search"
                        aria-label="Search"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </button>
                ) : null}
            </div>
        </div>
    )
}
