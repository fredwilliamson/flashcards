import { useMemo, useState } from 'react'

interface UsePaginatedSearchOptions<T> {
  items: T[]
  searchFields: (item: T) => string[]
  initialItemsPerPage?: number
  sortFn?: (a: T, b: T) => number
}

export function usePaginatedSearch<T>({
  items,
  searchFields,
  initialItemsPerPage = 20,
  sortFn,
}: UsePaginatedSearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  // Sort items if sortFn provided
  const sortedItems = useMemo(() => {
    if (!sortFn) return items
    return [...items].sort(sortFn)
  }, [items, sortFn])

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (searchQuery === '') return sortedItems

    const lowerQuery = searchQuery.toLowerCase()
    return sortedItems.filter((item) => {
      const fields = searchFields(item)
      return fields.some((field) => field.toLowerCase().includes(lowerQuery))
    })
  }, [sortedItems, searchQuery, searchFields])

  // Paginate filtered items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredItems.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredItems, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  // Reset to page 1 when search query or items per page changes
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, itemsPerPage])

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    filteredItems,
    paginatedItems,
    totalPages,
    totalItems: filteredItems.length,
  }
}

