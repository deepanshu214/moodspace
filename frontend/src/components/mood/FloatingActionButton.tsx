import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '../common/Typography';
import { Ionicons } from '@expo/vector-icons';

export interface FloatingActionButtonProps {
  onPress: () => void;
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  color?: string;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  label,
  iconName = 'add',
  color = theme.colors.primary,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.fab,
        {
          backgroundColor: color,
          borderRadius: label ? theme.radius.pill : 30,
          paddingHorizontal: label ? 20 : 0,
        },
        styles.glow,
        style,
      ]}
    >
      <Ionicons name={iconName} size={26} color="#FFFFFF" />
      {label && (
        <Typography variant="button" color="#FFFFFF" style={styles.label}>
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    minWidth: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },
  glow: {
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  label: {
    marginLeft: 8,
  },
});
