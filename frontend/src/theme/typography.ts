import { TextStyle, Platform } from 'react-native';

export type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodyLarge'
  | 'bodySmall'
  | 'caption'
  | 'overline'
  | 'stat'
  | 'label'
  | 'title'
  | 'button';

export const weights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const typographyVariants: Record<TypographyVariant, TextStyle> = {
  display: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  overline: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 2.0,
    textTransform: 'uppercase',
  },
  stat: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
};

export const typography = Object.assign({}, typographyVariants, {
  variants: typographyVariants,
  weights,
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
});
