import { UserPostBubble } from './userPosts';
import { ENV } from './env';

/** A mood bubble as the map and feed render it, whatever its source. */
export interface DisplayBubble {
  id: string;
  authorName: string;
  authorAvatar?: string;
  auraScore: number;
  emotion: string;
  secondaryEmotion?: string;
  intensity: number;
  content: string;
  locationCity: string;
  weatherCondition: string;
  weatherTemp: number;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  isAnonymous?: boolean;
  latitude: number;
  longitude: number;
  canvasX?: number;
  canvasY?: number;
  /** Tags the author attached, without the leading hash. */
  tags?: string[];
  /** Absolute URL of an attached photo, when the bubble has one. */
  photoUrl?: string;
  /** Absolute URL of an attached voice note, and its length. */
  voiceUrl?: string;
  voiceDurationMs?: number;
}

/** Attachment paths come back relative to the API host. */
const absoluteMediaUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (ENV.API_URL || '').replace(/\/api\/v1\/?$/, '');
  return `${base}${path}`;
};

/** Normalises an API bubble payload into the display shape. */
export const toDisplayBubbles = (
  apiBubbles: any[],
  fallbackLat: number,
  fallbackLng: number
): DisplayBubble[] =>
  apiBubbles.map((item, idx) => {
    const photo = (item.attachments || []).find((a: any) => a.kind === 'photo');
    const voice = (item.attachments || []).find((a: any) => a.kind === 'voice');
    return {
    id: item.id || `api-${idx}`,
    // The server already decides what a cloaked bubble may reveal.
    authorName: item.author_name || (item.is_incognito ? 'Wandering Spirit' : 'Traveler'),
    authorAvatar: item.author_avatar || undefined,
    auraScore: 250,
    emotion: item.primary_emotion || 'calm',
    secondaryEmotion: item.secondary_emotion,
    intensity: item.intensity || 7,
    content: item.notes || '',
    locationCity: item.city || 'Worldwide',
    weatherCondition: item.weather_condition || 'Starry Sky',
    weatherTemp: item.weather_temp || 18,
    timestamp: 'Recent',
    likesCount: item.reactions_count || 0,
    commentsCount: item.comments_count || 0,
    isAnonymous: item.is_incognito,
    latitude: item.latitude || fallbackLat + (Math.random() - 0.5) * 0.05,
    longitude: item.longitude || fallbackLng + (Math.random() - 0.5) * 0.05,
    tags: item.tags || [],
    photoUrl: absoluteMediaUrl(photo?.url),
    voiceUrl: absoluteMediaUrl(voice?.url),
    voiceDurationMs: voice?.duration_ms ?? undefined,
  };
  });

/** Puts this device's own posts in front, dropping any duplicate ids. */
export const mergeLocalBubbles = (
  base: DisplayBubble[],
  local: UserPostBubble[]
): DisplayBubble[] => {
  if (!local || local.length === 0) return base;
  const localMapped: DisplayBubble[] = local.map((m) => ({
    ...m,
    photoUrl: m.photoUri,
    voiceUrl: m.voiceUri,
    voiceDurationMs: m.voiceDurationMs,
  }));
  const existingIds = new Set(localMapped.map((b) => b.id));
  return [...localMapped, ...base.filter((b) => !existingIds.has(b.id))];
};

/** Filters by emotion; `all` or null means everything. */
export const filterByEmotion = (bubbles: DisplayBubble[], filter: string | null): DisplayBubble[] => {
  if (!filter || filter === 'all') return bubbles;
  return bubbles.filter((b) => b.emotion.toLowerCase() === filter.toLowerCase());
};
