import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from './Typography';

export interface LoaderProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  color = theme.colors.primary,
  message,
  fullScreen = false,
  style,
}) => {
  const content = (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Typography
          variant="bodySmall"
          color={theme.colors.textSecondary}
          style={styles.message}
        >
          {message}
        </Typography>
      )}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreenOverlay}>{content}</View>;
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
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
