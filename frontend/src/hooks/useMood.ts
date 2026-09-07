import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { moodApi } from '@/api/mood';
import { MoodCheckinPayload, MoodCheckinResponse } from '@/api/types';

export const useMoodCheckin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MoodCheckinPayload) => moodApi.checkin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['mood', 'nearby'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['map'] });
    },
  });
};

export const useMoodHistory = (limit = 20, offset = 0) => {
  return useQuery<MoodCheckinResponse[]>({
    queryKey: ['mood', 'history', limit, offset],
    queryFn: () => moodApi.getHistory(limit, offset),
  });
};

export const useNearbyBubbles = (lat?: number, lng?: number, radiusKm = 25) => {
  return useQuery<MoodCheckinResponse[]>({
    queryKey: ['mood', 'nearby', lat, lng, radiusKm],
    queryFn: () => {
      if (lat === undefined || lng === undefined) return Promise.resolve([]);
      return moodApi.getNearby(lat, lng, radiusKm);
    },
    enabled: lat !== undefined && lng !== undefined,
  });
};
