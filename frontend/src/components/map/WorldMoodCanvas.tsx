import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Typography } from '@/components/common/Typography';
import { MoodPinTag } from '@/components/mood/MoodPinTag';
import { DisplayBubble } from '@/utils/bubbles';

/**
 * World mood canvas for web — the Stitch dot-grid atlas: city tag pins at real
 * world coordinates over a paper grid, joined by dashed resonance arcs.
 */
export const WorldMoodCanvas: React.FC<{
  bubbles: DisplayBubble[];
  colors: any;
  isDark: boolean;
  onBubblePress: (bubble: DisplayBubble) => void;
  /** 1 = whole world; higher zooms about the canvas centre. */
  zoom?: number;
}> = ({ bubbles, colors, isDark, onBubblePress, zoom = 1 }) => {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const dotColor = isDark ? 'rgba(158,163,174,0.30)' : 'rgba(143,112,105,0.45)';
  const DOT_STEP = 16;

  // Equirectangular projection, zoomed about the centre and inset so tags
  // stay clear of the card edges and the floating map controls.
  const toXY = (lat: number, lon: number) => {
    const x0 = ((lon + 180) / 360) * size.w;
    const y0 = ((90 - lat) / 180) * size.h;
    const x = size.w / 2 + (x0 - size.w / 2) * zoom;
    const y = size.h / 2 + (y0 - size.h / 2) * zoom;
    return {
      // Zoomed-out-of-frame pins drop away rather than piling up on the edge.
      onScreen: x > 4 && x < size.w - 4 && y > 4 && y < size.h - 4,
      x: Math.min(Math.max(x, 40), Math.max(size.w - 64, 40)),
      y: Math.min(Math.max(y, 46), Math.max(size.h - 80, 46)),
    };
  };

  // Several bubbles can share one spot (same city, same block). Merge those
  // into a single tag with a count rather than stacking identical labels, then
  // step any still-overlapping neighbours down a row.
  const TAG_W = 84;
  const ROW_H = 44; // tag height (38) plus a small gap
  const SAME_SPOT = 14;

  type Pin = { bubble: DisplayBubble; x: number; y: number; count: number };

  const pins: Pin[] = [];
  if (size.w > 0) {
    const placed = bubbles
      .map((b) => ({ bubble: b, ...toXY(b.latitude, b.longitude) }))
      .filter((p) => p.onScreen)
      .sort((a, b) => a.x - b.x);

    placed.forEach((p) => {
      const sameSpot = pins.find(
        (existing) => Math.abs(existing.x - p.x) < SAME_SPOT && Math.abs(existing.y - p.y) < SAME_SPOT
      );
      if (sameSpot) {
        sameSpot.count += 1;
        return;
      }
      pins.push({ bubble: p.bubble, x: p.x, y: p.y, count: 1 });
    });

    // Nudge labels that still collide, staying inside the canvas.
    pins.forEach((pin, i) => {
      let guard = 0;
      while (
        guard++ < 4 &&
        pins.some(
          (other, j) =>
            j < i && Math.abs(other.x - pin.x) < TAG_W && Math.abs(other.y - pin.y) < ROW_H
        )
      ) {
        const next = pin.y + ROW_H;
        if (next > size.h - 46) break;
        pin.y = next;
      }
    });
  }

  const dots: React.ReactNode[] = [];
  if (size.w > 0) {
    for (let x = DOT_STEP; x < size.w; x += DOT_STEP) {
      for (let y = DOT_STEP; y < size.h; y += DOT_STEP) {
        dots.push(<Circle key={`d-${x}-${y}`} cx={x} cy={y} r={1.2} fill={dotColor} />);
      }
    }
  }

  return (
    <View
      style={{ flex: 1, overflow: 'hidden', backgroundColor: isDark ? colors.surface : colors.surfaceWarm }}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {size.w > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={size.w} height={size.h}>
          {dots}
          {/* dashed resonance arcs between consecutive pins */}
          {pins.slice(1).map((pin, i) => {
            const prev = pins[i];
            const midX = (prev.x + pin.x) / 2;
            const midY = Math.min(prev.y, pin.y) - 28;
            return (
              <Path
                key={`arc-${pin.bubble.id}`}
                d={`M ${prev.x} ${prev.y} Q ${midX} ${midY} ${pin.x} ${pin.y}`}
                stroke={colors.ink}
                strokeOpacity={0.35}
                strokeWidth={1.5}
                strokeDasharray="4 5"
                fill="none"
              />
            );
          })}
        </Svg>
      )}

      {/* frequency read-out */}
      <View style={[styles.freqChip, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
        <Typography variant="overline" style={{ color: colors.textPrimary }}>
          FREQ: 432 Hz
        </Typography>
      </View>

      {pins.map(({ bubble, x, y, count }) => (
        <View key={bubble.id} style={[styles.canvasMarkerWrapper, { left: x - 40, top: y - 34 }]}>
          <MoodPinTag
            label={bubble.locationCity.split(',')[0]}
            metric={count > 1 ? `×${count}` : `+${bubble.likesCount}`}
            emotion={bubble.emotion}
            onPress={() => onBubblePress(bubble)}
          />
        </View>
      ))}
    </View>
  );
};


const styles = StyleSheet.create({
  freqChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  canvasMarkerWrapper: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
});
