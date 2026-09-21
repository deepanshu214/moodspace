import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { anchorsApi, hotspotsApi, AnchorCreatePayload, PinnedAnchorResponse, HotspotResponse } from '@/api/anchors';

/** Places this person has pinned. Empty (not an error) when signed out. */
export const usePinnedAnchors = () =>
  useQuery<PinnedAnchorResponse[]>({
    queryKey: ['anchors'],
    queryFn: () => anchorsApi.list(),
    staleTime: 60_000,
    retry: false,
  });

export const usePinAnchor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnchorCreatePayload) => anchorsApi.pin(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anchors'] }),
  });
};

export const useRemoveAnchor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => anchorsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['anchors'] }),
  });
};

/** Live emotional clusters from the server's PostGIS DBSCAN grouping. */
export const useHotspots = (radiusKm = 2, minBubbles = 2) =>
  useQuery<HotspotResponse[]>({
    queryKey: ['hotspots', radiusKm, minBubbles],
    queryFn: () => hotspotsApi.list(radiusKm, minBubbles),
    staleTime: 30_000,
    retry: false,
  });
