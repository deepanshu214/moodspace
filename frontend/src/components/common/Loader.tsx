import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
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
  color,
  message,
  fullScreen = false,
  style,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color ?? colors.primary;
  const content = (
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
