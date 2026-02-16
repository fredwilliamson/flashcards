import { useState, useEffect, useRef, useCallback } from 'react'
import type { PaginatedResponse } from '../types'

interface UsePaginatedDataOptions<T> {
  fetchFn: (limit: number, offset: number) => Promise<PaginatedResponse<T>>
  backendChunkSize?: number  // How many items to fetch from backend at once (default: 40)
  frontendPageSize?: number  // How many items to display per page (default: 10)
}

export function usePaginatedData<T>({
  fetchFn,
  backendChunkSize = 40,
  frontendPageSize = 10,
}: UsePaginatedDataOptions<T>) {
  const [allData, setAllData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [frontendPageIndex, setFrontendPageIndex] = useState(0)
  const loadingRef = useRef(false)

  // Stable loadData function
  const loadData = useCallback(async (offset: number) => {
    if (loadingRef.current) return
    
    loadingRef.current = true
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetchFn(backendChunkSize, offset)
      
      setTotal(response.total)
      
      // Accumulate data
      setAllData((prev) => {
        const newData = [...prev]
        response.items.forEach((item, index) => {
          newData[offset + index] = item
        })
        return newData
      })
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [fetchFn, backendChunkSize])

  // Initial load
  useEffect(() => {
    loadData(0)
  }, [loadData])

  // Check if we need to load more data when page changes
  const loadMoreIfNeeded = useCallback((newPageIndex: number) => {
    setFrontendPageIndex(newPageIndex)
    
    const startIndex = newPageIndex * frontendPageSize
    const endIndex = startIndex + frontendPageSize
    
    // Check if we have data for this page
    const hasData = allData.slice(startIndex, endIndex).every(item => item !== undefined)
    
    if (!hasData && startIndex < total) {
      // Calculate which chunk to load
      const chunkIndex = Math.floor(startIndex / backendChunkSize)
      const offset = chunkIndex * backendChunkSize
      
      // Only load if we haven't loaded this chunk yet
      if (offset >= allData.length || allData[offset] === undefined) {
        loadData(offset)
      }
    }
  }, [allData, total, frontendPageSize, backendChunkSize, loadData])

  // Get current page data
  const startIndex = frontendPageIndex * frontendPageSize
  const currentPageData = allData.slice(startIndex, startIndex + frontendPageSize).filter(item => item !== undefined)

  // Calculate total pages
  const totalPages = Math.ceil(total / frontendPageSize)

  return {
    data: currentPageData,
    allData,
    total,
    isLoading,
    error,
    frontendPageIndex,
    frontendPageSize,
    totalPages,
    loadMoreIfNeeded,
    setFrontendPageIndex,
  }
}
