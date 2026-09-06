import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatStackParamList } from './types';
import { ConversationsScreen } from '@/screens/chats/ConversationsScreen';
import { ChatDetailScreen } from '@/screens/chats/ChatDetailScreen';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export const ChatNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Conversations" component={ConversationsScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
};
