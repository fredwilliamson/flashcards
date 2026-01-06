import { ReactNode } from 'react'

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

interface FilterBarProps {
  filters: FilterConfig[]
  children?: ReactNode
}

export default function FilterBar({ filters, children }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <label
            htmlFor={filter.key}
            className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
          >
            {filter.label}:
          </label>
          <select
            id={filter.key}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {children}
    </div>
  )
}



