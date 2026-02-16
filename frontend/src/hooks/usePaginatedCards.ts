import { usePaginatedData } from './usePaginatedData'
import { getAllCards } from '../services/card.api'
import type { Card } from '../types'

export function usePaginatedCards(backendChunkSize = 40, frontendPageSize = 10) {
  return usePaginatedData<Card>({
    fetchFn: getAllCards,
    backendChunkSize,
    frontendPageSize,
  })
}
