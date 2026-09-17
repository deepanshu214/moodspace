export interface EmotionColorConfig {
  primary: string;
  glow: string;
  background: string;
  border: string;
  emoji: string;
  label: string;
  gradientPair: [string, string];
}

// ─── Shared emotion configs ────────────────────────────────────────────────────
const emotionPalette: Record<string, EmotionColorConfig> = {
  joy: {
    primary: '#FF9F1C', glow: 'rgba(255,159,28,0.35)',
    background: 'rgba(255,159,28,0.14)', border: 'rgba(255,159,28,0.35)',
    emoji: '☀️', label: 'Joy', gradientPair: ['#FF9F1C', '#FF6B35'],
  },
  sadness: {
    primary: '#4776E6', glow: 'rgba(71,118,230,0.30)',
    background: 'rgba(71,118,230,0.12)', border: 'rgba(71,118,230,0.28)',
    emoji: '🌧️', label: 'Sadness', gradientPair: ['#4776E6', '#8E54E9'],
  },
  anxiety: {
    primary: '#C471ED', glow: 'rgba(196,113,237,0.30)',
    background: 'rgba(196,113,237,0.12)', border: 'rgba(196,113,237,0.28)',
    emoji: '⚡', label: 'Heavy', gradientPair: ['#C471ED', '#F64F59'],
  },
  calm: {
    primary: '#00B4A6', glow: 'rgba(0,180,166,0.30)',
    background: 'rgba(0,180,166,0.12)', border: 'rgba(0,180,166,0.28)',
    emoji: '🌿', label: 'Calm', gradientPair: ['#00B4A6', '#1CB5E0'],
  },
  anger: {
    primary: '#F64F59', glow: 'rgba(246,79,89,0.30)',
    background: 'rgba(246,79,89,0.12)', border: 'rgba(246,79,89,0.28)',
    emoji: '🔥', label: 'Fiery', gradientPair: ['#F64F59', '#FF6B35'],
  },
  loneliness: {
    primary: '#7C4DFF', glow: 'rgba(124,77,255,0.30)',
    background: 'rgba(124,77,255,0.12)', border: 'rgba(124,77,255,0.28)',
    emoji: '🕊️', label: 'Quiet', gradientPair: ['#7C4DFF', '#4776E6'],
  },
  excitement: {
    primary: '#FF6B35', glow: 'rgba(255,107,53,0.32)',
    background: 'rgba(255,107,53,0.14)', border: 'rgba(255,107,53,0.30)',
    emoji: '🎉', label: 'Hype', gradientPair: ['#FF6B35', '#FF9F1C'],
  },
  love: {
    primary: '#FF4D84', glow: 'rgba(255,77,132,0.32)',
    background: 'rgba(255,77,132,0.12)', border: 'rgba(255,77,132,0.28)',
    emoji: '💖', label: 'Love', gradientPair: ['#FF4D84', '#FF6B35'],
  },
  neutral: {
    primary: '#8898AA', glow: 'rgba(136,152,170,0.25)',
    background: 'rgba(136,152,170,0.10)', border: 'rgba(136,152,170,0.22)',
    emoji: '☕', label: 'Cozy', gradientPair: ['#8898AA', '#B0BEC5'],
  },
};

