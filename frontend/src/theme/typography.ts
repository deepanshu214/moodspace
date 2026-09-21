import { TextStyle } from 'react-native';

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

type WeightValue = (typeof weights)[keyof typeof weights];

// Playful Neo-Editorial: Bricolage Grotesque for headlines and numbers,
// Plus Jakarta Sans for body copy and labels.
const DISPLAY: Record<WeightValue, string> = {
  '400': 'BricolageGrotesque_400Regular',
  '500': 'BricolageGrotesque_500Medium',
  '600': 'BricolageGrotesque_600SemiBold',
  '700': 'BricolageGrotesque_700Bold',
  '800': 'BricolageGrotesque_800ExtraBold',
};
const TEXT: Record<WeightValue, string> = {
  '400': 'PlusJakartaSans_400Regular',
  '500': 'PlusJakartaSans_500Medium',
  '600': 'PlusJakartaSans_600SemiBold',
  '700': 'PlusJakartaSans_700Bold',
  '800': 'PlusJakartaSans_800ExtraBold',
};
const TEXT_ITALIC: Record<WeightValue, string> = {
  '400': 'PlusJakartaSans_400Regular_Italic',
  '500': 'PlusJakartaSans_500Medium_Italic',
  '600': 'PlusJakartaSans_600SemiBold_Italic',
  '700': 'PlusJakartaSans_700Bold_Italic',
  '800': 'PlusJakartaSans_800ExtraBold_Italic',
};

const DISPLAY_VARIANTS: ReadonlySet<TypographyVariant> = new Set([
  'display', 'h1', 'h2', 'h3', 'h4', 'title', 'stat',
]);

const normalizeWeight = (w?: TextStyle['fontWeight']): WeightValue => {
  const n = w === 'bold' ? 700 : w === 'normal' || w == null ? 400 : Number(w);
  if (n >= 800) return '800';
  if (n >= 700) return '700';
  if (n >= 600) return '600';
  if (n >= 500) return '500';
  return '400';
};

/**
 * Custom fonts ship one family per weight, so the weight has to be baked into the
 * family name. Callers must then drop `fontWeight`: Android substitutes a system
 * font when a custom family is combined with a bold weight.
 */
export const resolveFontFamily = (
  variant: TypographyVariant,
  weight?: TextStyle['fontWeight'],
  italic = false
): string => {
  const w = normalizeWeight(weight);
  if (DISPLAY_VARIANTS.has(variant)) return DISPLAY[w];
  return italic ? TEXT_ITALIC[w] : TEXT[w];
};

/** Every font file the app needs, keyed by the family names used above. */
export const fontFamilies = { DISPLAY, TEXT, TEXT_ITALIC };

export const typographyVariants: Record<TypographyVariant, TextStyle> = {
  display: { fontSize: 40, fontWeight: '800', lineHeight: 44, letterSpacing: -1.2 },
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 36, letterSpacing: -0.64 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 28, letterSpacing: -0.24 },
  h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  title: { fontSize: 20, fontWeight: '700', lineHeight: 26, letterSpacing: -0.2 },
  h4: { fontSize: 18, fontWeight: '700', lineHeight: 22, letterSpacing: -0.18 },
  bodyLarge: { fontSize: 18, fontWeight: '500', lineHeight: 26, letterSpacing: -0.18 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18, letterSpacing: 0.13 },
  caption: { fontSize: 12, fontWeight: '700', lineHeight: 16, letterSpacing: 0.36 },
  overline: {
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  stat: { fontSize: 28, fontWeight: '800', lineHeight: 32, fontVariant: ['tabular-nums'] },
  label: { fontSize: 14, fontWeight: '700', lineHeight: 18, letterSpacing: 0.28 },
  button: { fontSize: 14, fontWeight: '700', lineHeight: 18, letterSpacing: 0.28 },
};

export const typography = Object.assign({}, typographyVariants, {
  variants: typographyVariants,
  weights,
  fontFamily: TEXT['400'],
});
