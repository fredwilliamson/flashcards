import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems?: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 20],
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems || 0)

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
        {totalItems !== undefined && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {startItem}-{endItem} of {totalItems}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage + 1} of {totalPages || 1}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
