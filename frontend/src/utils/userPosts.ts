import { storage } from './storage';

export interface UserPostBubble {
  id: string;
  authorName: string;
  auraScore: number;
  emotion: string;
  secondaryEmotion?: string;
  intensity: number;
  content: string;
  locationCity: string;
  weatherCondition: string;
  weatherTemp: number;
  timestamp: string;
  createdAt: string;
  /** ISO time this bubble dissolves. Older posts without one never expire. */
  expiresAt?: string;
  likesCount: number;
  commentsCount: number;
  isAnonymous?: boolean;
  latitude: number;
  longitude: number;
  /** Free-form tags the author attached, without the leading hash. */
  tags?: string[];
  /** Local URI of an attached photo, mirrored to the server on publish. */
  photoUri?: string;
  /** Local URI of an attached voice note, and how long it runs. */
  voiceUri?: string;
  voiceDurationMs?: number;
}

const STORAGE_KEY = 'moodspace_my_posted_bubbles_v1';

/** A bubble floats for 24 hours, then leaves no trace. */
export const BUBBLE_LIFETIME_MS = 24 * 60 * 60 * 1000;

export const expiryFromNow = (now: number = Date.now()): string =>
  new Date(now + BUBBLE_LIFETIME_MS).toISOString();

/** Milliseconds left before a bubble dissolves; null when it never expires. */
export const msUntilDissolve = (bubble: UserPostBubble, now: number = Date.now()): number | null => {
  if (!bubble.expiresAt) return null;
  return new Date(bubble.expiresAt).getTime() - now;
};

const isAlive = (bubble: UserPostBubble, now: number): boolean => {
  const left = msUntilDissolve(bubble, now);
  return left === null || left > 0;
};

export const getUserPostedBubbles = async (): Promise<UserPostBubble[]> => {
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Auto-dissolve: expired bubbles are dropped on read and pruned from disk,
    // so a bubble really does leave no trace after 24 hours.
    const now = Date.now();
    const alive = parsed.filter((b: UserPostBubble) => isAlive(b, now));
    if (alive.length !== parsed.length) {
      await storage.setItem(STORAGE_KEY, JSON.stringify(alive));
    }
    return alive;
  } catch (err) {
    console.warn('[userPosts] Failed to parse posted bubbles:', err);
    return [];
  }
};

export const saveUserPostedBubble = async (bubble: UserPostBubble): Promise<UserPostBubble[]> => {
  try {
    const existing = await getUserPostedBubbles();
    // Prepend new bubble, filter duplicate IDs, cap at 30 recent posts
    const updated = [bubble, ...existing.filter((b) => b.id !== bubble.id)].slice(0, 30);
    await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[userPosts] Failed to save posted bubble:', err);
    return [bubble];
  }
};

export const deleteUserPostedBubble = async (id: string): Promise<UserPostBubble[]> => {
  try {
    const existing = await getUserPostedBubbles();
    const updated = existing.filter((b) => b.id !== id);
    await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('[userPosts] Failed to delete posted bubble:', err);
    return [];
  }
};
