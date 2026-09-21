import { NavigatorScreenParams } from '@react-navigation/native';

// Onboarding Stack
export type OnboardingStackParamList = {
  OnboardingProfile: undefined;
  OnboardingDOB: undefined;
  OnboardingPermissions: undefined;
  OnboardingComplete: undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
};

// Community Flow
export type CommunityStackParamList = {
  CommunityList: undefined;
  CommunityDetail: {
    communityId: string;
    communityName: string;
    category?: string;
    dominantEmotion?: string;
  };
  CreateCommunity: undefined;
  CreateCommunityPost: {
    communityId: string;
    communityName: string;
  };
};

// Home Flow
export type HomeStackParamList = {
  HomeScreen: undefined;
  BubbleDetails: { bubbleId: string; emotion?: string; authorName?: string };
  FeedStream: undefined;
  CommunityFlow: NavigatorScreenParams<CommunityStackParamList> | undefined;
};

// Chats Flow
export type ChatStackParamList = {
  Conversations: undefined;
  ChatDetail: {
    chatId: string;
    recipientName: string;
    recipientAvatar?: string | null;
    recipientEmotion?: string;
    isEchoMatch?: boolean;
  };
  EchoMatch: undefined;
  IcebreakerPicker: {
    conversationId: string;
    emotion?: string;
  };
};


// Profile Flow
export type ProfileStackParamList = {
  MyProfile: undefined;
  UserProfile: { userId: string; username: string };
  EditProfile: undefined;
  Settings: undefined;
  FollowRequests: undefined;
  ProfileViewRequests: undefined;
  FollowersList: { type: 'followers' | 'following' };
};

// Main Bottom Tabs
export type MainTabParamList = {
  MapTab: undefined;
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CreateBubbleTab: undefined;
  NotificationsTab: undefined;
  ChatsTab: NavigatorScreenParams<ChatStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Root App Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  CreateBubbleModal: undefined;
  CommunityFlow: NavigatorScreenParams<CommunityStackParamList> | undefined;
};
