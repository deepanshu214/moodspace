import { colors, getEmotionConfig, getAuroraColors, EmotionColorConfig } from './colors';
import { typography, TypographyVariant } from './typography';
import { spacing, radius, layout } from './spacing';
import { shadows } from './shadows';
import { darkMapStyle } from './mapStyle';
import { springs, timing, easings, staggerDelay, staggerChildren, floatConfig } from './animations';
import { haptics } from './haptics';
import { gradients, getEmotionGradient, getAuroraBlobColors, GradientPreset } from './gradients';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  layout,
  shadows,
  springs,
  timing,
  easings,
  haptics,
  gradients,
  getEmotionConfig,
  getEmotionGradient,
  getAuroraColors,
  getAuroraBlobColors,
  staggerDelay,
  staggerChildren,
  floatConfig,
  darkMapStyle,
};

export type Theme = typeof theme;

export {
  colors,
  typography,
  spacing,
  radius,
  layout,
  shadows,
  springs,
  timing,
  easings,
  haptics,
  gradients,
  getEmotionConfig,
  getEmotionGradient,
  getAuroraColors,
  getAuroraBlobColors,
  staggerDelay,
  staggerChildren,
  floatConfig,
  darkMapStyle,
  EmotionColorConfig,
  TypographyVariant,
  GradientPreset,
};

export default theme;
