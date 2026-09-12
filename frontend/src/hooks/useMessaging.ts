import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { messagingApi } from '@/api/messaging';
import {
  Conversation,
  DirectMessage,
  SendMessagePayload,
  AddMessageReactionPayload,
  MarkReadPayload,
} from '@/api/types';

// ── Query Keys ──────────────────────────────────────────────────────────────

export const messagingKeys = {
  all: ['messaging'] as const,
  conversations: () => [...messagingKeys.all, 'conversations'] as const,
  conversation: (id: string) => [...messagingKeys.conversations(), id] as const,
  messages: (conversationId: string) =>
    [...messagingKeys.all, 'messages', conversationId] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

/** Fetch list of all conversations, auto-refreshes every 30s */
export function useConversations() {
  return useQuery({
    queryKey: messagingKeys.conversations(),
    queryFn: () => messagingApi.getConversations(),
    staleTime: 30_000,
    refetchInterval: 30_000,
    // Graceful fallback when API unavailable
    initialData: undefined,
  });
}

/** Get or create a conversation with a user */
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => messagingApi.getOrCreateConversation(userId),
    onSuccess: (newConversation: Conversation) => {
      // Optimistically insert into list
      queryClient.setQueryData<Conversation[]>(
        messagingKeys.conversations(),
        (old = []) => {
          const exists = old.some((c) => c.id === newConversation.id);
          return exists ? old : [newConversation, ...old];
        },
      );
    },
  });
}

/** Infinite query for messages in a conversation */
export function useMessages(conversationId: string | undefined) {
  return useInfiniteQuery({
    queryKey: messagingKeys.messages(conversationId ?? ''),
    queryFn: ({ pageParam }) =>
      messagingApi.getMessages(conversationId!, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    enabled: !!conversationId,
    staleTime: 10_000,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

/** Send a message — optimistic update */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<SendMessagePayload, 'recipient_id'>) =>
      messagingApi.sendMessage(conversationId, payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: messagingKeys.messages(conversationId) });
      const optimistic: DirectMessage = {
        id: `optimistic-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: 'me',
        recipient_id: '',
        content: payload.content,
        message_type: payload.message_type ?? 'text',
        status: 'sending',
        emotion_tag: payload.emotion_tag,
        created_at: new Date().toISOString(),
      };
      // Prepend to first page
      queryClient.setQueryData(messagingKeys.messages(conversationId), (old: any) => {
        if (!old) return old;
        const pages = [...old.pages];
        pages[0] = {
          ...pages[0],
          messages: [optimistic, ...(pages[0]?.messages ?? [])],
        };
        return { ...old, pages };
      });
      return { optimistic };
    },

    onError: (_err, _payload, context) => {
      // Rollback optimistic
      queryClient.setQueryData(messagingKeys.messages(conversationId), (old: any) => {
        if (!old) return old;
        const pages = old.pages.map((page: any) => ({
          ...page,
          messages: page.messages.filter(
            (m: DirectMessage) => m.id !== context?.optimistic.id,
          ),
        }));
        return { ...old, pages };
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
    },
  });
}

/** Delete a message */
export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) =>
      messagingApi.deleteMessage(conversationId, messageId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.messages(conversationId) });
    },
  });
}

/** React to a message with an emoji */
export function useReactToMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMessageReactionPayload) =>
      messagingApi.reactToMessage(payload),
    onSuccess: (_data, payload) => {
      // Refresh messages for any active conversation
      queryClient.invalidateQueries({ queryKey: messagingKeys.all });
    },
  });
}

/** Mark conversation messages as read */
export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarkReadPayload) => messagingApi.markRead(payload),
    onSuccess: (_data, payload) => {
      // Update unread_count to 0 in the conversation list
      queryClient.setQueryData<Conversation[]>(
        messagingKeys.conversations(),
        (old = []) =>
          old.map((c) =>
            c.id === payload.conversation_id ? { ...c, unread_count: 0 } : c,
          ),
      );
    },
  });
}
