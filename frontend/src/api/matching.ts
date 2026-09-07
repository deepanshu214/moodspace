import { apiClient } from './client';
import { MoodMatchResponse } from './types';

export const matchingApi = {
  async getMatches(): Promise<MoodMatchResponse[]> {
    const { data } = await apiClient.get<MoodMatchResponse[]>('/matching/');
    return data;
  },
};
