export interface EmotionColorConfig {
  primary: string;
  /** Saturated, legible counterpart for text/icons on light surfaces. */
  deep: string;
  glow: string;
  background: string;
  border: string;
  emoji: string;
  label: string;
  gradientPair: [string, string];
}

// ─── Playful Neo-Editorial mood pigments (Stitch design system) ──────────────
// `primary` is the mood fill (glyph chips, orbs, strips, washes).
// `deep` is the legible ink (>=4.8:1) for text/icons on canvas, card or warm tint.
// Text on a SOLID fill uses `inkOnPastel` (#1E1E1E) — >=6:1 on every fill.
// `emoji` stays for legacy call sites; the UI renders <MoodGlyph /> instead.
const emotionPalette: Record<string, EmotionColorConfig> = {
  joy: {
    primary: '#FFD15C', deep: '#8C6500', glow: 'rgba(255, 209, 92, 0.35)',
    background: 'rgba(255,209,92,0.22)', border: 'rgba(255,209,92,0.70)',
    emoji: '☀️', label: 'Joy', gradientPair: ['#FFD15C', '#FB923C'],
  },
  calm: {
    primary: '#5CD694', deep: '#1F7A49', glow: 'rgba(92, 214, 148, 0.35)',
    background: 'rgba(92,214,148,0.18)', border: 'rgba(92,214,148,0.65)',
    emoji: '🌿', label: 'Calm', gradientPair: ['#5CD694', '#60A5FA'],
  },
  love: {
    primary: '#FF80B0', deep: '#D40050', glow: 'rgba(255, 128, 176, 0.35)',
    background: 'rgba(255,128,176,0.18)', border: 'rgba(255,128,176,0.65)',
    emoji: '💖', label: 'Love', gradientPair: ['#FF80B0', '#FF5C38'],
  },
  sadness: {
    primary: '#60A5FA', deep: '#0767DE', glow: 'rgba(96, 165, 250, 0.35)',
    background: 'rgba(96,165,250,0.16)', border: 'rgba(96,165,250,0.65)',
    emoji: '🌧️', label: 'Sadness', gradientPair: ['#60A5FA', '#C084FC'],
  },
  anxiety: {
    primary: '#C084FC', deep: '#932DFA', glow: 'rgba(192, 132, 252, 0.35)',
    background: 'rgba(192,132,252,0.16)', border: 'rgba(192,132,252,0.65)',
    emoji: '⚡', label: 'Heavy', gradientPair: ['#C084FC', '#60A5FA'],
  },
  anger: {
    primary: '#F87171', deep: '#D70B0B', glow: 'rgba(248, 113, 113, 0.35)',
    background: 'rgba(248,113,113,0.16)', border: 'rgba(248,113,113,0.65)',
    emoji: '🔥', label: 'Fiery', gradientPair: ['#F87171', '#FF5C38'],
  },
  excitement: {
    primary: '#FB923C', deep: '#AF5104', glow: 'rgba(251, 146, 60, 0.35)',
    background: 'rgba(251,146,60,0.16)', border: 'rgba(251,146,60,0.65)',
    emoji: '🎉', label: 'Hype', gradientPair: ['#FB923C', '#FFD15C'],
  },
  loneliness: {
    primary: '#CBD5E1', deep: '#526D8E', glow: 'rgba(203, 213, 225, 0.35)',
    background: 'rgba(203,213,225,0.28)', border: 'rgba(203,213,225,0.80)',
    emoji: '🕊️', label: 'Quiet', gradientPair: ['#CBD5E1', '#60A5FA'],
  },
  neutral: {
    primary: '#E2D4C3', deep: '#856640', glow: 'rgba(226, 212, 195, 0.35)',
    background: 'rgba(226,212,195,0.28)', border: 'rgba(226,212,195,0.80)',
    emoji: '☕', label: 'Cozy', gradientPair: ['#E2D4C3', '#FFD15C'],
  },
};

