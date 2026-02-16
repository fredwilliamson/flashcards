import { useState, useMemo, useCallback } from 'react'
import type { SortConfig } from '../components/ui/DataTable'

/**
 * Hook for sorting data arrays, designed to work with DataTable's onSortChange.
 * Sorts the full dataset before pagination slicing, so sorting is global across pages.
 */
export function useDataSort<T>(data: T[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    const key = sortConfig.sortKey || sortConfig.key

    return [...data].sort((a, b) => {
      const aRaw = (a as any)[key]
      const bRaw = (b as any)[key]

      let aValue: any
      let bValue: any

      // Null/undefined always last
      if (aRaw === null || aRaw === undefined) return 1
      if (bRaw === null || bRaw === undefined) return -1

      if (sortConfig.sortType === 'date') {
        aValue = new Date(aRaw).getTime()
        bValue = new Date(bRaw).getTime()
      } else if (sortConfig.sortType === 'number') {
        aValue = parseFloat(aRaw) || 0
        bValue = parseFloat(bRaw) || 0
      } else {
        aValue = String(aRaw).toLowerCase()
        bValue = String(bRaw).toLowerCase()
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const handleSortChange = useCallback((sort: SortConfig | null) => {
    setSortConfig(sort)
  }, [])

  return { sortedData, handleSortChange }
}
