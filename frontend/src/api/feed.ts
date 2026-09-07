import { apiClient } from './client';
import { FeedResponse } from './types';

export const feedApi = {
  async getFeed(cursor?: string, limit = 20): Promise<FeedResponse> {
    const { data } = await apiClient.get<FeedResponse>('/feed/', {
      params: { cursor, limit },
    });
    return data;
  },
};
