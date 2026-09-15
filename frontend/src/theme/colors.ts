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
  // ─── 60% — Deep Space Canvas ───
  background: '#0A0B14',
  backgroundSecondary: '#0F1019',
  surface: '#141622',
  surfaceElevated: '#1A1D2E',
  surfaceHighlight: '#222640',

  // ─── 30% — Glass Surfaces ───
  glass: {
    surface: 'rgba(20, 22, 35, 0.65)',
    surfaceHover: 'rgba(30, 32, 50, 0.72)',
    surfaceActive: 'rgba(40, 42, 60, 0.80)',
    surfaceSolid: 'rgba(20, 22, 35, 0.92)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.12)',
    borderGlow: 'rgba(255, 255, 255, 0.18)',
    borderAccent: 'rgba(108, 92, 231, 0.35)',
  },

  // ─── Brand ───
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4834D4',
  secondary: '#FD79A8',
  secondaryLight: '#FFB8D2',
  accent: '#00CEC9',

  // ─── Aurora Gradient Palettes (10% accent) ───
  aurora: {
    default: ['#6C5CE7', '#00CEC9', '#E84393'] as string[],
    calm: ['#00CEC9', '#0984E3', '#00B894'] as string[],
    joy: ['#FFB800', '#E84393', '#FD79A8'] as string[],
    anxiety: ['#9C27B0', '#6C5CE7', '#4834D4'] as string[],
    anger: ['#E17055', '#FF7675', '#D63031'] as string[],
    sadness: ['#4A90E2', '#5C6BC0', '#0984E3'] as string[],
    love: ['#FF6B81', '#E84393', '#FD79A8'] as string[],
    excitement: ['#E84393', '#FFB800', '#FD79A8'] as string[],
    loneliness: ['#5C6BC0', '#4834D4', '#6C5CE7'] as string[],
    neutral: ['#78909C', '#607D8B', '#546E7A'] as string[],
  } as Record<string, string[]>,

  // ─── Borders ───
  border: '#1E2136',
  borderLight: '#2A2E4A',
  borderHighlight: 'rgba(108, 92, 231, 0.35)',

  // ─── Text Hierarchy ───
  textPrimary: '#F0F1F5',
  textSecondary: '#9BA1BD',
  textMuted: '#5E6480',
  textDisabled: '#3A3F5C',
  textInverse: '#0A0B14',

  // ─── Status ───
  success: '#00B894',
  successLight: 'rgba(0, 184, 148, 0.15)',
  warning: '#FDCB6E',
  warningLight: 'rgba(253, 203, 110, 0.15)',
  error: '#FF7675',
  errorLight: 'rgba(255, 118, 117, 0.15)',
  info: '#0984E3',
  infoLight: 'rgba(9, 132, 227, 0.15)',

  // ─── Overlay ───
  overlay: 'rgba(5, 5, 12, 0.75)',
  overlayLight: 'rgba(5, 5, 12, 0.45)',

  // ─── Emotions ───
  emotions: {
    joy: {
      primary: '#FFB800',
      glow: 'rgba(255, 184, 0, 0.30)',
      background: 'rgba(255, 184, 0, 0.10)',
      border: 'rgba(255, 184, 0, 0.25)',
      emoji: '✨',
      label: 'Joy',
      gradientPair: ['#FFB800', '#FF9500'] as [string, string],
    },
    sadness: {
      primary: '#4A90E2',
      glow: 'rgba(74, 144, 226, 0.30)',
      background: 'rgba(74, 144, 226, 0.10)',
      border: 'rgba(74, 144, 226, 0.25)',
      emoji: '🌧️',
      label: 'Sadness',
      gradientPair: ['#4A90E2', '#0984E3'] as [string, string],
    },
    anxiety: {
      primary: '#9C27B0',
      glow: 'rgba(156, 39, 176, 0.30)',
      background: 'rgba(156, 39, 176, 0.10)',
      border: 'rgba(156, 39, 176, 0.25)',
      emoji: '⚡',
      label: 'Anxiety',
      gradientPair: ['#9C27B0', '#6C5CE7'] as [string, string],
    },
    calm: {
      primary: '#00CEC9',
      glow: 'rgba(0, 206, 201, 0.30)',
      background: 'rgba(0, 206, 201, 0.10)',
      border: 'rgba(0, 206, 201, 0.25)',
      emoji: '🌊',
      label: 'Calm',
      gradientPair: ['#00CEC9', '#00B894'] as [string, string],
    },
    anger: {
      primary: '#E17055',
      glow: 'rgba(225, 112, 85, 0.30)',
      background: 'rgba(225, 112, 85, 0.10)',
      border: 'rgba(225, 112, 85, 0.25)',
      emoji: '🔥',
      label: 'Anger',
      gradientPair: ['#E17055', '#D63031'] as [string, string],
    },
    loneliness: {
      primary: '#5C6BC0',
      glow: 'rgba(92, 107, 192, 0.30)',
      background: 'rgba(92, 107, 192, 0.10)',
      border: 'rgba(92, 107, 192, 0.25)',
      emoji: '🌌',
      label: 'Loneliness',
      gradientPair: ['#5C6BC0', '#4834D4'] as [string, string],
    },
    excitement: {
      primary: '#E84393',
      glow: 'rgba(232, 67, 147, 0.30)',
      background: 'rgba(232, 67, 147, 0.10)',
      border: 'rgba(232, 67, 147, 0.25)',
      emoji: '🎉',
      label: 'Excitement',
      gradientPair: ['#E84393', '#FD79A8'] as [string, string],
    },
    love: {
      primary: '#FF6B81',
      glow: 'rgba(255, 107, 129, 0.30)',
      background: 'rgba(255, 107, 129, 0.10)',
      border: 'rgba(255, 107, 129, 0.25)',
      emoji: '💖',
      label: 'Love',
      gradientPair: ['#FF6B81', '#E84393'] as [string, string],
    },
    neutral: {
      primary: '#78909C',
      glow: 'rgba(120, 144, 156, 0.30)',
      background: 'rgba(120, 144, 156, 0.10)',
      border: 'rgba(120, 144, 156, 0.25)',
      emoji: '🌿',
      label: 'Reflective',
      gradientPair: ['#78909C', '#607D8B'] as [string, string],
    },
  } as Record<string, EmotionColorConfig>,
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
