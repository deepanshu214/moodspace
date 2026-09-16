/**
 * MoodSpace Gradient System
 * Haikei-inspired gradient presets + Reanimated color interpolation helpers
 */

export interface GradientPreset {
  colors: readonly [string, string, ...string[]];
  locations?: readonly [number, number, ...number[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

// ─── Named Aurora Gradient Presets ───
export const gradients = {
  /** Default idle aurora — warm sunset peach / honey / lavender */
  auroraDefault: {
    colors: ['#FF7E67', '#FFB443', '#A78BFA', '#FF6584'],
    locations: [0, 0.35, 0.7, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientPreset,

  /** Calm mood — warm sage / soft sky */
  auroraCalm: {
    colors: ['#56C596', '#4FA8D1', '#85E3B3', '#56C596'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.2 },
    end: { x: 1, y: 0.8 },
  } as GradientPreset,

  /** Joy mood — golden honey / warm peach / blush */
  auroraJoy: {
    colors: ['#FFB443', '#FF7E67', '#FF6584', '#FFB443'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.2, y: 0 },
    end: { x: 0.8, y: 1 },
  } as GradientPreset,

  /** Anxiety mood — soft lavender & violet */
  auroraAnxiety: {
    colors: ['#A78BFA', '#8B5CF6', '#6366F1', '#A78BFA'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.1, y: 0.1 },
    end: { x: 0.9, y: 0.9 },
  } as GradientPreset,

  /** Anger mood — warm ember glow */
  auroraAnger: {
    colors: ['#FF6B6B', '#FF8E72', '#E05A47', '#FF6B6B'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Sadness mood — ocean twilight */
  auroraSadness: {
    colors: ['#5B86E5', '#6C72CB', '#36D1DC', '#5B86E5'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.3 },
    end: { x: 1, y: 0.7 },
  } as GradientPreset,

  /** Love mood — warm rose & coral */
  auroraLove: {
    colors: ['#FF6584', '#FF7E67', '#FF9A9E', '#FF6584'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.3, y: 0 },
    end: { x: 0.7, y: 1 },
  } as GradientPreset,

  // ─── UI Gradients ───

  /** Primary brand gradient for buttons/FABs */
  primaryButton: {
    colors: ['#FF7E67', '#FFB443'],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientPreset,

  /** Glass surface subtle gradient overlay */
  glassSurface: {
    colors: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)'],
    locations: [0, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Fade-out mask for hero sections */
  heroFade: {
    colors: ['transparent', '#121018'],
    locations: [0, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,
};

/**
 * Returns the aurora gradient preset for a given emotion name
 */
export const getEmotionGradient = (emotionName?: string): GradientPreset => {
  if (!emotionName) return gradients.auroraDefault;

  const key = emotionName.toLowerCase().trim();
  const map: Record<string, GradientPreset> = {
    calm: gradients.auroraCalm,
    joy: gradients.auroraJoy,
    anxiety: gradients.auroraAnxiety,
    anger: gradients.auroraAnger,
    sadness: gradients.auroraSadness,
    love: gradients.auroraLove,
    excitement: gradients.auroraJoy,
    loneliness: gradients.auroraSadness,
    neutral: gradients.auroraDefault,
  };

  return map[key] || gradients.auroraDefault;
};

/**
 * Returns flat array of aurora blob colors for a given emotion
 * Used by AuroraBackground to color the 3 gradient blobs
 */
export const getAuroraBlobColors = (emotionName?: string): [string, string, string] => {
  const preset = getEmotionGradient(emotionName);
  return [preset.colors[0], preset.colors[1], preset.colors[2] || preset.colors[0]];
};
