import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context';
import { inkOnPastel } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { MoodStreakInfo, StreakBadge } from '@/api/types';

interface MoodPassportProps {
  streak: MoodStreakInfo;
  onBadgePress?: (badge: StreakBadge) => void;
}

const STAMP_DATE = (iso?: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
};

/**
 * MoodPassport — the Stitch stamp collection. Every stamp is an actually
 * unlocked streak badge; locked ones are shown greyed with what they need.
 */
export const MoodPassport: React.FC<MoodPassportProps> = ({ streak, onBadgePress }) => {
  const { colors } = useTheme();
  const badges = streak.streak_milestone_badges ?? [];
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  if (badges.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Typography variant="h4" style={{ color: colors.textPrimary }}>
          Mood Passport
        </Typography>
        <View style={[styles.countBadge, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
          <Typography variant="overline" style={{ color: inkOnPastel }}>
            {unlockedCount} STAMPED
          </Typography>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {badges.map((badge, i) => {
          const stamped = badge.unlocked;
          const date = STAMP_DATE(badge.unlocked_at);
          return (
            <Tactile
              key={badge.id}
              offset={stamped ? 4 : 2}
              radius={16}
              backgroundColor={stamped ? colors.secondary : colors.surface}
              style={styles.stampCell}
              contentStyle={styles.stamp}
              onPress={onBadgePress ? () => onBadgePress(badge) : undefined}
              accessibilityLabel={
                stamped
                  ? `${badge.title}, stamped${date ? ` ${date}` : ''}`
                  : `${badge.title}, locked. Reach a ${badge.days_required} day streak`
              }
            >
              <View style={styles.stampTop}>
                <Typography variant="overline" style={{ color: stamped ? inkOnPastel : colors.textMuted }}>
                  STAMP #{String(i + 1).padStart(2, '0')}
                </Typography>
                <Ionicons
                  name={stamped ? 'checkmark-circle' : 'lock-closed-outline'}
                  size={14}
                  color={stamped ? inkOnPastel : colors.textMuted}
                />
              </View>

              <Typography
                variant="label"
                numberOfLines={1}
                style={{ color: stamped ? inkOnPastel : colors.textSecondary, marginTop: 6 }}
              >
                {badge.title}
              </Typography>
              <Typography
                variant="caption"
                numberOfLines={2}
                style={{ color: stamped ? inkOnPastel : colors.textMuted, opacity: stamped ? 0.75 : 1 }}
              >
                {badge.description}
              </Typography>

              <View style={[styles.stampFooter, { borderTopColor: stamped ? inkOnPastel : colors.border }]}>
                <Typography variant="overline" style={{ color: stamped ? inkOnPastel : colors.textMuted }}>
                  {stamped ? `${date ?? 'EARNED'} • VALIDATED` : `NEEDS ${badge.days_required}-DAY STREAK`}
                </Typography>
              </View>
            </Tactile>
          );
        })}
      </ScrollView>
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
  countBadge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  row: {
    paddingRight: 8,
    paddingBottom: 6,
  },
  stampCell: {
    width: 170,
    marginRight: 10,
  },
  stamp: {
    padding: 12,
    minHeight: 124,
  },
  stampTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stampFooter: {
    borderTopWidth: 2,
    borderStyle: 'dashed',
    marginTop: 10,
    paddingTop: 8,
  },
});
