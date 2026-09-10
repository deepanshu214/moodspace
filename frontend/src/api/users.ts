import { apiClient } from './client';
import { UpdateUserPayload, UserResponse } from './types';

export const usersApi = {
  async getMe(): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>('/users/me');
    return data;
  },

  async updateMe(payload: UpdateUserPayload): Promise<UserResponse> {
    const { data } = await apiClient.patch<UserResponse>('/users/me', payload);
    return data;
  },

  async getUserProfile(userId: string): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>(`/users/${userId}`);
    return data;
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/me');
  },

  async getFollowers(userId?: string): Promise<UserResponse[]> {
    const endpoint = userId ? `/users/${userId}/followers` : '/users/me/followers';
    const { data } = await apiClient.get<UserResponse[]>(endpoint);
    return data;
  },

  async getFollowing(userId?: string): Promise<UserResponse[]> {
    const endpoint = userId ? `/users/${userId}/following` : '/users/me/following';
    const { data } = await apiClient.get<UserResponse[]>(endpoint);
    return data;
  },
};
