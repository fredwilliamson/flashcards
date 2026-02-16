import { useState, useEffect, useRef, useCallback } from 'react'
import { getUserDeckCards } from '../services/analytics.api'
import type { UserDeckCardsResponse } from '../types'

export function usePaginatedUserDeckCards(userId: number, deckId: number, initialPageSize = 10) {
  const [allCards, setAllCards] = useState<any[]>([])
  const [metadata, setMetadata] = useState<Omit<UserDeckCardsResponse, 'cards'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [frontendPageIndex, setFrontendPageIndex] = useState(0)
  const [frontendPageSize, setFrontendPageSize] = useState(initialPageSize)
  const loadingRef = useRef(false)
  const BACKEND_CHUNK_SIZE = 40

  const loadData = useCallback(async (offset: number) => {
    if (loadingRef.current) return
    
    loadingRef.current = true
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getUserDeckCards(userId, deckId, BACKEND_CHUNK_SIZE, offset)
      
      // On first load, set metadata
      if (offset === 0) {
        setMetadata({
          user_id: response.user_id,
          username: response.username,
          deck_id: response.deck_id,
          deck_name: response.deck_name,
          mastered_count: response.mastered_count,
          total_count: response.total_count,
          avg_success_rate: response.avg_success_rate,
          last_activity: response.last_activity,
          limit: response.limit,
          offset: response.offset,
          total_cards: response.total_cards,
        })
      }
      
      // Accumulate cards in memory
      setAllCards((prev) => {
        const newCards = [...prev]
        response.cards.forEach((card, index) => {
          newCards[offset + index] = card
        })
        return newCards
      })
      
      // If there's more data, load it automatically
      if (response.offset + response.cards.length < response.total_cards) {
        loadingRef.current = false // allow recursive loadData to run
        await loadData(offset + BACKEND_CHUNK_SIZE)
      }
    } catch (err) {
      console.error('Error loading user deck cards:', err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
      loadingRef.current = false
    }
  }, [userId, deckId])

  // Initial load
  useEffect(() => {
    setAllCards([])
    setMetadata(null)
    setFrontendPageIndex(0)
    loadData(0)
  }, [loadData])

  // Check if we need to load more data when page changes
  const loadMoreIfNeeded = useCallback((newPageIndex: number) => {
    setFrontendPageIndex(newPageIndex)
    
    const startIndex = newPageIndex * frontendPageSize
    const endIndex = startIndex + frontendPageSize
    
    // Check if we have data for this page
    const hasData = allCards.slice(startIndex, endIndex).every(item => item !== undefined)
    
    if (!hasData && metadata && startIndex < metadata.total_cards) {
      // Calculate which chunk to load
      const chunkIndex = Math.floor(startIndex / BACKEND_CHUNK_SIZE)
      const offset = chunkIndex * BACKEND_CHUNK_SIZE
      
      // Only load if we haven't loaded this chunk yet
      if (offset >= allCards.length || allCards[offset] === undefined) {
        loadData(offset)
      }
    }
  }, [allCards, metadata, frontendPageSize, loadData])

  // Get current page data
  const startIndex = frontendPageIndex * frontendPageSize
  const currentPageData = allCards.slice(startIndex, startIndex + frontendPageSize).filter(item => item !== undefined)

  // Calculate total pages
  const totalPages = metadata ? Math.ceil(metadata.total_cards / frontendPageSize) : 0

  return {
    cards: currentPageData,
    allCards,
    metadata,
    isLoading,
    error,
    frontendPageIndex,
    frontendPageSize,
    totalPages,
    loadMoreIfNeeded,
    setFrontendPageIndex,
    setFrontendPageSize: (newSize: number) => {
      setFrontendPageSize(newSize)
      setFrontendPageIndex(0) // Reset to first page when changing page size
    },
  }
}
