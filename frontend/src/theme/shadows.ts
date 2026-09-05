import { ViewStyle, Platform } from 'react-native';

export const shadows = {
  none: {} as ViewStyle,

  subtle: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,

  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,

  elevated: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,

  glow: (color: string, intensity = 0.45): ViewStyle =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: intensity,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }) || {},
};
