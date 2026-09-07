import { apiClient } from './client';
import { GlobalPulseResponse, HeatmapResponse } from './types';

export const mapApi = {
  async getHeatmap(): Promise<HeatmapResponse> {
    const { data } = await apiClient.get<HeatmapResponse>('/map/heatmap');
    return data;
  },

  async getPulse(): Promise<GlobalPulseResponse> {
    const { data } = await apiClient.get<GlobalPulseResponse>('/map/pulse');
    return data;
  },
};
