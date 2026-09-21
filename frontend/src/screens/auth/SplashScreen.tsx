import React, { useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useAuthStore } from '@/stores/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  useEffect(() => {
    if (!isInitializing) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigation.replace('Welcome');
        }
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [isInitializing, isAuthenticated, navigation]);

  return (
    <ScreenWrapper style={{ flex: 1 }}>
      <LoadingScreen title="Gathering good vibes..." subtitle="Finding warm frequencies near you" />
    </ScreenWrapper>
  );
};
