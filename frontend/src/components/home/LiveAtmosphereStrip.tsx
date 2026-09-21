import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { PingDot } from '@/components/common/PingDot';

interface LiveAtmosphereStripProps {
  /** Live sharer count. Omitted while the pulse endpoint is unavailable. */
  count?: number;
}

/**
 * LiveAtmosphereStrip — the Stitch live banner above the feed. Without a
 * count from the API it reads as a plain live state rather than inventing one.
 */
export const LiveAtmosphereStrip: React.FC<LiveAtmosphereStripProps> = ({ count }) => {
  const { colors } = useTheme();

  return (
    <Tactile offset={2} radius={999} contentStyle={styles.strip}>
      <PingDot />
      <Typography variant="overline" numberOfLines={1} style={{ color: colors.textPrimary, marginLeft: 8, flex: 1 }}>
        {typeof count === 'number'
          ? `${count.toLocaleString()} SHARING LIVE GLOBAL ATMOSPHERE`
          : 'SHARING LIVE GLOBAL ATMOSPHERE'}
      </Typography>
      <View style={[styles.badge, { backgroundColor: colors.secondary, borderColor: colors.ink }]}>
        <Typography variant="overline" style={{ color: '#1E1E1E' }}>
          LIVE
        </Typography>
      </View>
    </Tactile>
  );
};

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 8,
  },
  badge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
});
