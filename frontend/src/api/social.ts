import { apiClient } from './client';
import {
  CommentPayload,
  CommentResponse,
  ConnectionPayload,
  ConnectionResponse,
  ReactionPayload,
  ReactionResponse,
} from './types';

export const socialApi = {
  async react(payload: ReactionPayload): Promise<ReactionResponse> {
    const { data } = await apiClient.post<ReactionResponse>('/social/reactions', payload);
    return data;
  },

  async sendConnectionRequest(payload: ConnectionPayload): Promise<ConnectionResponse> {
    const { data } = await apiClient.post<ConnectionResponse>('/social/connections/request', payload);
    return data;
  },

  async respondToConnection(
    connectionId: string,
    action: 'accept' | 'decline',
  ): Promise<ConnectionResponse> {
    const { data } = await apiClient.post<ConnectionResponse>(
      `/social/connections/${connectionId}/respond`,
      { action },
    );
    return data;
  },

  async addComment(payload: CommentPayload): Promise<CommentResponse> {
    const { data } = await apiClient.post<CommentResponse>('/social/comments', payload);
    return data;
  },
};
