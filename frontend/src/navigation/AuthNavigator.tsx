import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { SplashScreen } from '@/screens/auth/SplashScreen';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { OnboardingNavigator } from './OnboardingNavigator';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
};
