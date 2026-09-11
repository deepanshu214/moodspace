import { apiClient } from './client';
import { CommunityCreatePayload, CommunityResponse, CreatePostPayload, PostResponse } from './types';

export const communityApi = {
  async getCommunities(): Promise<CommunityResponse[]> {
    const { data } = await apiClient.get<CommunityResponse[]>('/community');
    return data;
  },

  async createCommunity(payload: CommunityCreatePayload): Promise<CommunityResponse> {
    const { data } = await apiClient.post<CommunityResponse>('/community', payload);
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

  async joinCommunity(communityId: string): Promise<void> {
    await apiClient.post(`/community/${communityId}/join`);
  },

  async leaveCommunity(communityId: string): Promise<void> {
    await apiClient.post(`/community/${communityId}/leave`);
  },
};
