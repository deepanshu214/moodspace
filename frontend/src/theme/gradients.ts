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

// ─── Named Aurora Gradient Presets — Neo-Editorial pigment washes ───
export const gradients = {
  /** Default aurora — tangerine / buttercup / petal */
  auroraDefault: {
    colors: ['#FF5C38', '#FFD15C', '#FF80B0', '#FF5C38'],
    locations: [0, 0.35, 0.7, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientPreset,

  /** Calm — mint / drop sky / buttercup */
  auroraCalm: {
    colors: ['#5CD694', '#60A5FA', '#FFD15C', '#5CD694'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.2 },
    end: { x: 1, y: 0.8 },
  } as GradientPreset,

  /** Joy — buttercup / spark / tangerine */
  auroraJoy: {
    colors: ['#FFD15C', '#FB923C', '#FF5C38', '#FFD15C'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.2, y: 0 },
    end: { x: 0.8, y: 1 },
  } as GradientPreset,

  /** Heavy — violet / drop sky / petal */
  auroraAnxiety: {
    colors: ['#C084FC', '#60A5FA', '#FF80B0', '#C084FC'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.1, y: 0.1 },
    end: { x: 0.9, y: 0.9 },
  } as GradientPreset,

  /** Fiery — flare / tangerine / spark */
  auroraAnger: {
    colors: ['#F87171', '#FF5C38', '#FB923C', '#F87171'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Sadness — drop sky / violet / mint */
  auroraSadness: {
    colors: ['#60A5FA', '#C084FC', '#5CD694', '#60A5FA'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.3 },
    end: { x: 1, y: 0.7 },
  } as GradientPreset,

  /** Love — petal / tangerine / buttercup */
  auroraLove: {
    colors: ['#FF80B0', '#FF5C38', '#FFD15C', '#FF80B0'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.3, y: 0 },
    end: { x: 0.7, y: 1 },
  } as GradientPreset,

  // ─── UI Gradients ───

  /** Primary brand gradient for buttons/FABs — tangerine into spark (ink text on top) */
  primaryButton: {
    colors: ['#FF5C38', '#FB923C'],
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

  /** Fade-out mask for hero sections — newsprint canvas */
  heroFade: {
    colors: ['transparent', '#FFFDF9'],
    locations: [0, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Header band — Neo-Editorial headers sit on the page canvas */
  headerBand: {
    colors: ['#FFFDF9', '#FFFDF9', '#FFFDF9'],
    locations: [0, 0.55, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
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
