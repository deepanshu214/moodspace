export interface EmotionColorConfig {
  primary: string;
  glow: string;
  background: string;
  border: string;
  emoji: string;
  label: string;
  gradientPair: [string, string];
}

export const colors = {
  // ─── 60% — Warm Espresso Twilight Canvas (Scrolltide / Realtime Colors) ───
  background: '#121018',
  backgroundSecondary: '#181522',
  surface: '#1E1A29',
  surfaceElevated: '#252033',
  surfaceHighlight: '#2D273D',

  // ─── 30% — Frosted Velvet Glass Surfaces with Warm Champagne Rim ───
  glass: {
    surface: 'rgba(30, 26, 41, 0.70)',
    surfaceHover: 'rgba(40, 35, 54, 0.78)',
    surfaceActive: 'rgba(48, 42, 65, 0.85)',
    surfaceSolid: 'rgba(30, 26, 41, 0.94)',
    border: 'rgba(255, 235, 220, 0.10)',
    borderLight: 'rgba(255, 235, 220, 0.16)',
    borderGlow: 'rgba(255, 220, 180, 0.24)',
    borderAccent: 'rgba(255, 126, 103, 0.35)',
  },

  // ─── 10% — Brand & Warm Sunset Accents ───
  primary: '#FF7E67', // Sunset Peach / Coral Glow
  primaryLight: '#FFAA9B',
  primaryDark: '#E05A47',
  secondary: '#FFB443', // Honey Joy
  secondaryLight: '#FFD188',
  accent: '#56C596', // Sage Calm

  // ─── Aurora Gradient Palettes (10% accent) ───
  aurora: {
    default: ['#FF7E67', '#FFB443', '#A78BFA'] as string[],
    calm: ['#56C596', '#4FA8D1', '#85E3B3'] as string[],
    joy: ['#FFB443', '#FF7E67', '#FF6584'] as string[],
    anxiety: ['#A78BFA', '#8B5CF6', '#6366F1'] as string[],
    anger: ['#FF6B6B', '#FF8E72', '#E05A47'] as string[],
    sadness: ['#5B86E5', '#6C72CB', '#36D1DC'] as string[],
    love: ['#FF6584', '#FF7E67', '#FF9A9E'] as string[],
    excitement: ['#FF7E67', '#FFB443', '#FF4E50'] as string[],
    loneliness: ['#7986CB', '#5C6BC0', '#9575CD'] as string[],
    neutral: ['#8E8D9A', '#727080', '#5E5C6C'] as string[],
  } as Record<string, string[]>,

  // ─── Borders ───
  border: '#282337',
  borderLight: '#342E47',
  borderHighlight: 'rgba(255, 126, 103, 0.35)',

  // ─── Text Hierarchy ───
  textPrimary: '#FAF7F5',
  textSecondary: '#BDB6CA',
  textMuted: '#7D758D',
  textDisabled: '#4E485C',
  textInverse: '#121018',

  // ─── Status ───
  success: '#56C596',
  successLight: 'rgba(86, 197, 150, 0.15)',
  warning: '#FFB443',
  warningLight: 'rgba(255, 180, 67, 0.15)',
  error: '#FF6B6B',
  errorLight: 'rgba(255, 107, 107, 0.15)',
  info: '#5B86E5',
  infoLight: 'rgba(91, 134, 229, 0.15)',

  // ─── Overlay ───
  overlay: 'rgba(10, 8, 14, 0.75)',
  overlayLight: 'rgba(10, 8, 14, 0.45)',

  // ─── Emotions ───
  emotions: {
    joy: {
      primary: '#FFB443',
      glow: 'rgba(255, 180, 67, 0.32)',
      background: 'rgba(255, 180, 67, 0.12)',
      border: 'rgba(255, 180, 67, 0.28)',
      emoji: '☀️',
      label: 'Joy',
      gradientPair: ['#FFB443', '#FF7E67'] as [string, string],
    },
    sadness: {
      primary: '#5B86E5',
      glow: 'rgba(91, 134, 229, 0.30)',
      background: 'rgba(91, 134, 229, 0.10)',
      border: 'rgba(91, 134, 229, 0.25)',
      emoji: '🌧️',
      label: 'Sadness',
      gradientPair: ['#5B86E5', '#6C72CB'] as [string, string],
    },
    anxiety: {
      primary: '#A78BFA',
      glow: 'rgba(167, 139, 250, 0.30)',
      background: 'rgba(167, 139, 250, 0.10)',
      border: 'rgba(167, 139, 250, 0.25)',
      emoji: '⚡',
      label: 'Heavy',
      gradientPair: ['#A78BFA', '#8B5CF6'] as [string, string],
    },
    calm: {
      primary: '#56C596',
      glow: 'rgba(86, 197, 150, 0.30)',
      background: 'rgba(86, 197, 150, 0.10)',
      border: 'rgba(86, 197, 150, 0.25)',
      emoji: '🌿',
      label: 'Calm',
      gradientPair: ['#56C596', '#3D9970'] as [string, string],
    },
    anger: {
      primary: '#FF6B6B',
      glow: 'rgba(255, 107, 107, 0.30)',
      background: 'rgba(255, 107, 107, 0.10)',
      border: 'rgba(255, 107, 107, 0.25)',
      emoji: '🔥',
      label: 'Fiery',
      gradientPair: ['#FF6B6B', '#E05A47'] as [string, string],
    },
    loneliness: {
      primary: '#7986CB',
      glow: 'rgba(121, 134, 203, 0.30)',
      background: 'rgba(121, 134, 203, 0.10)',
      border: 'rgba(121, 134, 203, 0.25)',
      emoji: '🕊️',
      label: 'Quiet',
      gradientPair: ['#7986CB', '#5C6BC0'] as [string, string],
    },
    excitement: {
      primary: '#FF7E67',
      glow: 'rgba(255, 126, 103, 0.32)',
      background: 'rgba(255, 126, 103, 0.12)',
      border: 'rgba(255, 126, 103, 0.28)',
      emoji: '🎉',
      label: 'Excitement',
      gradientPair: ['#FF7E67', '#FFB443'] as [string, string],
    },
    love: {
      primary: '#FF6584',
      glow: 'rgba(255, 101, 132, 0.32)',
      background: 'rgba(255, 101, 132, 0.12)',
      border: 'rgba(255, 101, 132, 0.28)',
      emoji: '💖',
      label: 'Love',
      gradientPair: ['#FF6584', '#FF7E67'] as [string, string],
    },
    neutral: {
      primary: '#8E8D9A',
      glow: 'rgba(142, 141, 154, 0.30)',
      background: 'rgba(142, 141, 154, 0.10)',
      border: 'rgba(142, 141, 154, 0.25)',
      emoji: '☕',
      label: 'Cozy',
      gradientPair: ['#8E8D9A', '#727080'] as [string, string],
    },
  } as Record<string, EmotionColorConfig>,
};

