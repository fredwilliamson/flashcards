import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  UserProgressStats,
  UserDeckCardsResponse,
  DeckAnalyticsStats,
} from '../../types'
import api from '../../services/api'

/**
 * Query keys for analytics
 */
export const analyticsKeys = {
  all: ['analytics'] as const,
  userProgress: (userId: number) => [...analyticsKeys.all, 'user', userId, 'progress'] as const,
  userDeckCards: (userId: number, deckId: number) =>
    [...analyticsKeys.all, 'user', userId, 'deck', deckId, 'cards'] as const,
  deckAnalytics: (deckId: number) => [...analyticsKeys.all, 'deck', deckId, 'analytics'] as const,
}

/**
 * Get user progress across all decks
 */
export const useUserProgress = (userId: number) => {
  return useQuery<UserProgressStats, AxiosError>({
    queryKey: analyticsKeys.userProgress(userId),
    queryFn: async () => {
      const { data } = await api.get<UserProgressStats>(`/analytics/users/${userId}/progress`)
      return data
    },
    enabled: !!userId,
  })
}

/**
 * Get user progress on individual cards within a deck
 */
export const useUserDeckCards = (userId: number, deckId: number) => {
  return useQuery<UserDeckCardsResponse, AxiosError>({
    queryKey: analyticsKeys.userDeckCards(userId, deckId),
    queryFn: async () => {
      const { data } = await api.get<UserDeckCardsResponse>(
        `/analytics/users/${userId}/decks/${deckId}/cards`
      )
      return data
    },
    enabled: !!userId && !!deckId,
  })
}

/**
 * Get analytics for a specific deck
 */
export const useDeckAnalytics = (deckId: number) => {
  return useQuery<DeckAnalyticsStats, AxiosError>({
    queryKey: analyticsKeys.deckAnalytics(deckId),
    queryFn: async () => {
      const { data } = await api.get<DeckAnalyticsStats>(`/analytics/decks/${deckId}/analytics`)
      return data
    },
    enabled: !!deckId,
  })
}
