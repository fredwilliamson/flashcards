import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {
    type CardCreate,
    type CardPatch,
    type Card,
    type CSVImportResponse,
    getAllCards,
    getCardById,
    getCardsByDeck,
    createCard,
    patchCard, 
    deleteCard,
    deleteAllDeckCards,
    importCardCSV
} from '../../services/api';
import {useToast} from '../../contexts/ToastContext';
import {AxiosError} from 'axios';
import {t} from './utils';

// Query Keys
export const cardKeys = {
    all: ['cards'] as const,
    lists: () => [...cardKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...cardKeys.lists(), {filters}] as const,
    byDeck: (deckId: number) => [...cardKeys.all, 'deck', deckId] as const,
    details: () => [...cardKeys.all, 'detail'] as const,
    detail: (id: number) => [...cardKeys.details(), id] as const,
};

// ============= QUERIES =============

/**
 * Hook to fetch all cards
 */
export const useCards = () => {
    const {showToast} = useToast();

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<Card[], AxiosError>({
        queryKey: cardKeys.lists(),
        queryFn: async () => {
            const response = await getAllCards(40, 0);
            return response.items;
        },
    });

    useEffect(() => {
        if (error) {
            console.error('Failed to load cards:', error);
            showToast(t('errors.loadCards'), 'error');
        }
    }, [error, showToast]);

    return {
        cards: data || [],
        hasCards: !isLoading && (data?.length ?? 0) > 0,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Hook to fetch cards by deck
 */
export const useCardsByDeck = (deckId: number | null) => {
    const {showToast} = useToast();

    const {
        data = [],
        isLoading,
        error,
        refetch,
    } = useQuery<Card[], AxiosError>({
        queryKey: cardKeys.byDeck(deckId!),
        queryFn: () => getCardsByDeck(deckId!),
        enabled: deckId !== null,
    });

    useEffect(() => {
        if (error) {
            console.error(`Failed to load cards for deck #${deckId}:`, error);
            showToast(t('errors.loadCards'), 'error');
        }
    }, [error, deckId, showToast]);

    return {
        cards: data,
        hasCards: !isLoading && data.length > 0,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Hook to fetch a single card by ID
 */
export const useCard = (cardId: number | null) => {
    const {showToast} = useToast();

    const {
        data,
        isLoading,
        error,
    } = useQuery<Card, AxiosError>({
        queryKey: cardKeys.detail(cardId!),
        queryFn: async () => {
            return await getCardById(cardId!);
        },
        enabled: cardId !== null,
    });

    useEffect(() => {
        if (error) {
            console.error(`Failed to load card #${cardId}:`, error);
            showToast(t('errors.loadCard'), 'error');
        }
    }, [error, cardId, showToast]);

    return {
        card: data,
        isLoading,
        error,
    };
};

// ============= MUTATIONS =============

/**
 * Hook to create a new card
 */
export const useCreateCard = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<Card, AxiosError, CardCreate>({
        mutationFn: async (newCard) => {
            return await createCard(newCard);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: cardKeys.lists()});
            queryClient.invalidateQueries({queryKey: cardKeys.byDeck(data.deck_id)});
            showToast(t('success.cardCreated'), 'success');
        },
        onError: (error) => {
            console.error('Failed to create card:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to update a card (partial)
 */
export const useUpdateCard = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<Card, AxiosError, { id: number; data: CardPatch }>({
        mutationFn: async ({id, data}) => {
            return await patchCard(id, data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: cardKeys.lists()});
            queryClient.invalidateQueries({queryKey: cardKeys.byDeck(data.deck_id)});
            queryClient.invalidateQueries({queryKey: cardKeys.detail(data.id)});
            showToast(t('success.cardUpdated'), 'success');
        },
        onError: (error) => {
            console.error('Failed to update card:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to delete a card
 */
export const useDeleteCard = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<void, AxiosError, { id: number; deckId: number }>({
        mutationFn: async ({id}) => {
            await deleteCard(id);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({queryKey: cardKeys.lists()});
            queryClient.invalidateQueries({queryKey: cardKeys.byDeck(variables.deckId)});
            showToast(t('success.cardDeleted'), 'success');
        },
        onError: (error) => {
            console.error('Failed to delete card:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to delete all cards in a deck
 */
export const useDeleteAllDeckCards = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<void, AxiosError, number>({
        mutationFn: async (deckId) => {
            await deleteAllDeckCards(deckId);
        },
        onSuccess: (_, deckId) => {
            queryClient.invalidateQueries({queryKey: cardKeys.lists()});
            queryClient.invalidateQueries({queryKey: cardKeys.byDeck(deckId)});
            showToast(t('success.allCardsDeleted'), 'success');
        },
        onError: (error) => {
            console.error('Failed to delete all cards:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to import cards from CSV
 */
export const useImportCSV = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<CSVImportResponse, AxiosError, { deckId: number; file: File }>({
        mutationFn: async ({deckId, file}) => {
            const response = await importCardCSV(deckId, file);
            return response;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({queryKey: cardKeys.byDeck(variables.deckId)});
            const created = data.created_count || 0;
            const failed = data.error_count || 0;
            if (failed > 0) {
                showToast(t('success.csvImportedWithErrors', { created, failed }), 'success');
            } else {
                showToast(t('success.csvImported', { count: created }), 'success');
            }
        },
        onError: (error) => {
            console.error('Failed to import CSV:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

