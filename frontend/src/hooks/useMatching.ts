import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchingApi } from '@/api/matching';
import {
  EchoMatchDecisionPayload,
  EchoMatchResponse,
  Icebreaker,
} from '@/api/types';
import { messagingKeys } from './useMessaging';

// ── Query Keys ──────────────────────────────────────────────────────────────

export const matchingKeys = {
  all: ['matching'] as const,
  echoes: () => [...matchingKeys.all, 'echoes'] as const,
  icebreakers: (emotion?: string) =>
    [...matchingKeys.all, 'icebreakers', emotion ?? 'all'] as const,
  icebreaker: (emotion?: string, category?: string) =>
    [...matchingKeys.all, 'icebreaker', emotion ?? 'all', category ?? 'any'] as const,
  legacyMatches: () => [...matchingKeys.all, 'legacy'] as const,
};

// ── Queries ─────────────────────────────────────────────────────────────────

/** Legacy simple mood matches */
export function useMoodMatches() {
  return useQuery({
    queryKey: matchingKeys.legacyMatches(),
    queryFn: () => matchingApi.getMatches(),
    staleTime: 60_000,
  });
}

/** Echo match suggestions — resonance-ranked */
export function useEchoMatches() {
  return useQuery({
    queryKey: matchingKeys.echoes(),
    queryFn: () => matchingApi.getEchoMatches(),
    staleTime: 2 * 60_000, // 2 minutes — matches are time-sensitive
    refetchOnWindowFocus: true,
  });
}

/** All icebreakers (for picker) */
export function useIcebreakers(emotion?: string) {
  return useQuery({
    queryKey: matchingKeys.icebreakers(emotion),
    queryFn: () => matchingApi.getIcebreakers(emotion),
    staleTime: 5 * 60_000,
  });
}

/** Single random icebreaker */
export function useRandomIcebreaker(emotion?: string, category?: string) {
  return useQuery({
    queryKey: matchingKeys.icebreaker(emotion, category),
    queryFn: () => matchingApi.getIcebreaker({ emotion, category }),
    staleTime: 60_000,
    enabled: false, // only fetch on explicit refetch
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────

/**
 * Connect or pass on an Echo match.
 * On connect + mutual: a conversation is created — we invalidate conversations.
 */
export function useDecideEchoMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EchoMatchDecisionPayload) =>
      matchingApi.decideOnEchoMatch(payload),

    onMutate: async (payload) => {
      // Optimistically remove the match from the list
      await queryClient.cancelQueries({ queryKey: matchingKeys.echoes() });
      const prev = queryClient.getQueryData<EchoMatchResponse[]>(matchingKeys.echoes());
      queryClient.setQueryData<EchoMatchResponse[]>(
        matchingKeys.echoes(),
        (old = []) => old.filter((m) => m.match_id !== payload.match_id),
      );
      return { prev };
    },

    onError: (_err, _payload, context) => {
      if (context?.prev) {
        queryClient.setQueryData(matchingKeys.echoes(), context.prev);
      }
    },

    onSuccess: (response) => {
      if (response.conversation_id) {
        // A mutual match formed a conversation — refresh conversations list
        queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: matchingKeys.echoes() });
    },
  });
}
