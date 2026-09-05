import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from './Typography';

export interface DividerProps {
  label?: string;
  vertical?: boolean;
  color?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  label,
  vertical = false,
  color = theme.colors.border,
  style,
}) => {
  if (vertical) {
    return (
      <View
        style={[
          styles.verticalDivider,
          { backgroundColor: color },
          style,
        ]}
      />
    );
  }

  if (label) {
    return (
      <View style={[styles.labeledContainer, style]}>
        <View style={[styles.line, { backgroundColor: color }]} />
        <Typography variant="caption" color={theme.colors.textMuted} style={styles.labelText}>
          {label}
        </Typography>
        <View style={[styles.line, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontalDivider,
        { backgroundColor: color },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontalDivider: {
    height: 1,
    width: '100%',
    marginVertical: theme.spacing.md,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: theme.spacing.md,
  },
  labeledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
  },
  labelText: {
    paddingHorizontal: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
