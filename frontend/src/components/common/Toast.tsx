import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  type = 'info',
  message,
  onDismiss,
  style,
}) => {
  if (!visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: theme.colors.success,
          bg: theme.colors.surfaceElevated,
          border: theme.colors.success,
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: theme.colors.error,
          bg: theme.colors.surfaceElevated,
          border: theme.colors.error,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: theme.colors.warning,
          bg: theme.colors.surfaceElevated,
          border: theme.colors.warning,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: theme.colors.info,
          bg: theme.colors.surfaceElevated,
          border: theme.colors.info,
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        style,
      ]}
    >
      <Ionicons name={config.icon} size={20} color={config.color} style={styles.icon} />
      <Typography variant="bodySmall" color={theme.colors.textPrimary} style={styles.message}>
        {message}
      </Typography>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    zIndex: 9999,
    ...theme.shadows.elevated,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
  },
});
