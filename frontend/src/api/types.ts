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
export type NotificationCategory =
  | 'empathy_reaction'
  | 'comment_echo'
  | 'echo_match'
  | 'connection_request'
  | 'connection_accepted'
  | 'community_activity'
  | 'mindful_reminder'
  | 'streak_milestone'
  | 'system';

export interface NotificationData {
  actor_id?: string;
  actor_name?: string;
  actor_avatar?: string | null;
  target_id?: string;
  target_type?: 'checkin' | 'post' | 'comment' | 'community' | 'chat';
  emotion?: string;
  reaction_type?: ReactionType | string;
  community_id?: string;
  community_name?: string;
  connection_id?: string;
  resonance_score?: number;
  milestone_count?: number;
  [key: string]: any;
}

export interface NotificationResponse {
  id: string;
  user_id: string;
  type: string;
  category?: NotificationCategory;
  title: string;
  body?: string;
  message?: string;
  is_read: boolean;
  read_at?: string | null;
  data?: NotificationData;
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

// ---------- Stage 9: Direct Messaging / Echoes & Matching ----------

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'icebreaker' | 'mood_share' | 'reaction_echo';

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: MessageType;
  status: MessageStatus;
  emotion_tag?: string;
  icebreaker_id?: string;
  is_deleted?: boolean;
  reactions?: MessageReactionResponse[];
  created_at: string;
  updated_at?: string;
}

export interface SendMessagePayload {
  recipient_id: string;
  content: string;
  message_type?: MessageType;
  emotion_tag?: string;
  icebreaker_id?: string;
}

export interface MessageReactionResponse {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface AddMessageReactionPayload {
  message_id: string;
  emoji: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  other_participant: {
    user_id: string;
    display_name: string;
    avatar_url?: string | null;
    current_emotion?: string;
    is_online?: boolean;
    last_seen_at?: string;
  };
  last_message?: DirectMessage;
  unread_count: number;
  resonance_score?: number;
  is_echo_match?: boolean;   // matched via resonance system
  created_at: string;
  updated_at: string;
}

export interface ConversationMessagesResponse {
  messages: DirectMessage[];
  next_cursor?: string | null;
  has_more: boolean;
}

export interface MarkReadPayload {
  conversation_id: string;
  up_to_message_id?: string;
}

// Icebreaker types
export type IcebreakerCategory =
  | 'curiosity'
  | 'gratitude'
  | 'empathy'
  | 'growth'
  | 'presence'
  | 'reflection';

export interface Icebreaker {
  id: string;
  prompt: string;
  category: IcebreakerCategory;
  emotion_tags: string[];
  follow_up?: string;
}

// Echo Matching (Resonance system)
export type EchoMatchReason =
  | 'shared_emotion'
  | 'complementary_emotion'
  | 'location_proximity'
  | 'community_overlap'
  | 'mood_pattern';

export interface EchoMatchResponse {
  match_id: string;           // unique ID for this match suggestion
  user_id: string;
  display_name: string;
  avatar_url?: string | null;
  current_emotion: string;
  resonance_score: number;    // 0–100
  match_reasons: EchoMatchReason[];
  shared_emotion?: string;
  city?: string;
  mutual_communities?: number;
  icebreaker?: Icebreaker;    // pre-loaded icebreaker for this match
  expires_at?: string;        // match window expires
  is_anonymous?: boolean;     // other user in wandering spirit mode
}

export interface EchoMatchDecisionPayload {
  match_id: string;
  decision: 'connect' | 'pass';
}

export interface EchoMatchDecisionResponse {
  match_id: string;
  decision: 'connect' | 'pass';
  conversation_id?: string;   // set when both parties connect
  is_mutual?: boolean;
}

