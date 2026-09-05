import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from './Typography';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';

export interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'planet-outline',
  emoji,
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        {emoji ? (
          <Typography variant="display">{emoji}</Typography>
        ) : (
          <Ionicons name={iconName} size={42} color={theme.colors.primaryLight} />
        )}
      </View>

      <Typography variant="h3" weight="semibold" align="center" style={styles.title}>
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body"
          color={theme.colors.textSecondary}
          align="center"
          style={styles.description}
        >
          {description}
        </Typography>
      )}

      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    marginVertical: theme.spacing.xxxl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  description: {
    maxWidth: 280,
    marginBottom: theme.spacing.xl,
  },
  actionBtn: {
    marginTop: theme.spacing.sm,
  },
});
