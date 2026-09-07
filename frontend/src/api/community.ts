import { apiClient } from './client';
import { CommunityResponse, CreatePostPayload, PostResponse } from './types';

export const communityApi = {
  async getCommunities(): Promise<CommunityResponse[]> {
    const { data } = await apiClient.get<CommunityResponse[]>('/community');
    return data;
  },

  async getCommunityPosts(communityId: string): Promise<PostResponse[]> {
    const { data } = await apiClient.get<PostResponse[]>(`/community/${communityId}/posts`);
    return data;
  },

  async createPost(communityId: string, payload: CreatePostPayload): Promise<PostResponse> {
    const { data } = await apiClient.post<PostResponse>(`/community/${communityId}/posts`, payload);
    return data;
  },
};
