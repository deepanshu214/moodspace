import { apiClient } from './client';
import {
  MoodMatchResponse,
  EchoMatchResponse,
  EchoMatchDecisionPayload,
  EchoMatchDecisionResponse,
  Icebreaker,
} from './types';

export const matchingApi = {
  // ── Legacy matches (simple mood-based) ─────────────────────────────────────

  /** Get users who share a similar mood right now */
  async getMatches(): Promise<MoodMatchResponse[]> {
    const { data } = await apiClient.get<MoodMatchResponse[]>('/matching/');
    return data;
  },

  // ── Echo Matching (Stage 9 Resonance System) ────────────────────────────────

  /**
   * Get curated Echo match suggestions based on resonance score.
   * The backend ranks by: shared_emotion, mood_pattern, location, community_overlap.
   */
  async getEchoMatches(): Promise<EchoMatchResponse[]> {
    const { data } = await apiClient.get<EchoMatchResponse[]>('/matching/echoes');
    return data;
  },

  /**
   * Connect or pass on an Echo match suggestion.
   * If decision === 'connect' AND the other party also connects, a conversation
   * is automatically created (conversation_id returned in response).
   */
  async decideOnEchoMatch(
    payload: EchoMatchDecisionPayload,
  ): Promise<EchoMatchDecisionResponse> {
    const { data } = await apiClient.post<EchoMatchDecisionResponse>(
      '/matching/echoes/decide',
      payload,
    );
    return data;
  },

  // ── Icebreakers ─────────────────────────────────────────────────────────────

  /** Get a random icebreaker, optionally filtered by emotion or category */
  async getIcebreaker(params?: {
    emotion?: string;
    category?: string;
  }): Promise<Icebreaker> {
    const { data } = await apiClient.get<Icebreaker>('/matching/icebreakers/random', {
      params,
    });
    return data;
  },

  /** Get all available icebreakers (for picker UI) */
  async getIcebreakers(emotion?: string): Promise<Icebreaker[]> {
    const { data } = await apiClient.get<Icebreaker[]>('/matching/icebreakers', {
      params: { emotion },
    });
    return data;
  },
};
