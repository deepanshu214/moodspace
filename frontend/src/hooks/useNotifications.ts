import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification';
import { NotificationResponse } from '@/api/types';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
};

export const useNotifications = () => {
  return useQuery<NotificationResponse[]>({
    queryKey: notificationKeys.list(),
    queryFn: () => notificationApi.getNotifications(),
    refetchInterval: 1000 * 30, // Poll every 30s
    staleTime: 1000 * 15,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markRead(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<NotificationResponse[]>(notificationKeys.list());

      if (previous) {
        queryClient.setQueryData<NotificationResponse[]>(
          notificationKeys.list(),
          previous.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
        );
      }

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<NotificationResponse[]>(notificationKeys.list());

      if (previous) {
        queryClient.setQueryData<NotificationResponse[]>(
          notificationKeys.list(),
          previous.map((n) => ({ ...n, is_read: true })),
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData<NotificationResponse[]>(notificationKeys.list());

      if (previous) {
        queryClient.setQueryData<NotificationResponse[]>(
          notificationKeys.list(),
          previous.filter((n) => n.id !== notificationId),
        );
      }

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
};
