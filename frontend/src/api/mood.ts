import { apiClient } from './client';
import { MoodCheckinPayload, MoodCheckinResponse } from './types';

export const moodApi = {
  async checkin(payload: MoodCheckinPayload): Promise<MoodCheckinResponse> {
    const { data } = await apiClient.post<MoodCheckinResponse>('/mood/checkin', payload);
    return data;
  },

  async getHistory(limit = 20, offset = 0): Promise<MoodCheckinResponse[]> {
    const { data } = await apiClient.get<MoodCheckinResponse[]>('/mood/history', {
      params: { limit, offset },
    });
    return data;
  },

  async getNearby(lat: number, lng: number, radiusKm = 25): Promise<MoodCheckinResponse[]> {
    const { data } = await apiClient.get<MoodCheckinResponse[]>('/mood/nearby', {
      params: { lat, lng, radius_km: radiusKm },
    });
    return data;
  },
};