// ─── LIGHT — "Playful Neo-Editorial": newsprint paper, ink contours ──────────
export const lightColors = {
  background: '#FFFDF9',          // warm vintage newsprint
  backgroundSecondary: '#F6F3F2',
  surface: '#FFFFFF',             // crisp card
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#FFF4DC',    // warm editorial tint
  surfaceWarm: '#FFF4DC',

  // Structural ink: 2px contours + hard offset shadows (see <Tactile />).
  ink: '#1E1E1E',
  hardShadow: '#1E1E1E',

  glass: {
    surface: '#FFFFFF',
    surfaceHover: '#FFFFFF',
    surfaceActive: '#FFF4DC',
    surfaceSolid: '#FFFFFF',
    border: '#1E1E1E',
    borderLight: '#E5E2E1',
    borderGlow: 'rgba(255,92,56,0.55)',
    borderAccent: '#FF5C38',
  },

  primary: '#FF5C38',       // Tangerine Punch — carries ink text, never white (3.07:1)
  primaryLight: '#FFB4A3',  // fills, tints, gradients only
  primaryDark: '#B52705',   // tangerine as legible text on paper
  secondary: '#FFD15C',     // Buttercup Sun
  secondaryLight: '#FFDF97',
  accent: '#5CD694',        // Mint Calm

  accentInk: '#B52705',
  secondaryInk: '#775A00',
  successInk: '#006D41',
  errorInk: '#BA1A1A',

  aurora: {
    default: ['#FF5C38', '#FFD15C', '#FF80B0'] as string[],
    calm: ['#5CD694', '#60A5FA', '#FFD15C'] as string[],
    joy: ['#FFD15C', '#FB923C', '#FF5C38'] as string[],
    anxiety: ['#C084FC', '#60A5FA', '#FF80B0'] as string[],
    anger: ['#F87171', '#FF5C38', '#FB923C'] as string[],
    sadness: ['#60A5FA', '#C084FC', '#5CD694'] as string[],
    love: ['#FF80B0', '#FF5C38', '#FFD15C'] as string[],
    excitement: ['#FB923C', '#FFD15C', '#FF5C38'] as string[],
    loneliness: ['#CBD5E1', '#60A5FA', '#C084FC'] as string[],
    neutral: ['#E2D4C3', '#FFD15C', '#CBD5E1'] as string[],
  } as Record<string, string[]>,

  border: '#1E1E1E',
  borderLight: '#E5E2E1',
  borderHighlight: '#FF5C38',

  textPrimary: '#1E1E1E',         // 16.4:1 on canvas
  textSecondary: '#52525B',       // 7.6:1
  textMuted: '#6B6B74',           // 4.8:1 even on the warm tint
  textDisabled: '#A1A1AA',
  textInverse: '#FFFDF9',

  success: '#5CD694',
  successLight: 'rgba(92,214,148,0.20)',
  warning: '#FFD15C',
  warningLight: 'rgba(255,209,92,0.25)',
  error: '#BA1A1A',               // white text on it: 6.5:1
  errorLight: '#FFDAD6',
  info: '#60A5FA',
  infoLight: 'rgba(96,165,250,0.18)',

  overlay: 'rgba(30,30,30,0.55)',
  overlayLight: 'rgba(30,30,30,0.25)',

  emotions: emotionPalette,
};

