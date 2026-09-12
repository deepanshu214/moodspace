import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatStackParamList } from './types';
import { ConversationsScreen } from '@/screens/chats/ConversationsScreen';
import { ChatDetailScreen } from '@/screens/chats/ChatDetailScreen';
import { EchoMatchScreen } from '@/screens/chats/EchoMatchScreen';
import { IcebreakerPickerModal } from '@/screens/chats/IcebreakerPickerModal';

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
      <Stack.Screen name="EchoMatch" component={EchoMatchScreen} />
      <Stack.Screen
        name="IcebreakerPicker"
        component={IcebreakerPickerModal}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
