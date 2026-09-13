import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

/**
 * MoodSpace Haptic Feedback Engine
 * Gracefully degrades on Web or unsupported hardware
 */

export const haptics = {
  light: async () => {
    if (Platform.OS === 'web') return;
    try {
      await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
    } catch {
      // safe fallback
    }
  },

  medium: async () => {
    if (Platform.OS === 'web') return;
    try {
      await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
    } catch {
      // safe fallback
    }
  },

  heavy: async () => {
    if (Platform.OS === 'web') return;
    try {
      await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // safe fallback
    }
  },

  selection: async () => {
    if (Platform.OS === 'web') return;
    try {
      await ExpoHaptics.selectionAsync();
    } catch {
      // safe fallback
    }
  },

  success: async () => {
    if (Platform.OS === 'web') return;
    try {
      await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
    } catch {
      // safe fallback
    }
  },

  warning: async () => {
    if (Platform.OS === 'web') return;
    try {
      await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning);
    } catch {
      // safe fallback
    }
  },

  error: async () => {
    if (Platform.OS === 'web') return;
    try {
      await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error);
    } catch {
      // safe fallback
    }
  },
};
