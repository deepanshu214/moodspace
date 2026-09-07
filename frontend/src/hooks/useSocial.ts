import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '@/api/social';
import { CommentPayload, ConnectionPayload, ReactionPayload } from '@/api/types';

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
  return useMutation({
    mutationFn: (payload: ConnectionPayload) => socialApi.sendConnectionRequest(payload),
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
