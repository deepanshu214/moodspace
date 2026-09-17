import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isAuthenticated, isInitializing } = useAuthStore();
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigation.replace('Welcome');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isInitializing, isAuthenticated, navigation]);

  const animatedOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.centerContent}>
        <Animated.View style={[styles.glowHalo, animatedOrbStyle]} />

        <View style={[styles.logoOrb, { backgroundColor: colors.surfaceElevated }]}>
          <Typography variant="display">🔮</Typography>
        </View>

        <Typography variant="display" weight="heavy" color={colors.primaryLight} style={styles.brandTitle}>
          MoodSpace
        </Typography>

        <Typography variant="body" color={colors.textMuted} style={styles.tagline}>
          Express, Connect & Resonate
        </Typography>
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
  glowHalo: {
    position: 'absolute',
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.primaryDark,
    ...theme.shadows.glow(theme.colors.primary, 0.7),
  },
  logoOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    zIndex: 2,
    ...theme.shadows.glow(theme.colors.primary, 0.5),
  },
  brandTitle: {
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: theme.spacing.sm,
    letterSpacing: 0.5,
  },
});
