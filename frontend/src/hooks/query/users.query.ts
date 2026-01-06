import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from 'react';
import {
    createUser, deleteUser,
    getAllUsers,
    getUserById,
    patchUser,
    changePassword,
    type User,
    type UserCreate,
    type UserPatch,
    type ChangePasswordRequest,
    type ChangePasswordResponse
} from '../../services/api';
import {useToast} from '../../contexts/ToastContext';
import {AxiosError} from 'axios';
import {t} from './utils';

// Query Keys
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...userKeys.lists(), {filters}] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: number) => [...userKeys.details(), id] as const,
};

// ============= QUERIES =============

/**
 * Hook to fetch all users (Admin only)
 */
export const useUsers = () => {
    const {showToast} = useToast();

    const {
        data = [],
        isLoading,
        error,
        refetch,
    } = useQuery<User[], AxiosError>({
        queryKey: userKeys.lists(),
        queryFn: async () => {
            return await getAllUsers();
        },
    });

    useEffect(() => {
        if (error) {
            console.error('Failed to load users:', error);
            showToast(t('errors.loadUsers'), 'error');
        }
    }, [error, showToast]);

    return {
        users: data,
        hasUsers: !isLoading && data.length > 0,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Hook to fetch a single user by ID
 */
export const useUser = (userId: number | null) => {
    const {showToast} = useToast();

    const {
        data,
        isLoading,
        error,
    } = useQuery<User, AxiosError>({
        queryKey: userKeys.detail(userId!),
        queryFn: async () => {
            return await getUserById(userId!);
        },
        enabled: userId !== null,
    });

    useEffect(() => {
        if (error) {
            console.error(`Failed to load user #${userId}:`, error);
            showToast(t('errors.loadUser'), 'error');
        }
    }, [error, userId, showToast]);

    return {
        user: data,
        isLoading,
        error,
    };
};

// ============= MUTATIONS =============

/**
 * Hook to create a new user (Admin only)
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<User, AxiosError, UserCreate>({
        mutationFn: async (newUser) => {
            return await createUser(newUser);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: userKeys.lists()});
            showToast(t('success.userCreated', { name: data.username }), 'success');
        },
        onError: (error) => {
            console.error('Failed to create user:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to update a user (partial)
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<User, AxiosError, { id: number; data: UserPatch }>({
        mutationFn: async ({id, data}) => {
            return await patchUser(id, data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: userKeys.lists()});
            queryClient.invalidateQueries({queryKey: userKeys.detail(data.id)});
            showToast(t('success.userUpdated', { name: data.username }), 'success');
        },
        onError: (error) => {
            console.error('Failed to update user:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    const {showToast} = useToast();

    return useMutation<void, AxiosError, number>({
        mutationFn: async (userId) => {
            await deleteUser(userId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: userKeys.lists()});
            showToast(t('success.userDeleted'), 'success');
        },
        onError: (error) => {
            console.error('Failed to delete user:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

/**
 * Hook to change current user's password
 */
export const useChangePassword = () => {
    const {showToast} = useToast();

    return useMutation<ChangePasswordResponse, AxiosError, ChangePasswordRequest>({
        mutationFn: async (data) => {
            return await changePassword(data);
        },
        onSuccess: () => {
            showToast('Mot de passe changé avec succès. Veuillez vous reconnecter.', 'success');
            // Logout after password change
            setTimeout(() => {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/login';
            }, 2000);
        },
        onError: (error) => {
            console.error('Failed to change password:', error);
            // Toast is already handled by Axios interceptor
        },
    });
};

