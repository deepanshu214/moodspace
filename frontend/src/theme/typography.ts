import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  fontFamily,

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  variants: {
    display: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '700',
      letterSpacing: -0.5,
    } as TextStyle,

    h1: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700',
      letterSpacing: -0.3,
    } as TextStyle,

    h2: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600',
      letterSpacing: -0.2,
    } as TextStyle,

    h3: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600',
    } as TextStyle,

    h4: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600',
    } as TextStyle,

    title: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
    } as TextStyle,

    bodyLarge: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
    } as TextStyle,

    body: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
    } as TextStyle,

    bodySmall: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
    } as TextStyle,

    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
    } as TextStyle,

    button: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.2,
    } as TextStyle,

    label: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    } as TextStyle,
  },
};

export type TypographyVariant = keyof typeof typography.variants;
