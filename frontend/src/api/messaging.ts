import { apiClient } from './client';
import {
  Conversation,
  ConversationMessagesResponse,
  DirectMessage,
  SendMessagePayload,
  AddMessageReactionPayload,
  MessageReactionResponse,
  MarkReadPayload,
} from './types';

export const messagingApi = {
  // ── Conversations ──────────────────────────────────────────────────────────

  /** List all conversations for the current user, newest first */
  async getConversations(): Promise<Conversation[]> {
    const { data } = await apiClient.get<Conversation[]>('/messages/conversations');
    return data;
  },

  /** Get or create a direct conversation with another user */
  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const { data } = await apiClient.post<Conversation>('/messages/conversations', {
      user_id: userId,
    });
    return data;
  },

  // ── Messages ───────────────────────────────────────────────────────────────

  /** Fetch paginated messages for a conversation */
  async getMessages(
    conversationId: string,
    cursor?: string,
    limit = 30,
  ): Promise<ConversationMessagesResponse> {
    const { data } = await apiClient.get<ConversationMessagesResponse>(
      `/messages/conversations/${conversationId}/messages`,
      { params: { cursor, limit } },
    );
    return data;
  },

  /** Send a message (text, icebreaker, mood_share, or reaction_echo) */
  async sendMessage(
    conversationId: string,
    payload: Omit<SendMessagePayload, 'recipient_id'>,
  ): Promise<DirectMessage> {
    const { data } = await apiClient.post<DirectMessage>(
      `/messages/conversations/${conversationId}/messages`,
      payload,
    );
    return data;
  },

  /** Delete a message (soft-delete — sets is_deleted=true) */
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await apiClient.delete(
      `/messages/conversations/${conversationId}/messages/${messageId}`,
    );
  },

  // ── Reactions ──────────────────────────────────────────────────────────────

  /** React to a message with an emoji */
  async reactToMessage(
    payload: AddMessageReactionPayload,
  ): Promise<MessageReactionResponse> {
    const { data } = await apiClient.post<MessageReactionResponse>(
      '/messages/reactions',
      payload,
    );
    return data;
  },

  /** Remove a reaction */
  async removeReaction(reactionId: string): Promise<void> {
    await apiClient.delete(`/messages/reactions/${reactionId}`);
  },

  // ── Read receipts ──────────────────────────────────────────────────────────

  /** Mark messages as read up to a certain message */
  async markRead(payload: MarkReadPayload): Promise<void> {
    await apiClient.post('/messages/read', payload);
  },
};