export const darkColors = colors;

export const lightColors = {
  // ─── 60% — Warm Organic Linen Oat & Morning Latte Canvas ───
  background: '#FAF7F2',
  backgroundSecondary: '#F4EFEB',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHighlight: '#EFE8DE',

  // ─── 30% — Frosted Ceramic Glass Surfaces with Warm Drop Shadows ───
  glass: {
    surface: 'rgba(255, 255, 255, 0.88)',
    surfaceHover: 'rgba(255, 255, 255, 0.96)',
    surfaceActive: 'rgba(248, 244, 238, 0.98)',
    surfaceSolid: '#FFFFFF',
    border: 'rgba(60, 40, 20, 0.08)',
    borderLight: 'rgba(60, 40, 20, 0.05)',
    borderGlow: 'rgba(224, 90, 71, 0.25)',
    borderAccent: 'rgba(224, 90, 71, 0.40)',
  },

  // ─── 10% — Warm Terracotta Brand & Accents ───
  primary: '#E05A47',
  primaryLight: '#FF7E67',
  primaryDark: '#B83F2E',
  secondary: '#D97706',
  secondaryLight: '#F59E0B',
  accent: '#3D9970',

  // ─── Aurora Gradient Palettes ───
  aurora: {
    default: ['#FF7E67', '#FFB443', '#A78BFA'],
    calm: ['#3D9970', '#3B82F6', '#10B981'],
    joy: ['#F59E0B', '#FF7E67', '#EC4899'],
    anxiety: ['#8B5CF6', '#6366F1', '#4F46E5'],
    anger: ['#EF4444', '#F97316', '#DC2626'],
    sadness: ['#3B82F6', '#6366F1', '#2563EB'],
    love: ['#F43F5E', '#FB7185', '#E11D48'],
    excitement: ['#EC4899', '#F59E0B', '#FB7185'],
    loneliness: ['#6366F1', '#4F46E5', '#4338CA'],
    neutral: ['#64748B', '#94A3B8', '#475569'],
  } as Record<string, string[]>,

  // ─── Borders ───
  border: '#E8E1D7',
  borderLight: '#F0EAE1',
  borderHighlight: 'rgba(224, 90, 71, 0.35)',

  // ─── Text Hierarchy ───
  textPrimary: '#231B15',
  textSecondary: '#63564D',
  textMuted: '#94857A',
  textDisabled: '#C2B7AE',
  textInverse: '#FFFFFF',

  // ─── Status ───
  success: '#3D9970',
  successLight: 'rgba(61, 153, 112, 0.12)',
  warning: '#D97706',
  warningLight: 'rgba(217, 119, 6, 0.12)',
  error: '#DC2626',
  errorLight: 'rgba(220, 38, 38, 0.12)',
  info: '#2563EB',
  infoLight: 'rgba(37, 99, 235, 0.12)',

  // ─── Overlay ───
  overlay: 'rgba(35, 27, 21, 0.55)',
  overlayLight: 'rgba(35, 27, 21, 0.25)',

  emotions: colors.emotions,
};

/**
 * Returns color configuration for a given emotion safely, defaulting to neutral
 */
export const getEmotionConfig = (emotionName?: string): EmotionColorConfig => {
  if (!emotionName) return colors.emotions.neutral;
  const key = emotionName.toLowerCase().trim();
  return colors.emotions[key] || colors.emotions.neutral;
};

/**
 * Returns aurora gradient palette for a given emotion
 */
export const getAuroraColors = (emotionName?: string): string[] => {
  if (!emotionName) return colors.aurora.default;
  const key = emotionName.toLowerCase().trim();
  return colors.aurora[key] || colors.aurora.default;
};
