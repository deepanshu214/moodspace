import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 1200);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoOrb}>
          <Typography variant="display">🔮</Typography>
        </View>
        <Typography variant="display" weight="heavy" color={theme.colors.primaryLight}>
          MoodSpace
        </Typography>
        <Typography variant="body" color={theme.colors.textMuted} style={styles.tagline}>
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
  },
  logoOrb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.glow(theme.colors.primary, 0.4),
  },
  tagline: {
    marginTop: theme.spacing.sm,
    letterSpacing: 0.5,
  },
});
