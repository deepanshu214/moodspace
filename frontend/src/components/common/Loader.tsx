import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from './Typography';
import { MoodOrbLoader } from '@/components/effects/MoodOrbLoader';

export interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  /** Use the themed orbiting mood-bubble animation instead of a plain spinner. Defaults to true for large/fullScreen loaders, false for small inline ones. */
  themed?: boolean;
  style?: ViewStyle;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  color,
  message,
  fullScreen = false,
  themed,
  style,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color ?? colors.primary;
  const useThemedOrb = themed ?? (size === 'large' || fullScreen);

  const content = useThemedOrb ? (
    <MoodOrbLoader size={size === 'large' ? 108 : 72} message={message} style={style} />
  ) : (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Typography
          variant="bodySmall"
          color={colors.textSecondary}
          style={styles.message}
        >
          {message}
        </Typography>
      )}
    </View>
  );

  if (fullScreen) {
    return <View style={[styles.fullScreenOverlay, { backgroundColor: colors.overlay }]}>{content}</View>;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  message: {
    marginTop: theme.spacing.md,
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
