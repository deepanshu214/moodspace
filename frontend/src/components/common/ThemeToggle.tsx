import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context';
import { inkOnPastel } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { haptics } from '@/theme/haptics';
import type { ThemeMode } from '@/context';

const MODES: { mode: ThemeMode; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { mode: 'light', icon: 'sunny', label: 'Light' },
  { mode: 'dark', icon: 'moon', label: 'Dark' },
  { mode: 'system', icon: 'phone-portrait-outline', label: 'System' },
];

export interface ThemeToggleProps {
  /** Compact drops the labels, for tight headers. */
  compact?: boolean;
}

/**
 * ThemeToggle — an explicit Light / Dark / System switch.
 *
 * This replaced a single unlabelled icon that cycled modes: it worked, but with
 * five identical icons in the header nobody could tell which one changed the
 * theme, and "System" was only reachable from Settings.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = true }) => {
  const { colors, themeMode, setThemeMode } = useTheme();

  return (
    <View
      style={[styles.track, { borderColor: colors.ink, backgroundColor: colors.surface }]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Appearance"
    >
      {MODES.map((option) => {
        const active = themeMode === option.mode;
        return (
          <TouchableOpacity
            key={option.mode}
            onPress={() => {
              setThemeMode(option.mode);
              haptics.selection();
            }}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: active, checked: active }}
            accessibilityLabel={`${option.label} appearance`}
            style={[
              styles.segment,
              compact && styles.segmentCompact,
              active && { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons
              name={option.icon}
              size={14}
              color={active ? inkOnPastel : colors.textMuted}
            />
            {!compact && (
              <Typography
                variant="overline"
                style={{ color: active ? inkOnPastel : colors.textMuted, marginLeft: 5 }}
              >
                {option.label.toUpperCase()}
              </Typography>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 999,
    padding: 2,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    height: 26,
  },
  segmentCompact: {
    width: 28,
    paddingHorizontal: 0,
  },
});
