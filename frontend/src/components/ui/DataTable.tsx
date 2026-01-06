import { ReactNode, useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { Button } from './Button'

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => ReactNode
  sortable?: boolean
  sortKey?: string // Key to use for sorting (if different from display key)
  sortType?: 'string' | 'number' | 'date' // Type of data for smart sorting
}

export interface PaginationInfo {
  total: number
  limit: number
  offset: number
  onPageChange: (offset: number) => void
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
  isLoading?: boolean
  pagination?: PaginationInfo
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  isLoading = false,
  pagination,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Smart sorting function
  const getSortValue = (item: any, column: Column<T>) => {
    const key = column.sortKey || column.key
    const value = item[key]

    // Handle null/undefined
    if (value === null || value === undefined) return ''

    // Handle dates (ISO string format)
    if (column.sortType === 'date') {
      return new Date(value).getTime()
    }

    // Handle numbers
    if (column.sortType === 'number') {
      return parseFloat(value) || 0
    }

    // Default: string (case-insensitive)
    return String(value).toLowerCase()
  }

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    const sorted = [...data].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key)
      if (!column) return 0

      const aValue = getSortValue(a, column)
      const bValue = getSortValue(b, column)

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    return sorted
  }, [data, sortConfig, columns])

  const handleSort = (columnKey: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { key: columnKey, direction: 'desc' }
      }
      return null // Remove sort
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  const currentPage = pagination ? Math.floor(pagination.offset / pagination.limit) + 1 : 1
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1
  const hasNextPage = pagination ? pagination.offset + pagination.limit < pagination.total : false
  const hasPrevPage = pagination ? pagination.offset > 0 : false

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="inline-flex">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} sur {totalPages} ({pagination.total} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.offset - pagination.limit)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.offset + pagination.limit)}
              disabled={!hasNextPage}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


