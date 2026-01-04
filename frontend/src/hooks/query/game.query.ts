import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {
    type GameSessionStart,
    type GameSessionResponse,
    type NextCardResponse,
    type AnswerSubmit,
    type AnswerResponse,
    type SessionStatsResponse, getNextCard, getSessionStats, startGameSession, submitAnswer, completeGameSession
} from '../../services/api';
import {useToast} from '../../contexts/ToastContext';
import {AxiosError} from 'axios';
import {t} from './utils';

// Query Keys
export const gameKeys = {
    all: ['game'] as const,
    sessions: () => [...gameKeys.all, 'sessions'] as const,
    session: (id: number) => [...gameKeys.sessions(), id] as const,
    sessionStats: (id: number) => [...gameKeys.session(id), 'stats'] as const,
    nextCard: (id: number) => [...gameKeys.session(id), 'next-card'] as const,
};

// ============= QUERIES =============

/**
 * Hook to fetch next card in a game session
 */
export const useNextCard = (sessionId: number | null) => {
    const {showToast} = useToast();

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<NextCardResponse, AxiosError>({
        queryKey: gameKeys.nextCard(sessionId!),
        queryFn: async () => {
            return await getNextCard(sessionId!);
        },
        enabled: sessionId !== null,
    });

    useEffect(() => {
        if (error) {
            console.error('Failed to load next card:', error);
            showToast(t('errors.loadNextCard'), 'error');
        }
    }, [error, showToast]);

    return {
        card: data,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Hook to fetch session statistics
 */
export const useSessionStats = (sessionId: number | null) => {
    const {showToast} = useToast();

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<SessionStatsResponse, AxiosError>({
        queryKey: gameKeys.sessionStats(sessionId!),
        queryFn: async () => {
            return await getSessionStats(sessionId!);
        },
        enabled: sessionId !== null,
    });

    useEffect(() => {
        if (error) {
            console.error('Failed to load session stats:', error);
            showToast(t('errors.loadSessionStats'), 'error');
        }
    }, [error, showToast]);

    return {
        stats: data,
        isLoading,
        error,
        refetch,
    };
};

// ============= MUTATIONS =============

/**
 * Hook to start a new game session
 */
export const useStartSession = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<GameSessionResponse, AxiosError, GameSessionStart>({
        mutationFn: async (sessionData) => {
            return await startGameSession(sessionData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: gameKeys.sessions()});
            showToast(t('success.gameStarted'), 'success');
        },
        onError: (error) => {
            console.error('Failed to start game session:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to submit an answer
 */
export const useSubmitAnswer = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<AnswerResponse, AxiosError, { sessionId: number; answer: AnswerSubmit }>({
        mutationFn: async ({sessionId, answer}) => {
            return await submitAnswer(sessionId, answer);
        },
        onSuccess: (data, variables) => {
            // Only invalidate stats, not the card (we still need to show feedback)
            queryClient.invalidateQueries({queryKey: gameKeys.sessionStats(variables.sessionId)});

            if (data.is_correct) {
                showToast(t('success.answerCorrect'), 'success');
            } else {
                showToast(t('success.answerIncorrect'), 'error');
            }
        },
        onError: (error) => {
            console.error('Failed to submit answer:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to complete a game session
 */
export const useCompleteSession = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<SessionStatsResponse, AxiosError, number>({
        mutationFn: async (sessionId) => {
            return await completeGameSession(sessionId);
        },
        onSuccess: (_data, sessionId) => {
            queryClient.invalidateQueries({queryKey: gameKeys.sessions()});
            queryClient.invalidateQueries({queryKey: gameKeys.session(sessionId)});
            showToast(t('success.sessionCompleted'), 'success');
        },
        onError: (error) => {
            console.error('Failed to complete session:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

