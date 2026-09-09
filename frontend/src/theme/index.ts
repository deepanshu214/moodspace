import { colors, getEmotionConfig, EmotionColorConfig } from './colors';
import { typography, TypographyVariant } from './typography';
import { spacing, radius, layout } from './spacing';
import { shadows } from './shadows';
import { darkMapStyle } from './mapStyle';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  layout,
  shadows,
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
  getEmotionConfig,
  darkMapStyle,
  EmotionColorConfig,
  TypographyVariant,
};

export default theme;
