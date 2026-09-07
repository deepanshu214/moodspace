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
};
