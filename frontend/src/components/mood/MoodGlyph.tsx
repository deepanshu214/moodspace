import React from 'react';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

export type MoodKey =
  | 'joy' | 'calm' | 'love' | 'sadness' | 'anxiety'
  | 'anger' | 'loneliness' | 'excitement' | 'neutral';

export type ReactionKey = 'heart' | 'hug' | 'empathy' | 'celebrate';

interface GlyphProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Stitch "Bespoke Symbology": 24×24 grid, round caps/joins, one stroke weight.
const MOOD_PATHS: Record<MoodKey, React.ReactNode> = {
  joy: (
    <>
      <Circle cx={12} cy={12} r={5} />
      <Line x1={12} y1={1} x2={12} y2={3} />
      <Line x1={12} y1={21} x2={12} y2={23} />
      <Line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
      <Line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
      <Line x1={1} y1={12} x2={3} y2={12} />
      <Line x1={21} y1={12} x2={23} y2={12} />
      <Line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
      <Line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
    </>
  ),
  calm: (
    <>
      <Path d="M2 12c4-4 8 4 12 0s8 4 8 0" />
      <Path d="M2 17c4-4 8 4 12 0s8 4 8 0" />
    </>
  ),
  love: <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  sadness: <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
  anxiety: <Path d="M12 2a10 10 0 1 0 10 10c0-4-3.5-7-7.5-7s-6 2.5-6 5.5 2 4.5 4.5 4.5 3.5-1.5 3.5-3" />,
  anger: <Path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />,
  loneliness: <Path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  excitement: <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  neutral: (
    <>
      <Path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <Line x1={6} y1={1} x2={6} y2={4} />
      <Line x1={10} y1={1} x2={10} y2={4} />
      <Line x1={14} y1={1} x2={14} y2={4} />
    </>
  ),
};

const REACTION_PATHS: Record<ReactionKey, React.ReactNode> = {
  heart: MOOD_PATHS.love,
  hug: (
    <>
      <Circle cx={8.5} cy={7} r={3} />
      <Circle cx={15.5} cy={7} r={3} />
      <Path d="M2.5 20c0-3.6 2.7-6.5 6-6.5 1.4 0 2.6.4 3.5 1.1.9-.7 2.1-1.1 3.5-1.1 3.3 0 6 2.9 6 6.5" />
    </>
  ),
  empathy: MOOD_PATHS.calm,
  celebrate: (
    <>
      <Path d="M12 2.5l2.2 5.3 5.3 2.2-5.3 2.2L12 17.5l-2.2-5.3L4.5 10l5.3-2.2z" />
      <Path d="M19 16v4M17 18h4" />
    </>
  ),
};

const Glyph: React.FC<GlyphProps & { children: React.ReactNode }> = ({
  size = 24,
  color = '#1E1E1E',
  strokeWidth = 2.2,
  children,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

/** Normalises app emotion names (incl. unknowns) onto the nine glyphs. */
export const toMoodKey = (emotion?: string): MoodKey => {
  const k = (emotion || '').toLowerCase().trim();
  return (k in MOOD_PATHS ? k : 'neutral') as MoodKey;
};

/** Custom line glyph for a mood — replaces the emoji everywhere in the UI. */
export const MoodGlyph: React.FC<GlyphProps & { mood?: string }> = ({ mood, ...rest }) => (
  <Glyph {...rest}>{MOOD_PATHS[toMoodKey(mood)]}</Glyph>
);

/** Line glyph for a reaction type (Support / Hug / With You / Celebrate). */
export const ReactionGlyph: React.FC<GlyphProps & { reaction: ReactionKey }> = ({ reaction, ...rest }) => (
  <Glyph {...rest}>{REACTION_PATHS[reaction]}</Glyph>
);
