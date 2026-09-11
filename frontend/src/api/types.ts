// Auth & User Types
export interface UserResponse {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  date_of_birth?: string;
  status: string;
  role: string;
  subscription_tier: string;
  aura_score?: number;
  created_at: string;
  updated_at?: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
  date_of_birth: string;
}

export interface UpdateUserPayload {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  locale?: string;
  timezone?: string;
}

// Mood Types
export interface MoodCheckinPayload {
  primary_emotion: string;
  secondary_emotion?: string;
  intensity: number; // 1 - 10
  notes?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  weather_temp?: number;
  weather_condition?: string;
  is_incognito?: boolean;
}

export interface MoodCheckinResponse {
  id: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string | null;
  primary_emotion: string;
  secondary_emotion?: string;
  intensity: number;
  notes?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  weather_temp?: number;
  weather_condition?: string;
  is_incognito: boolean;
  reactions_count: number;
  comments_count: number;
  created_at: string;
}

// Map & Atmosphere Types
export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  emotion: string;
  intensity: number;
  weight: number;
}

export interface HeatmapResponse {
  points: HeatmapPoint[];
  total_active_points: number;
}

export interface GlobalPulseResponse {
  dominant_emotion: string;
  intensity_average: number;
  active_bubbles_count: number;
  emotion_distribution: Record<string, number>;
  generated_at: string;
}

// Feed Types
export interface FeedResponse {
  items: MoodCheckinResponse[];
  next_cursor?: string | null;
  has_more: boolean;
}

// Social & Interaction Types
export type ReactionType = 'empathy' | 'heart' | 'hug' | 'celebrate' | 'support';

export interface ReactionPayload {
  target_type: 'checkin' | 'post' | 'comment';
  target_id: string;
  reaction_type: ReactionType;
}

export interface ReactionResponse {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  reaction_type: string;
  created_at: string;
}

export interface ConnectionPayload {
  addressee_id: string;
}

export interface ConnectionResponse {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface CommentPayload {
  target_type: 'checkin' | 'post';
  target_id: string;
  content: string;
  is_anonymous?: boolean;
}

export interface CommentResponse {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar?: string | null;
  target_type: string;
  target_id: string;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
}

// Notification Types
export interface NotificationResponse {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

// Community Types
export interface CommunityCreatePayload {
  name: string;
  description: string;
  category: string;
  privacy?: 'public' | 'restricted' | 'private';
  rules?: string;
  welcome_message?: string;
}

export interface CommunityResponse {
  id: string;
  name: string;
  description: string;
  member_count: number;
  topic?: string;
  category?: string;
  privacy?: string;
  status?: string;
  rules?: string;
  welcome_message?: string;
  dominant_emotion?: string;
  group_mood_score?: number;
  created_at?: string;
}

export interface PostResponse {
  id: string;
  community_id: string;
  user_id?: string;
  author_id?: string;
  author_name?: string;
  author_avatar?: string | null;
  title?: string;
  content: string;
  emotion?: string;
  post_type?: string;
  is_anonymous?: boolean;
  has_content_warning?: boolean;
  is_pinned?: boolean;
  likes_count?: number;
  reaction_count?: number;
  comments_count?: number;
  comment_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreatePostPayload {
  title?: string;
  content: string;
  emotion?: string;
  post_type?: string;
  is_anonymous?: boolean;
  has_content_warning?: boolean;
}

// Matching Types
export interface MoodMatchResponse {
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  shared_emotion: string;
  resonance_score: number; // 0 - 100
  city?: string;
}
