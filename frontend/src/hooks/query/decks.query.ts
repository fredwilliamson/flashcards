import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {
    createDeck,
    type Deck,
    type DeckCreate,
    type DeckPatch, deleteDeck,
    getAllDecks,
    getDeckById,
    patchDeck
} from '../../services/api';
import {useToast} from '../../contexts/ToastContext';
import {AxiosError} from 'axios';
import {t} from './utils';

// Query Keys
export const deckKeys = {
    all: ['decks'] as const,
    lists: () => [...deckKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...deckKeys.lists(), {filters}] as const,
    details: () => [...deckKeys.all, 'detail'] as const,
    detail: (id: number) => [...deckKeys.details(), id] as const,
};

// ============= QUERIES =============

/**
 * Hook to fetch all decks
 */
export const useDecks = () => {
    const {showToast} = useToast();

    const {
        data = [],
        isLoading,
        error,
        refetch,
    } = useQuery<Deck[], AxiosError>({
        queryKey: deckKeys.lists(),
        queryFn: async () => {
            return await getAllDecks();
        },
    });

    useEffect(() => {
        if (error) {
            console.error('Failed to load decks:', error);
            showToast(t('errors.loadDecks'), 'error');
        }
    }, [error, showToast]);

    return {
        decks: data,
        hasDecks: !isLoading && data.length > 0,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Hook to fetch a single deck by ID
 */
export const useDeck = (deckId: number | null) => {
    const {showToast} = useToast();

    const {
        data,
        isLoading,
        error,
    } = useQuery<Deck, AxiosError>({
        queryKey: deckKeys.detail(deckId!),
        queryFn: async () => {
            return await getDeckById(deckId!);
        },
        enabled: deckId !== null,
    });

    useEffect(() => {
        if (error) {
            console.error(`Failed to load deck #${deckId}:`, error);
            showToast(t('errors.loadDeck'), 'error');
        }
    }, [error, deckId, showToast]);

    return {
        deck: data,
        isLoading,
        error,
    };
};

// ============= MUTATIONS =============

/**
 * Hook to create a new deck
 */
export const useCreateDeck = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<Deck, AxiosError, DeckCreate>({
        mutationFn: async (newDeck) => {
            return await createDeck(newDeck);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: deckKeys.lists()});
            showToast(t('success.deckCreated', { name: data.name }), 'success');
        },
        onError: (error) => {
            console.error('Failed to create deck:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to update a deck (partial)
 */
export const useUpdateDeck = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<Deck, AxiosError, { id: number; data: DeckPatch }>({
        mutationFn: async ({id, data}) => {
            return  await patchDeck(id, data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: deckKeys.lists()});
            queryClient.invalidateQueries({queryKey: deckKeys.detail(data.id)});
            showToast(t('success.deckUpdated', { name: data.name }), 'success');
        },
        onError: (error) => {
            console.error('Failed to update deck:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to delete a deck
 */
export const useDeleteDeck = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<void, AxiosError, number>({
        mutationFn: async (deckId) => {
            await deleteDeck(deckId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: deckKeys.lists()});
            showToast(t('success.deckDeleted'), 'success');
        },
        onError: (error) => {
            console.error('Failed to delete deck:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

