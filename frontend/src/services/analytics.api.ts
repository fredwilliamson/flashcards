import api from './api'
import type {
  UserProgressStats,
  UserDeckCardsResponse,
  DeckAnalyticsStats,
} from '../types'

/**
 * Get user progress across all decks
 */
export async function getUserProgress(userId: number): Promise<UserProgressStats> {
  const response = await api.get<UserProgressStats>(`/analytics/users/${userId}/progress`)
  return response.data
}

/**
 * Get user progress on individual cards within a deck
 */
export async function getUserDeckCards(
  userId: number,
  deckId: number,
  limit: number = 40,
  offset: number = 0
): Promise<UserDeckCardsResponse> {
  const response = await api.get<UserDeckCardsResponse>(
    `/analytics/users/${userId}/decks/${deckId}/cards?limit=${limit}&offset=${offset}`
  )
  return response.data
}

/**
 * Get analytics for a specific deck
 */
export async function getDeckAnalytics(deckId: number): Promise<DeckAnalyticsStats> {
  const response = await api.get<DeckAnalyticsStats>(`/analytics/decks/${deckId}/analytics`)
  return response.data
}



