import { apiClient } from './client';
import { MoodCheckinPayload, MoodCheckinResponse } from './types';

/** A bubble floats for 24 hours, then the server deletes it. */
export const BUBBLE_LIFETIME_HOURS = 24;

/**
 * The API speaks a nested, privacy-shaped payload (emotion list, journal note,
 * geo point); the app speaks one flat bubble. This layer is where the two meet,
 * so screens never have to know the wire format.
 */
const toCanonicalCheckin = (payload: MoodCheckinPayload & { tags?: string[] }) => ({
  emotions: [
    {
      primary: payload.primary_emotion,
      secondary: payload.secondary_emotion || payload.primary_emotion,
      intensity: payload.intensity,
    },
  ],
  custom_tags: payload.tags?.slice(0, 5),
  journal_note: payload.notes,
  // Map bubbles are public by definition; anonymity is a separate flag so a
  // cloaked bubble is still visible, just unattributed.
  privacy_level: 'public' as const,
  location:
    payload.latitude != null && payload.longitude != null
      ? { latitude: payload.latitude, longitude: payload.longitude }
      : undefined,
  city: payload.city,
  weather_condition: payload.weather_condition,
  weather_temp_celsius: payload.weather_temp,
  is_incognito: !!payload.is_incognito,
  expires_in_hours: BUBBLE_LIFETIME_HOURS,
});

export const moodApi = {
  async checkin(payload: MoodCheckinPayload & { tags?: string[] }): Promise<MoodCheckinResponse> {
    const { data } = await apiClient.post<MoodCheckinResponse>('/mood/checkin', toCanonicalCheckin(payload));
    return data;
  },

  async getHistory(limit = 20, offset = 0): Promise<MoodCheckinResponse[]> {
    const page = Math.floor(offset / Math.max(limit, 1)) + 1;
    const { data } = await apiClient.get<any>('/mood/history', { params: { limit, page } });
    return data?.data?.entries ?? [];
  },

  async getNearby(lat: number, lng: number, radiusKm = 25): Promise<MoodCheckinResponse[]> {
    const { data } = await apiClient.get<any>('/mood/nearby', {
      params: { lat, lng, radius_km: radiusKm },
    });
    return data?.data?.bubbles ?? [];
  },

  /**
   * Attach a photo or voice note to a bubble. `uri` is a local file URI from
   * the picker or recorder; React Native turns it into multipart form data.
   */
  async attachKeepsake(
    bubbleId: string,
    file: { uri: string; name: string; type: string },
    kind: 'photo' | 'voice',
    durationMs?: number,
  ): Promise<{ id: string; kind: string; url: string; duration_ms?: number }> {
    const form = new FormData();
    form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
    form.append('kind', kind);
    if (durationMs != null) form.append('duration_ms', String(Math.round(durationMs)));

    const { data } = await apiClient.post(`/mood/${bubbleId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return data;
  },
};
