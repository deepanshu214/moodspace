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
  /** Default aurora — vibrant coral / sunny gold / candy pink */
  auroraDefault: {
    colors: ['#FF6B35', '#F7B731', '#FF85A1', '#FF6B35'],
    locations: [0, 0.35, 0.7, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientPreset,

  /** Calm mood — fresh aqua / sky blue / mint */
  auroraCalm: {
    colors: ['#26D0CE', '#1CB5E0', '#84FAB0', '#26D0CE'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.2 },
    end: { x: 1, y: 0.8 },
  } as GradientPreset,

  /** Joy mood — golden sunshine / coral / candy pink */
  auroraJoy: {
    colors: ['#F7B731', '#FF6B35', '#FF85A1', '#F7B731'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.2, y: 0 },
    end: { x: 0.8, y: 1 },
  } as GradientPreset,

  /** Anxiety mood — vivid violet / magenta */
  auroraAnxiety: {
    colors: ['#C471ED', '#F64F59', '#FF85A1', '#C471ED'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.1, y: 0.1 },
    end: { x: 0.9, y: 0.9 },
  } as GradientPreset,

  /** Anger mood — vivid red / coral */
  auroraAnger: {
    colors: ['#F64F59', '#FF6B35', '#FF4E50', '#F64F59'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Sadness mood — royal blue / indigo / teal */
  auroraSadness: {
    colors: ['#4776E6', '#8E54E9', '#26D0CE', '#4776E6'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.3 },
    end: { x: 1, y: 0.7 },
  } as GradientPreset,

  /** Love mood — candy pink / coral */
  auroraLove: {
    colors: ['#FF85A1', '#FF6B35', '#FF4E50', '#FF85A1'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.3, y: 0 },
    end: { x: 0.7, y: 1 },
  } as GradientPreset,

  // ─── UI Gradients ───

  /** Primary brand gradient for buttons/FABs */
  primaryButton: {
    colors: ['#FF6B35', '#F7B731'],
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientPreset,

  /** Glass surface subtle gradient overlay */
  glassSurface: {
    colors: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0)'],
    locations: [0, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Fade-out mask for hero sections — uses warm peach background */
  heroFade: {
    colors: ['transparent', '#FFF8F0'],
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
