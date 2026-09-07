import { useQuery } from '@tanstack/react-query';
import { mapApi } from '@/api/map';
import { GlobalPulseResponse, HeatmapResponse } from '@/api/types';

export const useHeatmap = () => {
  return useQuery<HeatmapResponse>({
    queryKey: ['map', 'heatmap'],
    queryFn: () => mapApi.getHeatmap(),
  });
};

export const useAtmosphericPulse = () => {
  return useQuery<GlobalPulseResponse>({
    queryKey: ['map', 'pulse'],
    queryFn: () => mapApi.getPulse(),
    refetchInterval: 1000 * 60 * 3, // Auto refresh every 3 minutes
  });
};
