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

// ─── Named Aurora Gradient Presets — soft pastel aura washes ───
export const gradients = {
  /** Default aurora — peach blush / buttercream / rose */
  auroraDefault: {
    colors: ['#FFCDB2', '#FFE082', '#F8BBD0', '#FFCDB2'],
    locations: [0, 0.35, 0.7, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  } as GradientPreset,

  /** Calm mood — mint / seafoam / pale aqua */
  auroraCalm: {
    colors: ['#A7D7C5', '#80CBC4', '#C7EAE0', '#A7D7C5'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.2 },
    end: { x: 1, y: 0.8 },
  } as GradientPreset,

  /** Joy mood — buttercream / buttercup / peach */
  auroraJoy: {
    colors: ['#FFE082', '#FFD54F', '#FFCDB2', '#FFE082'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.2, y: 0 },
    end: { x: 0.8, y: 1 },
  } as GradientPreset,

  /** Anxiety mood — lilac / lavender / rose */
  auroraAnxiety: {
    colors: ['#E1BEE7', '#D1C4E9', '#F8BBD0', '#E1BEE7'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.1, y: 0.1 },
    end: { x: 0.9, y: 0.9 },
  } as GradientPreset,

  /** Anger mood — soft terracotta / apricot */
  auroraAnger: {
    colors: ['#FFCCBC', '#FFAB91', '#FFCDB2', '#FFCCBC'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Sadness mood — periwinkle / lavender / mint */
  auroraSadness: {
    colors: ['#C5CAE9', '#D1C4E9', '#A7D7C5', '#C5CAE9'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0, y: 0.3 },
    end: { x: 1, y: 0.7 },
  } as GradientPreset,

  /** Love mood — rose blush / peach */
  auroraLove: {
    colors: ['#F8BBD0', '#FFCDB2', '#F48FB1', '#F8BBD0'],
    locations: [0, 0.33, 0.66, 1],
    start: { x: 0.3, y: 0 },
    end: { x: 0.7, y: 1 },
  } as GradientPreset,

  // ─── UI Gradients ───

  /** Primary brand gradient for buttons/FABs — pastel coral into buttercup */
  primaryButton: {
    colors: ['#FF8A65', '#FFD54F'],
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

  /** Fade-out mask for hero sections — uses warm almond background */
  heroFade: {
    colors: ['transparent', '#FAF7F2'],
    locations: [0, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  } as GradientPreset,

  /** Frosted pastel header wash — peach → buttercream → mint */
  pastelHeader: {
    colors: ['#FFE3D3', '#FFF2DC', '#E4F3EC'],
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
