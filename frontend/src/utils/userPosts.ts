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
  likesCount: number;
  commentsCount: number;
  isAnonymous?: boolean;
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = 'moodspace_my_posted_bubbles_v1';

export const getUserPostedBubbles = async (): Promise<UserPostBubble[]> => {
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
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
