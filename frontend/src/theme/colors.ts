export interface EmotionColorConfig {
  primary: string;
  glow: string;
  background: string;
  border: string;
  emoji: string;
  label: string;
}

export const colors = {
  // Brand Palette
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#4834D4',
  secondary: '#FD79A8',
  secondaryLight: '#FFB8D2',
  accent: '#00CEC9',

  // Dark Canvas & Surfaces (Modern dark theme default)
  background: '#0D0E15',
  backgroundSecondary: '#12141E',
  surface: '#171822',
  surfaceElevated: '#202230',
  surfaceHighlight: '#2A2C3E',
  surfaceGlass: 'rgba(23, 24, 34, 0.85)',

  // Borders & Dividers
  border: '#252839',
  borderLight: '#32364D',
  borderHighlight: 'rgba(108, 92, 231, 0.35)',

  // Text Hierarchy
  textPrimary: '#F8F9FA',
  textSecondary: '#A0A5BD',
  textMuted: '#6C728E',
  textDisabled: '#464A62',
  textInverse: '#0D0E15',

  // Status & Feedback
  success: '#00B894',
  successLight: 'rgba(0, 184, 148, 0.15)',
  warning: '#FDCB6E',
  warningLight: 'rgba(253, 203, 110, 0.15)',
  error: '#FF7675',
  errorLight: 'rgba(255, 118, 117, 0.15)',
  info: '#0984E3',
  infoLight: 'rgba(9, 132, 227, 0.15)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // Mood & Emotion Palette (Emotion-First Design)
  emotions: {
    joy: {
      primary: '#FFB800',
      glow: 'rgba(255, 184, 0, 0.35)',
      background: 'rgba(255, 184, 0, 0.12)',
      border: 'rgba(255, 184, 0, 0.3)',
      emoji: '✨',
      label: 'Joy',
    },
    sadness: {
      primary: '#4A90E2',
      glow: 'rgba(74, 144, 226, 0.35)',
      background: 'rgba(74, 144, 226, 0.12)',
      border: 'rgba(74, 144, 226, 0.3)',
      emoji: '🌧️',
      label: 'Sadness',
    },
    anxiety: {
      primary: '#9C27B0',
      glow: 'rgba(156, 39, 176, 0.35)',
      background: 'rgba(156, 39, 176, 0.12)',
      border: 'rgba(156, 39, 176, 0.3)',
      emoji: '⚡',
      label: 'Anxiety',
    },
    calm: {
      primary: '#00CEC9',
      glow: 'rgba(0, 206, 201, 0.35)',
      background: 'rgba(0, 206, 201, 0.12)',
      border: 'rgba(0, 206, 201, 0.3)',
      emoji: '🌊',
      label: 'Calm',
    },
    anger: {
      primary: '#E17055',
      glow: 'rgba(225, 112, 85, 0.35)',
      background: 'rgba(225, 112, 85, 0.12)',
      border: 'rgba(225, 112, 85, 0.3)',
      emoji: '🔥',
      label: 'Anger',
    },
    loneliness: {
      primary: '#5C6BC0',
      glow: 'rgba(92, 107, 192, 0.35)',
      background: 'rgba(92, 107, 192, 0.12)',
      border: 'rgba(92, 107, 192, 0.3)',
      emoji: '🌌',
      label: 'Loneliness',
    },
    excitement: {
      primary: '#E84393',
      glow: 'rgba(232, 67, 147, 0.35)',
      background: 'rgba(232, 67, 147, 0.12)',
      border: 'rgba(232, 67, 147, 0.3)',
      emoji: '🎉',
      label: 'Excitement',
    },
    love: {
      primary: '#FF6B81',
      glow: 'rgba(255, 107, 129, 0.35)',
      background: 'rgba(255, 107, 129, 0.12)',
      border: 'rgba(255, 107, 129, 0.3)',
      emoji: '💖',
      label: 'Love',
    },
    neutral: {
      primary: '#78909C',
      glow: 'rgba(120, 144, 156, 0.35)',
      background: 'rgba(120, 144, 156, 0.12)',
      border: 'rgba(120, 144, 156, 0.3)',
      emoji: '🌿',
      label: 'Reflective',
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
