import { colors, getEmotionConfig, EmotionColorConfig } from './colors';
import { typography, TypographyVariant } from './typography';
import { spacing, radius, layout } from './spacing';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  layout,
  shadows,
  getEmotionConfig,
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
  EmotionColorConfig,
  TypographyVariant,
};

export default theme;
