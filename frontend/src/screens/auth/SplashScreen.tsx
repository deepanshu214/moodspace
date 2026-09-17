import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { MoodOrbLoader } from '@/components/effects/MoodOrbLoader';
import { useAuthStore } from '@/stores/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAuthenticated, isInitializing } = useAuthStore();
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(10);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    titleY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
  }, []);

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

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.centerContent}>
        <MoodOrbLoader size={132} />

        <Animated.View style={titleStyle}>
          <Typography variant="display" weight="heavy" color={colors.primary} style={styles.brandTitle}>
            MoodSpace
          </Typography>

          <Typography variant="body" color={colors.textMuted} align="center" style={styles.tagline}>
            Express, Connect & Resonate
          </Typography>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    position: 'relative',
  },
  brandTitle: {
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  tagline: {
    marginTop: theme.spacing.sm,
    letterSpacing: 0.5,
  },
});
