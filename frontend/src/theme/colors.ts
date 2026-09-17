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

// ─── Shared emotion configs — soft pastel tones ───────────────────────────────
// `primary` is the pastel fill (orbs, borders, washes).
// `deep` is the legible ink for text/icons sitting on white or cream.
const emotionPalette: Record<string, EmotionColorConfig> = {
  joy: {
    primary: '#FFE082', deep: '#B07D18', glow: 'rgba(255,224,130,0.55)',
    background: 'rgba(255,224,130,0.22)', border: 'rgba(255,224,130,0.60)',
    emoji: '☀️', label: 'Joy', gradientPair: ['#FFE082', '#FFD54F'],
  },
  sadness: {
    primary: '#C5CAE9', deep: '#5567A8', glow: 'rgba(197,202,233,0.52)',
    background: 'rgba(197,202,233,0.24)', border: 'rgba(197,202,233,0.60)',
    emoji: '🌧️', label: 'Sadness', gradientPair: ['#C5CAE9', '#B3BCE2'],
  },
  anxiety: {
    primary: '#E1BEE7', deep: '#8E5C99', glow: 'rgba(225,190,231,0.52)',
    background: 'rgba(225,190,231,0.24)', border: 'rgba(225,190,231,0.60)',
    emoji: '⚡', label: 'Heavy', gradientPair: ['#E1BEE7', '#D1A7DC'],
  },
  calm: {
    primary: '#A7D7C5', deep: '#3F8B72', glow: 'rgba(167,215,197,0.55)',
    background: 'rgba(167,215,197,0.24)', border: 'rgba(167,215,197,0.62)',
    emoji: '🌿', label: 'Calm', gradientPair: ['#A7D7C5', '#80CBC4'],
  },
  anger: {
    primary: '#FFCCBC', deep: '#C5573C', glow: 'rgba(255,204,188,0.55)',
    background: 'rgba(255,204,188,0.26)', border: 'rgba(255,204,188,0.62)',
    emoji: '🔥', label: 'Fiery', gradientPair: ['#FFCCBC', '#FFAB91'],
  },
  loneliness: {
    primary: '#D1C4E9', deep: '#6E5AA0', glow: 'rgba(209,196,233,0.52)',
    background: 'rgba(209,196,233,0.24)', border: 'rgba(209,196,233,0.60)',
    emoji: '🕊️', label: 'Quiet', gradientPair: ['#D1C4E9', '#BCAAE0'],
  },
  excitement: {
    primary: '#FFE0B2', deep: '#C2762A', glow: 'rgba(255,224,178,0.55)',
    background: 'rgba(255,224,178,0.26)', border: 'rgba(255,224,178,0.62)',
    emoji: '🎉', label: 'Hype', gradientPair: ['#FFE0B2', '#FFCC80'],
  },
  love: {
    primary: '#F8BBD0', deep: '#C2557E', glow: 'rgba(248,187,208,0.55)',
    background: 'rgba(248,187,208,0.24)', border: 'rgba(248,187,208,0.62)',
    emoji: '💖', label: 'Love', gradientPair: ['#F8BBD0', '#F48FB1'],
  },
  neutral: {
    primary: '#D7CCC8', deep: '#6D5C54', glow: 'rgba(215,204,200,0.45)',
    background: 'rgba(215,204,200,0.22)', border: 'rgba(215,204,200,0.55)',
    emoji: '☕', label: 'Cozy', gradientPair: ['#D7CCC8', '#C4B5AF'],
  },
};

// ─── LIGHT MODE (Default) — Soft Pastel Almond Daylight ──────────────────────
// Warm, airy, uncluttered. Espresso ink keeps every label fully legible.
export const lightColors = {
  background: '#FAF7F2',          // warm almond cream
  backgroundSecondary: '#F4EFE8',
  surface: '#FFFFFF',             // pure white cards
  surfaceElevated: '#FFFDFB',
  surfaceHighlight: '#FDF2EA',

  // White cards edged with a soft pastel hairline
  glass: {
    surface: 'rgba(255,255,255,0.96)',
    surfaceHover: '#FFFFFF',
    surfaceActive: '#FFFDFB',
    surfaceSolid: '#FFFFFF',
    border: '#F0E7DD',                    // soft pastel border
    borderLight: 'rgba(240,231,221,0.62)',
    borderGlow: 'rgba(255,138,101,0.30)',
    borderAccent: 'rgba(255,138,101,0.48)',
  },

  primary: '#FF8A65',       // soft pastel coral — the brand tone
  primaryLight: '#FFBB93',  // pastel peach — fills, borders, gradients only
  primaryDark: '#C2472A',   // deep terracotta — legible ink on white
  secondary: '#FFD54F',     // pastel buttercup
  secondaryLight: '#FFE9A3',
  accent: '#80CBC4',        // pastel seafoam

  // Legible accent inks for TEXT/ICONS. Pastel fills are too pale to read on
  // cream, so anything rendering type in an accent colour uses these instead.
  accentInk: '#C2472A',
  secondaryInk: '#B07D18',

  aurora: {
    default: ['#FFCDB2', '#FFE082', '#F8BBD0'] as string[],
    calm: ['#A7D7C5', '#80CBC4', '#C7EAE0'] as string[],
    joy: ['#FFE082', '#FFD54F', '#FFCDB2'] as string[],
    anxiety: ['#E1BEE7', '#D1C4E9', '#F8BBD0'] as string[],
    anger: ['#FFCCBC', '#FFAB91', '#FFCDB2'] as string[],
    sadness: ['#C5CAE9', '#D1C4E9', '#A7D7C5'] as string[],
    love: ['#F8BBD0', '#FFCDB2', '#F48FB1'] as string[],
    excitement: ['#FFE0B2', '#FFCC80', '#FFCDB2'] as string[],
    loneliness: ['#D1C4E9', '#C5CAE9', '#A7D7C5'] as string[],
    neutral: ['#D7CCC8', '#E3DAD5', '#C4B5AF'] as string[],
  } as Record<string, string[]>,

  border: '#F0E7DD',              // soft pastel border
  borderLight: '#F7F1EA',
  borderHighlight: 'rgba(255,138,101,0.42)',

  // Espresso ink on almond cream = maximum legibility
  textPrimary: '#2D241E',         // dark espresso
  textSecondary: '#5F5048',       // warm taupe
  textMuted: '#8D7B70',           // light taupe — still readable
  textDisabled: '#BCAEA4',
  textInverse: '#FFFFFF',

  success: '#4DB6A0',
  successLight: 'rgba(167,215,197,0.28)',
  warning: '#D9922E',
  warningLight: 'rgba(255,224,178,0.34)',
  error: '#D96A54',
  errorLight: 'rgba(255,204,188,0.32)',
  info: '#7E9CD8',
  infoLight: 'rgba(197,202,233,0.32)',

  overlay: 'rgba(45,36,30,0.48)',
  overlayLight: 'rgba(45,36,30,0.22)',

  emotions: emotionPalette,
};

