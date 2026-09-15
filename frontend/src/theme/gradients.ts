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
  /** Default idle aurora — purple/teal/pink */
  auroraDefault: {
    colors: ['#6C5CE7', '#00CEC9', '#E84393', '#4834D4'],
    locations: [0, 0.35, 0.7, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientPreset,

  /** Calm mood — teal/blue/green */
  auroraCalm: {
    colors: ['#00CEC9', '#0984E3', '#00B894', '#00CEC9'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.2 },
    end: { x: 1, y: 0.8 },
  } as GradientPreset,

  /** Joy mood — warm golden/pink */
  auroraJoy: {
    colors: ['#FFB800', '#E84393', '#FD79A8', '#FFB800'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.2, y: 0 },
    end: { x: 0.8, y: 1 },
  } as GradientPreset,

  /** Anxiety mood — deep violet churn */
  auroraAnxiety: {
    colors: ['#9C27B0', '#6C5CE7', '#4834D4', '#9C27B0'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.1, y: 0.1 },
    end: { x: 0.9, y: 0.9 },
  } as GradientPreset,

  /** Anger mood — ember glow */
  auroraAnger: {
    colors: ['#E17055', '#FF7675', '#D63031', '#E17055'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Sadness mood — ocean blue */
  auroraSadness: {
    colors: ['#4A90E2', '#5C6BC0', '#0984E3', '#4A90E2'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.3 },
    end: { x: 1, y: 0.7 },
  } as GradientPreset,

  /** Love mood — rose/magenta */
  auroraLove: {
    colors: ['#FF6B81', '#E84393', '#FD79A8', '#FF6B81'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.3, y: 0 },
    end: { x: 0.7, y: 1 },
  } as GradientPreset,

  // ─── UI Gradients ───

  /** Primary brand gradient for buttons/FABs */
  primaryButton: {
    colors: ['#6C5CE7', '#A29BFE'],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientPreset,

  /** Glass surface subtle gradient overlay */
  glassSurface: {
    colors: ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0)'],
    locations: [0, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Fade-out mask for hero sections */
  heroFade: {
    colors: ['transparent', '#0A0B14'],
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
