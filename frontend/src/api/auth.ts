import { apiClient } from './client';
import { AuthToken, LoginPayload, RegisterPayload, UserResponse } from './types';
import { storage, STORAGE_KEYS } from '@/utils/storage';

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthToken> {
    const { data } = await apiClient.post<AuthToken>('/auth/login', payload);
    if (data.access_token) {
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      if (data.refresh_token) {
        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
    }
    return data;
  },

  async register(payload: RegisterPayload): Promise<UserResponse> {
    const { data } = await apiClient.post<UserResponse>('/auth/register', payload);
    return data;
  },

  async getMe(): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>('/users/me');
    await storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data));
    return data;
  },

  async logout(): Promise<void> {
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await storage.removeItem(STORAGE_KEYS.USER_PROFILE);
  },
};
