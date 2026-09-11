import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { BubbleDetailScreen } from '@/screens/home/BubbleDetailScreen';
import { FeedScreen } from '@/screens/feed/FeedScreen';
import { CommunityNavigator } from './CommunityNavigator';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="BubbleDetails" component={BubbleDetailScreen} />
      <Stack.Screen name="FeedStream" component={FeedScreen} />
      <Stack.Screen name="CommunityFlow" component={CommunityNavigator} />
    </Stack.Navigator>
  );
};
