import { useState } from 'react'

export interface DateRangeFilterProps {
    title: string
    startDate: string
    endDate: string
    onStartDateChange: (date: string) => void
    onEndDateChange: (date: string) => void
    defaultCollapsed?: boolean
    yearOnly?: boolean
}

export const DateRangeFilter = ({
    title,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    defaultCollapsed = false
}: DateRangeFilterProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

    const hasActiveRange = startDate || endDate

    return (
        <div>
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1 hover:text-gray-700 transition-colors"
                aria-expanded={!isCollapsed}
            >
                <span>{title}</span>
                <div className="flex items-center gap-2">
                    {hasActiveRange && !isCollapsed && (
                        <span className="text-xs font-normal normal-case text-blue-600">
                            {startDate || '...'} - {endDate || '...'}
                        </span>
                    )}
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
                </div>
            </button>

            {!isCollapsed && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => onStartDateChange(e.target.value)}
                                placeholder="2015-01-01"
                                min="2000-01-01"
                                max={new Date().toISOString().split('T')[0]}
                                className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                                onFocus={(e) => {
                                    // Set default date when picker opens if no value is set
                                    if (!startDate) {
                                        e.target.defaultValue = '2015-01-01';
                                    }
                                }}
                            />
                            {startDate && (
                                <button
                                    onClick={() => onStartDateChange('')}
                                    className="px-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear start date"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => onEndDateChange(e.target.value)}
                                min="2000-01-01"
                                max={new Date().toISOString().split('T')[0]}
                                className="flex-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                                onFocus={(e) => {
                                    // Set default date when picker opens if no value is set
                                    if (!endDate) {
                                        e.target.defaultValue = new Date().toISOString().split('T')[0];
                                    }
                                }}
                            />
                            {endDate && (
                                <button
                                    onClick={() => onEndDateChange('')}
                                    className="px-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear end date"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {hasActiveRange && (
                        <button
                            onClick={() => {
                                onStartDateChange('')
                                onEndDateChange('')
                            }}
                            className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium mt-2"
                        >
                            Clear Date Range
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
