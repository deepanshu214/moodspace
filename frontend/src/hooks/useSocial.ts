import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '@/api/social';
import { usersApi } from '@/api/users';
import { CommentPayload, ConnectionPayload, ReactionPayload, UserResponse } from '@/api/types';

export const useReact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReactionPayload) => socialApi.react(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['mood'] });
    },
  });
};

export const useSendConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConnectionPayload) => socialApi.sendConnectionRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useRespondConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      connectionId,
      action,
    }: {
      connectionId: string;
      action: 'accept' | 'decline';
    }) => socialApi.respondToConnection(connectionId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CommentPayload) => socialApi.addComment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['mood'] });
    },
  });
};

export const useFollowers = (userId?: string) => {
  return useQuery<UserResponse[]>({
    queryKey: ['followers', userId],
    queryFn: () => usersApi.getFollowers(userId),
  });
};

export const useFollowing = (userId?: string) => {
  return useQuery<UserResponse[]>({
    queryKey: ['following', userId],
    queryFn: () => usersApi.getFollowing(userId),
  });
};
