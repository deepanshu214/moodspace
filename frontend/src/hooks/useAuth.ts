import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { usersApi } from '@/api/users';
import { LoginPayload, RegisterPayload, UpdateUserPayload, UserResponse } from '@/api/types';
import { useAuthStore } from '@/stores/authStore';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const tokenData = await authApi.login(payload);
      const userProfile = await authApi.getMe();
      await login(tokenData.access_token, {
        id: userProfile.id,
        email: userProfile.email,
        displayName: userProfile.display_name,
        avatarUrl: userProfile.avatar_url || undefined,
        bio: userProfile.bio || undefined,
        auraScore: userProfile.aura_score,
      });
      return { tokenData, userProfile };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });
};

export const useCurrentUser = (enabled = true) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery<UserResponse>({
    queryKey: ['currentUser'],
    queryFn: () => usersApi.getMe(),
    enabled: isAuthenticated && enabled,
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery<UserResponse>({
    queryKey: ['userProfile', userId],
    queryFn: () => usersApi.getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.updateMe(payload),
    onSuccess: (updated) => {
      setUser({
        displayName: updated.display_name,
        bio: updated.bio || undefined,
        avatarUrl: updated.avatar_url || undefined,
        auraScore: updated.aura_score,
      });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await usersApi.deleteAccount();
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
