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

// Home Flow
export type HomeStackParamList = {
  HomeScreen: undefined;
  BubbleDetails: { bubbleId: string; emotion?: string; authorName?: string };
};

// Chats Flow
export type ChatStackParamList = {
  Conversations: undefined;
  ChatDetail: {
    chatId: string;
    recipientName: string;
    recipientAvatar?: string | null;
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
};

// Main Bottom Tabs
export type MainTabParamList = {
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
};
