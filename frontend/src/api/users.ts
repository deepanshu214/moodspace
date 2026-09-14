import { apiClient } from './client';
import {
  UpdateUserPayload,
  UserResponse,
  UserStatsResponse,
  MoodStreakInfo,
  AuraScoreBreakdown,
  MoodHeatmapDay,
  PrivacySettingsPayload,
} from './types';


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

  // ── Stage 11: Deepening & Milestones ─────────────────────────────────────

  async getUserStats(): Promise<UserStatsResponse> {
    const { data } = await apiClient.get<UserStatsResponse>('/users/me/stats');
    return data;
  },

  async getMoodStreak(): Promise<MoodStreakInfo> {
    const { data } = await apiClient.get<MoodStreakInfo>('/users/me/streak');
    return data;
  },

  async getAuraBreakdown(): Promise<AuraScoreBreakdown> {
    const { data } = await apiClient.get<AuraScoreBreakdown>('/users/me/aura');
    return data;
  },

  async getMoodHeatmap(days = 60): Promise<MoodHeatmapDay[]> {
    const { data } = await apiClient.get<MoodHeatmapDay[]>('/users/me/heatmap', {
      params: { days },
    });
    return data;
  },

  async getPrivacySettings(): Promise<PrivacySettingsPayload> {
    const { data } = await apiClient.get<PrivacySettingsPayload>('/users/me/privacy');
    return data;
  },

  async updatePrivacySettings(payload: Partial<PrivacySettingsPayload>): Promise<PrivacySettingsPayload> {
    const { data } = await apiClient.patch<PrivacySettingsPayload>('/users/me/privacy', payload);
    return data;
  },
};

