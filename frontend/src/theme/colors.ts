export interface EmotionColorConfig {
  primary: string;
  glow: string;
  background: string;
  border: string;
  emoji: string;
  label: string;
  gradientPair: [string, string];
}

// ─── LIGHT MODE (Default) — Warm Joyful Social Vibe ──────────────────────────
// Inspired by golden hour warmth, peach skies, happy social apps
export const lightColors = {
  background: '#FFF8F0',
  backgroundSecondary: '#FFF2E6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFAF5',
  surfaceHighlight: '#FFE8D6',

  glass: {
    surface: 'rgba(255, 255, 255, 0.90)',
    surfaceHover: 'rgba(255, 255, 255, 0.97)',
    surfaceActive: 'rgba(255, 248, 240, 0.98)',
    surfaceSolid: '#FFFFFF',
    border: 'rgba(255, 126, 95, 0.12)',
    borderLight: 'rgba(255, 126, 95, 0.07)',
    borderGlow: 'rgba(255, 100, 60, 0.28)',
    borderAccent: 'rgba(255, 100, 60, 0.45)',
  },

  primary: '#FF6B35',
  primaryLight: '#FF9A6C',
  primaryDark: '#E0430E',
  secondary: '#F7B731',
  secondaryLight: '#FFDA79',
  accent: '#26D0CE',

  aurora: {
    default: ['#FF6B35', '#F7B731', '#FF85A1'] as string[],
    calm: ['#26D0CE', '#1CB5E0', '#84FAB0'] as string[],
    joy: ['#F7B731', '#FF6B35', '#FF85A1'] as string[],
    anxiety: ['#C471ED', '#F64F59', '#FF85A1'] as string[],
    anger: ['#F64F59', '#FF6B35', '#FF4E50'] as string[],
    sadness: ['#4776E6', '#8E54E9', '#26D0CE'] as string[],
    love: ['#FF85A1', '#FF6B35', '#FF4E50'] as string[],
    excitement: ['#FF6B35', '#F7B731', '#FF85A1'] as string[],
    loneliness: ['#8E54E9', '#4776E6', '#26D0CE'] as string[],
    neutral: ['#B0BEC5', '#90A4AE', '#78909C'] as string[],
  } as Record<string, string[]>,

  border: '#FFD9C5',
  borderLight: '#FFE8D6',
  borderHighlight: 'rgba(255, 107, 53, 0.40)',

  textPrimary: '#1A0D00',
  textSecondary: '#6B3A1F',
  textMuted: '#A0664A',
  textDisabled: '#D4A897',
  textInverse: '#FFFFFF',

  success: '#00C07F',
  successLight: 'rgba(0, 192, 127, 0.12)',
  warning: '#F7B731',
  warningLight: 'rgba(247, 183, 49, 0.15)',
  error: '#F64F59',
  errorLight: 'rgba(246, 79, 89, 0.12)',
  info: '#4776E6',
  infoLight: 'rgba(71, 118, 230, 0.12)',

  overlay: 'rgba(26, 13, 0, 0.50)',
  overlayLight: 'rgba(26, 13, 0, 0.22)',

  emotions: {
    joy: {
      primary: '#F7B731',
      glow: 'rgba(247, 183, 49, 0.35)',
      background: 'rgba(247, 183, 49, 0.12)',
      border: 'rgba(247, 183, 49, 0.30)',
      emoji: '☀️',
      label: 'Joy',
      gradientPair: ['#F7B731', '#FF6B35'] as [string, string],
    },
    sadness: {
      primary: '#4776E6',
      glow: 'rgba(71, 118, 230, 0.30)',
      background: 'rgba(71, 118, 230, 0.10)',
      border: 'rgba(71, 118, 230, 0.25)',
      emoji: '🌧️',
      label: 'Sadness',
      gradientPair: ['#4776E6', '#8E54E9'] as [string, string],
    },
    anxiety: {
      primary: '#C471ED',
      glow: 'rgba(196, 113, 237, 0.30)',
      background: 'rgba(196, 113, 237, 0.10)',
      border: 'rgba(196, 113, 237, 0.25)',
      emoji: '⚡',
      label: 'Heavy',
      gradientPair: ['#C471ED', '#F64F59'] as [string, string],
    },
    calm: {
      primary: '#26D0CE',
      glow: 'rgba(38, 208, 206, 0.30)',
      background: 'rgba(38, 208, 206, 0.10)',
      border: 'rgba(38, 208, 206, 0.25)',
      emoji: '🌿',
      label: 'Calm',
      gradientPair: ['#26D0CE', '#1CB5E0'] as [string, string],
    },
    anger: {
      primary: '#F64F59',
      glow: 'rgba(246, 79, 89, 0.30)',
      background: 'rgba(246, 79, 89, 0.10)',
      border: 'rgba(246, 79, 89, 0.25)',
      emoji: '🔥',
      label: 'Fiery',
      gradientPair: ['#F64F59', '#FF6B35'] as [string, string],
    },
    loneliness: {
      primary: '#8E54E9',
      glow: 'rgba(142, 84, 233, 0.30)',
      background: 'rgba(142, 84, 233, 0.10)',
      border: 'rgba(142, 84, 233, 0.25)',
      emoji: '🕊️',
      label: 'Quiet',
      gradientPair: ['#8E54E9', '#4776E6'] as [string, string],
    },
    excitement: {
      primary: '#FF6B35',
      glow: 'rgba(255, 107, 53, 0.32)',
      background: 'rgba(255, 107, 53, 0.12)',
      border: 'rgba(255, 107, 53, 0.28)',
      emoji: '🎉',
      label: 'Excitement',
      gradientPair: ['#FF6B35', '#F7B731'] as [string, string],
    },
    love: {
      primary: '#FF85A1',
      glow: 'rgba(255, 133, 161, 0.32)',
      background: 'rgba(255, 133, 161, 0.12)',
      border: 'rgba(255, 133, 161, 0.28)',
      emoji: '💖',
      label: 'Love',
      gradientPair: ['#FF85A1', '#FF6B35'] as [string, string],
    },
    neutral: {
      primary: '#90A4AE',
      glow: 'rgba(144, 164, 174, 0.30)',
      background: 'rgba(144, 164, 174, 0.10)',
      border: 'rgba(144, 164, 174, 0.25)',
      emoji: '☕',
      label: 'Cozy',
      gradientPair: ['#90A4AE', '#B0BEC5'] as [string, string],
    },
  } as Record<string, EmotionColorConfig>,
};

