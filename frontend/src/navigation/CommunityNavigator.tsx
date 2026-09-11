import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommunityStackParamList } from './types';
import {
  CommunityListScreen,
  CommunityDetailScreen,
  CreateCommunityModal,
  CreateCommunityPostModal,
} from '@/screens/community';

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export const CommunityNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CommunityList" component={CommunityListScreen} />
      <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
      <Stack.Screen
        name="CreateCommunity"
        component={CreateCommunityModal}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="CreateCommunityPost"
        component={CreateCommunityPostModal}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
