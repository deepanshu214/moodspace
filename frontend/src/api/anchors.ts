import { apiClient } from './client';

export interface PinnedAnchorResponse {
  id: string;
  label: string;
  city?: string | null;
  note?: string | null;
  emotion?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  drops_count: number;
  created_at: string;
}

export interface AnchorCreatePayload {
  label: string;
  city?: string;
  note?: string;
  emotion?: string;
  latitude?: number;
  longitude?: number;
}

export interface HotspotResponse {
  id: string;
  latitude: number | null;
  longitude: number | null;
  city?: string | null;
  bubble_count: number;
  dominant_emotion: string;
  avg_intensity?: number | null;
}

export const anchorsApi = {
  async list(): Promise<PinnedAnchorResponse[]> {
    const { data } = await apiClient.get<any>('/anchors');
    return data?.data?.anchors ?? [];
  },

  /** Pinning a place you already pinned bumps its drop count server-side. */
  async pin(payload: AnchorCreatePayload): Promise<PinnedAnchorResponse> {
    const { data } = await apiClient.post<PinnedAnchorResponse>('/anchors', payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/anchors/${id}`);
  },
};

export const hotspotsApi = {
  async list(radiusKm = 2, minBubbles = 2): Promise<HotspotResponse[]> {
    const { data } = await apiClient.get<any>('/map/hotspots', {
      params: { radius_km: radiusKm, min_bubbles: minBubbles },
    });
    return data?.data?.hotspots ?? [];
  },
};