// ─── DARK MODE — Rich Jewel Violet, NOT near-black ────────────────────────────
export const darkColors = {
  background: '#1A0A2E',
  backgroundSecondary: '#221140',
  surface: '#2D1B4E',
  surfaceElevated: '#3A2260',
  surfaceHighlight: '#4A2D72',

  glass: {
    surface: 'rgba(45, 27, 78, 0.72)',
    surfaceHover: 'rgba(58, 34, 96, 0.80)',
    surfaceActive: 'rgba(74, 45, 114, 0.88)',
    surfaceSolid: 'rgba(45, 27, 78, 0.96)',
    border: 'rgba(255, 154, 108, 0.14)',
    borderLight: 'rgba(255, 154, 108, 0.08)',
    borderGlow: 'rgba(255, 107, 53, 0.30)',
    borderAccent: 'rgba(255, 107, 53, 0.45)',
  },

  primary: '#FF6B35',
  primaryLight: '#FF9A6C',
  primaryDark: '#E0430E',
  secondary: '#F7B731',
  secondaryLight: '#FFDA79',
  accent: '#26D0CE',

  aurora: {
    default: ['#FF6B35', '#F7B731', '#FF85A1'] as string[],
    calm: ['#26D0CE', '#1CB5E0', '#84FAB0'] as string[],
    joy: ['#F7B731', '#FF6B35', '#FF85A1'] as string[],
    anxiety: ['#C471ED', '#F64F59', '#FF85A1'] as string[],
    anger: ['#F64F59', '#FF6B35', '#FF4E50'] as string[],
    sadness: ['#4776E6', '#8E54E9', '#26D0CE'] as string[],
    love: ['#FF85A1', '#FF6B35', '#FF4E50'] as string[],
    excitement: ['#FF6B35', '#F7B731', '#FF85A1'] as string[],
    loneliness: ['#8E54E9', '#4776E6', '#26D0CE'] as string[],
    neutral: ['#78909C', '#90A4AE', '#B0BEC5'] as string[],
  } as Record<string, string[]>,

  border: '#3D2060',
  borderLight: '#4A2D72',
  borderHighlight: 'rgba(255, 107, 53, 0.40)',

  textPrimary: '#FFF0E6',
  textSecondary: '#D4A897',
  textMuted: '#9070A0',
  textDisabled: '#5A3C70',
  textInverse: '#1A0A2E',

  success: '#00C07F',
  successLight: 'rgba(0, 192, 127, 0.15)',
  warning: '#F7B731',
  warningLight: 'rgba(247, 183, 49, 0.15)',
  error: '#F64F59',
  errorLight: 'rgba(246, 79, 89, 0.15)',
  info: '#4776E6',
  infoLight: 'rgba(71, 118, 230, 0.15)',

  overlay: 'rgba(15, 5, 25, 0.78)',
  overlayLight: 'rgba(15, 5, 25, 0.45)',

  emotions: lightColors.emotions,
};

// Default export = light (joyful default for MoodSpace)
export const colors = lightColors;

export const getEmotionConfig = (emotionName?: string): EmotionColorConfig => {
  if (!emotionName) return lightColors.emotions.neutral;
  const key = emotionName.toLowerCase().trim();
  return lightColors.emotions[key] || lightColors.emotions.neutral;
};

export const getAuroraColors = (emotionName?: string): string[] => {
  if (!emotionName) return lightColors.aurora.default;
  const key = emotionName.toLowerCase().trim();
  return lightColors.aurora[key] || lightColors.aurora.default;
};
