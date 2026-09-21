import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@/context';
import { getEmotionConfig } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { MoodGlyph, toMoodKey } from '@/components/mood/MoodGlyph';

interface CommunitySpotlightProps {
  name: string;
  description: string;
  memberCount: number;
  /** Display names; initials are stacked into the ring. */
  memberAvatars: string[];
  emotion: string;
  onJoinPress?: () => void;
  /** Outer style, so a bento row can stretch this to match its sibling. */
  style?: StyleProp<ViewStyle>;
}

/**
 * CommunitySpotlight — the Stitch "VERIFIED" circle card: a mood-tinted ring
 * of member initials under a mint verification badge.
 */
export const CommunitySpotlight: React.FC<CommunitySpotlightProps> = ({
  name,
  description,
  memberCount,
  memberAvatars,
  emotion,
  onJoinPress,
  style,
}) => {
  const { colors } = useTheme();
  const config = getEmotionConfig(emotion);

  return (
    <Tactile
      offset={4}
      radius={20}
      style={style}
      fill
      contentStyle={[styles.card, styles.fill]}
      onPress={onJoinPress}
      accessibilityLabel={`${name}, ${memberCount} members. Join community`}
    >
      <View style={[styles.verifiedBadge, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
        <Typography variant="overline" style={{ color: '#1E1E1E' }}>
          VERIFIED
        </Typography>
      </View>

      <View style={[styles.ring, { backgroundColor: config.primary, borderColor: colors.ink }]}>
        <MoodGlyph mood={toMoodKey(emotion)} size={26} color="#1E1E1E" />
      </View>

      <Typography variant="h4" numberOfLines={1} style={{ color: colors.textPrimary, marginTop: 10 }}>
        {name}
      </Typography>
      <Typography variant="caption" numberOfLines={2} style={{ color: colors.textMuted, marginTop: 2 }}>
        {description}
      </Typography>

      <View style={styles.footer}>
        <View style={styles.initials}>
          {memberAvatars.slice(0, 4).map((who, i) => (
            <View
              key={who}
              style={[
                styles.initial,
                { backgroundColor: colors.surfaceWarm, borderColor: colors.ink, marginLeft: i === 0 ? 0 : -8 },
              ]}
            >
              <Typography variant="overline" style={{ color: colors.textPrimary }}>
                {who.charAt(0).toUpperCase()}
              </Typography>
            </View>
          ))}
        </View>
        <Typography variant="caption" weight="bold" style={{ color: colors.textSecondary }}>
          {memberCount} members
        </Typography>
      </View>
    </Tactile>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    alignItems: 'center',
  },
  fill: {
    flex: 1,
    justifyContent: 'center',
  },
  verifiedBadge: {
    alignSelf: 'center',
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 12,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  initials: {
    flexDirection: 'row',
    marginRight: 8,
  },
  initial: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
