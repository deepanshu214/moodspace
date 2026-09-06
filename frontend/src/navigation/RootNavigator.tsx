import React from 'react';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CreateBubbleScreen } from '@/screens/home/CreateBubbleScreen';
import { useAuthStore } from '@/stores/authStore';
import { theme } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MoodSpaceTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.secondary,
  },
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer theme={MoodSpaceTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}

        {/* Global Presentation Modals */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="CreateBubbleModal" component={CreateBubbleScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};