// ─── DARK MODE — Jewel Indigo, pastels glowing against it ────────────────────
export const darkColors = {
  background: '#18082E',          // deep indigo-purple
  backgroundSecondary: '#22103C',
  surface: '#2C1852',
  surfaceElevated: '#3A2266',
  surfaceHighlight: '#4A2D7C',

  glass: {
    surface: 'rgba(44,24,82,0.78)',
    surfaceHover: 'rgba(58,34,102,0.85)',
    surfaceActive: 'rgba(74,45,124,0.92)',
    surfaceSolid: 'rgba(44,24,82,0.97)',
    border: 'rgba(248,187,208,0.20)',
    borderLight: 'rgba(248,187,208,0.11)',
    borderGlow: 'rgba(255,138,101,0.38)',
    borderAccent: 'rgba(255,138,101,0.55)',
  },

  primary: '#FF8A65',
  primaryLight: '#FFBB93',
  primaryDark: '#E2603C',
  secondary: '#FFD54F',
  secondaryLight: '#FFE9A3',
  accent: '#80CBC4',

  // On jewel indigo the pastels themselves are the legible inks.
  accentInk: '#FFBB93',
  secondaryInk: '#FFD54F',

  aurora: {
    default: ['#FFCDB2', '#FFE082', '#F8BBD0'] as string[],
    calm: ['#A7D7C5', '#80CBC4', '#C7EAE0'] as string[],
    joy: ['#FFE082', '#FFD54F', '#FFCDB2'] as string[],
    anxiety: ['#E1BEE7', '#D1C4E9', '#F8BBD0'] as string[],
    anger: ['#FFCCBC', '#FFAB91', '#FFCDB2'] as string[],
    sadness: ['#C5CAE9', '#D1C4E9', '#A7D7C5'] as string[],
    love: ['#F8BBD0', '#FFCDB2', '#F48FB1'] as string[],
    excitement: ['#FFE0B2', '#FFCC80', '#FFCDB2'] as string[],
    loneliness: ['#D1C4E9', '#C5CAE9', '#A7D7C5'] as string[],
    neutral: ['#C4B5AF', '#D7CCC8', '#E3DAD5'] as string[],
  } as Record<string, string[]>,

  border: '#3C2060',
  borderLight: '#4A2D72',
  borderHighlight: 'rgba(255,138,101,0.45)',

  textPrimary: '#FDF6F0',
  textSecondary: '#D9C2B8',
  textMuted: '#A28C9C',
  textDisabled: '#5A3C5E',
  textInverse: '#2D241E',

  success: '#A7D7C5',
  successLight: 'rgba(167,215,197,0.18)',
  warning: '#FFD54F',
  warningLight: 'rgba(255,213,79,0.18)',
  error: '#FFAB91',
  errorLight: 'rgba(255,171,145,0.18)',
  info: '#C5CAE9',
  infoLight: 'rgba(197,202,233,0.18)',

  overlay: 'rgba(12,4,20,0.80)',
  overlayLight: 'rgba(12,4,20,0.48)',

  emotions: emotionPalette,
};

// Default = light
export const colors = lightColors;

export const getEmotionConfig = (emotionName?: string): EmotionColorConfig => {
  if (!emotionName) return emotionPalette.neutral;
  const key = emotionName.toLowerCase().trim();
  return emotionPalette[key] || emotionPalette.neutral;
};

export const getAuroraColors = (emotionName?: string): string[] => {
  if (!emotionName) return lightColors.aurora.default;
  const key = emotionName.toLowerCase().trim();
  return lightColors.aurora[key] || lightColors.aurora.default;
};