// ─── DARK — "Obsidian": ink-dipped charcoal, pitch hard shadows ─────────────
export const darkColors = {
  background: '#121316',          // obsidian canvas
  backgroundSecondary: '#0D0E11',
  surface: '#1C1E24',             // card
  surfaceElevated: '#252830',     // sheets, toolbars
  surfaceHighlight: '#2E323B',
  surfaceWarm: '#252830',

  ink: '#333842',
  hardShadow: '#000000',

  glass: {
    surface: '#1C1E24',
    surfaceHover: '#252830',
    surfaceActive: '#2E323B',
    surfaceSolid: '#1C1E24',
    border: '#333842',
    borderLight: '#252830',
    borderGlow: 'rgba(255,92,56,0.55)',
    borderAccent: '#FF5C38',
  },

  primary: '#FF5C38',
  primaryLight: '#FFB4A3',
  primaryDark: '#FF5C38',
  secondary: '#FFD15C',
  secondaryLight: '#FFDF97',
  accent: '#10B981',              // Mint Emerald

  // On obsidian the pigments themselves are the legible inks.
  accentInk: '#FF5C38',           // 5.4:1 on card
  secondaryInk: '#FFD15C',
  successInk: '#10B981',
  errorInk: '#FFB4AB',

  aurora: {
    default: ['#FF5C38', '#FFD15C', '#FF80B0'] as string[],
    calm: ['#10B981', '#60A5FA', '#FFD15C'] as string[],
    joy: ['#FFD15C', '#FB923C', '#FF5C38'] as string[],
    anxiety: ['#C084FC', '#60A5FA', '#FF80B0'] as string[],
    anger: ['#F87171', '#FF5C38', '#FB923C'] as string[],
    sadness: ['#60A5FA', '#C084FC', '#10B981'] as string[],
    love: ['#FF80B0', '#FF5C38', '#FFD15C'] as string[],
    excitement: ['#FB923C', '#FFD15C', '#FF5C38'] as string[],
    loneliness: ['#CBD5E1', '#60A5FA', '#C084FC'] as string[],
    neutral: ['#E2D4C3', '#FFD15C', '#CBD5E1'] as string[],
  } as Record<string, string[]>,

  border: '#333842',
  borderLight: '#252830',
  borderHighlight: '#FF5C38',

  textPrimary: '#F5F6F8',         // 15.4:1 on card
  textSecondary: '#9EA3AE',       // 6.6:1
  textMuted: '#8A90A0',           // 5.2:1 (Stitch's #636A79 is only 3.1:1)
  textDisabled: '#4A4F5A',
  textInverse: '#121316',

  success: '#10B981',
  successLight: 'rgba(16,185,129,0.18)',
  warning: '#FFD15C',
  warningLight: 'rgba(255,209,92,0.18)',
  error: '#FFB4AB',
  errorLight: 'rgba(255,180,171,0.16)',
  info: '#60A5FA',
  infoLight: 'rgba(96,165,250,0.16)',

  overlay: 'rgba(0,0,0,0.72)',
  overlayLight: 'rgba(0,0,0,0.45)',

  emotions: emotionPalette,
};

/** Ink for text on a solid pigment fill (tangerine buttons, selected chips): >=5.4:1. */
export const inkOnPastel = '#1E1E1E';

// Default = light
export const colors = lightColors;
export const glass = lightColors.glass;
export const aurora = lightColors.aurora;

export const getEmotionConfig = (emotionName?: string): EmotionColorConfig => {
  if (!emotionName) return emotionPalette.neutral;
  const key = emotionName.toLowerCase().trim();
  return emotionPalette[key] || emotionPalette.neutral;
};

/**
 * Legible ink for an emotion's text or icons: the saturated `deep` on light
 * surfaces, the pigment itself on obsidian.
 */
export const emotionInk = (config: EmotionColorConfig, isDark: boolean): string =>
  isDark ? config.primary : config.deep;

const inkByFill: Record<string, string> = Object.fromEntries(
  Object.values(emotionPalette).map((c) => [c.primary.toUpperCase(), c.deep])
);

/**
 * Legible ink for text/icons drawn in any mood fill stored in data (e.g. a
 * reaction colour). Unknown colours pass through unchanged.
 */
export const inkFor = (fill: string, isDark: boolean): string =>
  isDark ? fill : inkByFill[fill.toUpperCase()] ?? fill;

export const getAuroraColors = (emotionName?: string): string[] => {
  if (!emotionName) return lightColors.aurora.default;
  const key = emotionName.toLowerCase().trim();
  return lightColors.aurora[key] || lightColors.aurora.default;
};
