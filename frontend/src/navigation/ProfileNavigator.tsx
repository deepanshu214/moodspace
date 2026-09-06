import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { UserProfileScreen } from '@/screens/profile/UserProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import { FollowRequestsScreen } from '@/screens/profile/FollowRequestsScreen';
import { ProfileViewRequestsScreen } from '@/screens/profile/ProfileViewRequestsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MyProfile" component={ProfileScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="FollowRequests" component={FollowRequestsScreen} />
      <Stack.Screen name="ProfileViewRequests" component={ProfileViewRequestsScreen} />
    </Stack.Navigator>
  );
};