// ─── LIGHT MODE (Default) — Warm Sunrise Social Vibe ─────────────────────────
// Bright, legible, colorful — like a happy social app
export const lightColors = {
  background: '#FFF5EB',          // warm cream — NOT dark, clearly readable
  backgroundSecondary: '#FFEEDD',
  surface: '#FFFFFF',             // pure white cards — always visible
  surfaceElevated: '#FFFBF7',
  surfaceHighlight: '#FFE8D0',

  // Cards get white bg + orange-tinted border so they POP on warm cream
  glass: {
    surface: 'rgba(255,255,255,0.96)',
    surfaceHover: '#FFFFFF',
    surfaceActive: '#FFFBF7',
    surfaceSolid: '#FFFFFF',
    border: 'rgba(255,107,53,0.18)',    // coral tint border — clearly visible
    borderLight: 'rgba(255,107,53,0.10)',
    borderGlow: 'rgba(255,107,53,0.35)',
    borderAccent: 'rgba(255,107,53,0.50)',
  },

  primary: '#FF6B35',       // vibrant coral-orange — the brand color
  primaryLight: '#FF9A6C',
  primaryDark: '#E0430E',
  secondary: '#FF9F1C',     // sunny amber/gold
  secondaryLight: '#FFCF6B',
  accent: '#00B4A6',        // teal — for calm contrast

  aurora: {
    default: ['#FF6B35', '#FF9F1C', '#FF4D84'] as string[],
    calm: ['#00B4A6', '#1CB5E0', '#84FAB0'] as string[],
    joy: ['#FF9F1C', '#FF6B35', '#FF4D84'] as string[],
    anxiety: ['#C471ED', '#F64F59', '#FF4D84'] as string[],
    anger: ['#F64F59', '#FF6B35', '#FF4E50'] as string[],
    sadness: ['#4776E6', '#8E54E9', '#00B4A6'] as string[],
    love: ['#FF4D84', '#FF6B35', '#F64F59'] as string[],
    excitement: ['#FF6B35', '#FF9F1C', '#FF4D84'] as string[],
    loneliness: ['#7C4DFF', '#4776E6', '#00B4A6'] as string[],
    neutral: ['#B0BEC5', '#90A4AE', '#78909C'] as string[],
  } as Record<string, string[]>,

  border: '#FFD4B8',              // warm coral border — visible on cream
  borderLight: '#FFE4CF',
  borderHighlight: 'rgba(255,107,53,0.45)',

  // Text — very dark brown on warm cream = MAXIMUM legibility
  textPrimary: '#1C0A00',         // near-black warm brown
  textSecondary: '#5C2E0A',       // medium warm brown
  textMuted: '#9C5A2A',           // lighter warm brown — still readable
  textDisabled: '#CCA882',
  textInverse: '#FFFFFF',

  success: '#00B4A6',
  successLight: 'rgba(0,180,166,0.12)',
  warning: '#FF9F1C',
  warningLight: 'rgba(255,159,28,0.15)',
  error: '#F64F59',
  errorLight: 'rgba(246,79,89,0.12)',
  info: '#4776E6',
  infoLight: 'rgba(71,118,230,0.12)',

  overlay: 'rgba(28,10,0,0.55)',
  overlayLight: 'rgba(28,10,0,0.25)',

  emotions: emotionPalette,
};

// ─── DARK MODE — Jewel Indigo-Purple, vibrant NOT black ─────────────────────
export const darkColors = {
  background: '#18082E',          // deep indigo-purple
  backgroundSecondary: '#22103C',
  surface: '#2C1852',
  surfaceElevated: '#3A2266',
  surfaceHighlight: '#4A2D7C',

  glass: {
    surface: 'rgba(44,24,82,0.75)',
    surfaceHover: 'rgba(58,34,102,0.82)',
    surfaceActive: 'rgba(74,45,124,0.90)',
    surfaceSolid: 'rgba(44,24,82,0.97)',
    border: 'rgba(255,154,108,0.18)',
    borderLight: 'rgba(255,154,108,0.10)',
    borderGlow: 'rgba(255,107,53,0.38)',
    borderAccent: 'rgba(255,107,53,0.55)',
  },

  primary: '#FF6B35',
  primaryLight: '#FF9A6C',
  primaryDark: '#E0430E',
  secondary: '#FF9F1C',
  secondaryLight: '#FFCF6B',
  accent: '#00B4A6',

  aurora: {
    default: ['#FF6B35', '#FF9F1C', '#FF4D84'] as string[],
    calm: ['#00B4A6', '#1CB5E0', '#84FAB0'] as string[],
    joy: ['#FF9F1C', '#FF6B35', '#FF4D84'] as string[],
    anxiety: ['#C471ED', '#F64F59', '#FF4D84'] as string[],
    anger: ['#F64F59', '#FF6B35', '#FF4E50'] as string[],
    sadness: ['#4776E6', '#8E54E9', '#00B4A6'] as string[],
    love: ['#FF4D84', '#FF6B35', '#F64F59'] as string[],
    excitement: ['#FF6B35', '#FF9F1C', '#FF4D84'] as string[],
    loneliness: ['#7C4DFF', '#4776E6', '#00B4A6'] as string[],
    neutral: ['#78909C', '#90A4AE', '#B0BEC5'] as string[],
  } as Record<string, string[]>,

  border: '#3C2060',
  borderLight: '#4A2D72',
  borderHighlight: 'rgba(255,107,53,0.45)',

  textPrimary: '#FFF3EC',
  textSecondary: '#D4A88A',
  textMuted: '#907080',
  textDisabled: '#5A3C5E',
  textInverse: '#18082E',

  success: '#00B4A6',
  successLight: 'rgba(0,180,166,0.15)',
  warning: '#FF9F1C',
  warningLight: 'rgba(255,159,28,0.15)',
  error: '#F64F59',
  errorLight: 'rgba(246,79,89,0.15)',
  info: '#4776E6',
  infoLight: 'rgba(71,118,230,0.15)',

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
