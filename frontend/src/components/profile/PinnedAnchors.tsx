import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context';
import { getEmotionConfig, emotionInk, inkOnPastel } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { MoodGlyph, toMoodKey } from '@/components/mood/MoodGlyph';
import { UserPostBubble } from '@/utils/userPosts';
import { usePinnedAnchors } from '@/hooks/useAnchors';

interface PinnedAnchorsProps {
  posts: UserPostBubble[];
  onViewMap?: () => void;
}

interface Anchor {
  city: string;
  drops: number;
  emotion: string;
  quote: string;
}

/**
 * PinnedAnchors — the Stitch "places that hold you" list. Anchors are derived
 * from the places this person actually dropped bubbles, not sample locations,
 * so the section stays empty until they have somewhere to show.
 */
export const PinnedAnchors: React.FC<PinnedAnchorsProps> = ({ posts, onViewMap }) => {
  const { colors, isDark } = useTheme();
  const { data: serverAnchors } = usePinnedAnchors();

  const anchors = useMemo<Anchor[]>(() => {
    // Server-pinned anchors win; local drops are the fallback when signed out.
    if (serverAnchors && serverAnchors.length > 0) {
      return serverAnchors.slice(0, 3).map((a) => ({
        city: a.city || a.label,
        drops: a.drops_count,
        emotion: a.emotion || 'calm',
        quote: a.note || a.label,
      }));
    }

    const byCity = new Map<string, Anchor>();
    posts.forEach((p) => {
      const city = (p.locationCity || '').trim();
      if (!city) return;
      const existing = byCity.get(city);
      if (existing) {
        existing.drops += 1;
      } else {
        byCity.set(city, {
          city,
          drops: 1,
          emotion: p.emotion,
          quote: p.content,
        });
      }
    });
    return [...byCity.values()].sort((a, b) => b.drops - a.drops).slice(0, 3);
  }, [posts, serverAnchors]);

  if (anchors.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Typography variant="h4" style={{ color: colors.textPrimary }}>
          Pinned Anchors
        </Typography>
        {onViewMap && (
          <TouchableOpacity onPress={onViewMap} accessibilityRole="button" accessibilityLabel="View anchors on the map">
            <Typography variant="caption" weight="bold" style={[styles.link, { color: colors.accentInk }]}>
              View Map →
            </Typography>
          </TouchableOpacity>
        )}
      </View>

      {anchors.map((anchor) => {
        const config = getEmotionConfig(anchor.emotion);
        return (
          <Tactile key={anchor.city} offset={4} radius={20} style={styles.cell} contentStyle={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.glyphTile, { backgroundColor: config.primary, borderColor: colors.ink }]}>
                <MoodGlyph mood={toMoodKey(anchor.emotion)} size={18} color={inkOnPastel} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Typography variant="overline" numberOfLines={1} style={{ color: colors.textMuted }}>
                  {anchor.city.toUpperCase()}
                </Typography>
                <Typography variant="label" style={{ color: emotionInk(config, isDark) }}>
                  {anchor.drops} {anchor.drops === 1 ? 'drop' : 'drops'}
                </Typography>
              </View>
              <Ionicons name="pin-outline" size={16} color={colors.textMuted} />
            </View>

            <Typography variant="bodySmall" numberOfLines={2} style={{ color: colors.textSecondary, marginTop: 10 }}>
              “{anchor.quote}”
            </Typography>
          </Tactile>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  link: {
    textDecorationLine: 'underline',
  },
  cell: {
    marginBottom: 10,
  },
  card: {
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glyphTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
