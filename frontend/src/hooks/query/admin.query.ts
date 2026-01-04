import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {
  type CardDifficulty,
  getAllSessions,
  getDifficultCards,
  getGlobalStats,
  getUserStats,
  type GlobalStats,
  type SessionListItem,
  type UserStats
} from '../../services/api';
import {useToast} from '../../contexts/ToastContext';
import {AxiosError} from 'axios';

// Query Keys
export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  globalStats: () => [...adminKeys.stats(), 'global'] as const,
  userStats: (userId: number) => [...adminKeys.stats(), 'user', userId] as const,
  sessions: () => [...adminKeys.all, 'sessions'] as const,
  sessionsList: (limit?: number) => [...adminKeys.sessions(), { limit }] as const,
  difficultCards: (limit?: number) => [...adminKeys.all, 'difficult-cards', { limit }] as const,
};

// ============= QUERIES =============

/**
 * Hook to fetch global platform statistics
 */
export const useGlobalStats = () => {
  const { showToast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<GlobalStats, AxiosError>({
    queryKey: adminKeys.globalStats(),
    queryFn: getGlobalStats,
  });

  useEffect(() => {
      if (error) {
        console.error('Failed to load global stats:', error);
        showToast(t('errors.loadGlobalStats'), 'error');
      }
  }, [error, showToast]);

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch user-specific statistics
 */
export const useUserStats = (userId: number | null) => {
  const { showToast } = useToast();

  const {
    data,
    isLoading,
    error,
  } = useQuery<UserStats, AxiosError>({
    queryKey: adminKeys.userStats(userId!),
    queryFn: () => getUserStats(userId!),
    enabled: userId !== null,
  });

  useEffect(() => {
      if (error) {
        console.error(`Failed to load stats for user #${userId}:`, error);
        showToast(t('errors.loadUserStats'), 'error');
      }
  }, [error, userId, showToast]);

  return {
    stats: data,
    isLoading,
    error,
  };
};

/**
 * Hook to fetch all game sessions
 */
export const useSessions = (limit: number = 10) => {
  const { showToast } = useToast();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery<SessionListItem[], AxiosError>({
    queryKey: adminKeys.sessionsList(limit),
    queryFn: () => getAllSessions(limit),
  });

  useEffect(() => {
      if (error) {
        console.error('Failed to load sessions:', error);
        showToast(t('errors.loadSessions'), 'error');
      }
  }, [error, showToast]);

  return {
    sessions: data,
    hasSessions: !isLoading && data.length > 0,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to fetch most difficult cards
 */
export const useDifficultCards = (limit: number = 10) => {
  const { showToast } = useToast();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CardDifficulty[], AxiosError>({
    queryKey: adminKeys.difficultCards(limit),
    queryFn: () => getDifficultCards(limit),
  });

  useEffect(() => {
      if (error) {
        console.error('Failed to load difficult cards:', error);
        showToast(t('errors.loadDifficultCards'), 'error');
      }
  }, [error, showToast]);

  return {
    cards: data,
    hasCards: !isLoading && data.length > 0,
    isLoading,
    error,
    refetch,
  };
};

