import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import { OnboardingProfileScreen } from '@/screens/onboarding/OnboardingProfileScreen';
import { OnboardingDOBScreen } from '@/screens/onboarding/OnboardingDOBScreen';
import { OnboardingPermissionsScreen } from '@/screens/onboarding/OnboardingPermissionsScreen';
import { OnboardingCompleteScreen } from '@/screens/onboarding/OnboardingCompleteScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OnboardingProfile" component={OnboardingProfileScreen} />
      <Stack.Screen name="OnboardingDOB" component={OnboardingDOBScreen} />
      <Stack.Screen name="OnboardingPermissions" component={OnboardingPermissionsScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
};
