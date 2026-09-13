import { colors, getEmotionConfig, EmotionColorConfig } from './colors';
import { typography, TypographyVariant } from './typography';
import { spacing, radius, layout } from './spacing';
import { shadows } from './shadows';
import { darkMapStyle } from './mapStyle';
import { springs, timing, easings } from './animations';
import { haptics } from './haptics';

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
  getEmotionConfig,
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
  getEmotionConfig,
  darkMapStyle,
  EmotionColorConfig,
  TypographyVariant,
};

export default theme;

