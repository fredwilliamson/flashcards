import { usePaginatedData } from './usePaginatedData'
import { getAllDecks } from '../services/deck.api'
import type { Deck } from '../types'

export function usePaginatedDecks(backendChunkSize = 40, frontendPageSize = 10) {
  return usePaginatedData<Deck>({
    fetchFn: getAllDecks,
    backendChunkSize,
    frontendPageSize,
  })
}
