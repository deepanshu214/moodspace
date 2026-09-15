import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CreateBubbleScreen } from '@/screens/home/CreateBubbleScreen';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';
import { theme, colors } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MoodSpaceTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: 'transparent',
    card: colors.glass.surface,
    text: colors.textPrimary,
    border: colors.glass.border,
    notification: colors.secondary,
  },
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <View style={styles.container}>
      {/* Global Living Aurora Backdrop */}
      <AuroraBackground emotion="calm" />

      <NavigationContainer theme={MoodSpaceTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            <Stack.Screen name="Main" component={MainTabNavigator} />
          )}

          {/* Global Presentation Modals */}
          <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
            <Stack.Screen name="CreateBubbleModal" component={CreateBubbleScreen} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
