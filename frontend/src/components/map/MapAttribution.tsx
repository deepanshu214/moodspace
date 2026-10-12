import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Typography } from '@/components/common/Typography';
import { useTheme } from '@/context';
import { BASEMAP_ATTRIBUTION } from './freeTiles';

/**
 * Credit for the free basemap. The OpenStreetMap licence requires this to stay
 * visible wherever the tiles are drawn, so it is not optional decoration.
 */
export const MapAttribution: React.FC<{ style?: any }> = ({ style }) => {
  const { colors } = useTheme();

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }, style]}
    >
      <Typography variant="caption" style={{ color: colors.textMuted, fontSize: 9 }}>
        {BASEMAP_ATTRIBUTION}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    opacity: 0.9,
  },
});
