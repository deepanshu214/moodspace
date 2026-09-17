import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';
import { Ionicons } from '@expo/vector-icons';
import { MoodStreakInfo, StreakBadge } from '@/api/types';

interface MoodStreakTrackerProps {
  streakInfo: MoodStreakInfo;
  onCheckInPress?: () => void;
  onBadgePress?: (badge: StreakBadge) => void;
}

const DAYS_OF_WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const MoodStreakTracker: React.FC<MoodStreakTrackerProps> = ({
  streakInfo,
  onCheckInPress,
  onBadgePress,
}) => {
  const { colors } = useTheme();
  const {
    current_streak,
    longest_streak,
    total_checkins,
    has_checked_in_today,
    weekly_activity,
    streak_milestone_badges,
  } = streakInfo;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* ── Top Row: Streak Counter & Status ── */}
      <View style={styles.topRow}>
        <View style={styles.counterBlock}>
          <View style={styles.flameCircle}>
            <Ionicons name="flame" size={26} color="#FD79A8" />
          </View>
          <View style={styles.counterMeta}>
            <View style={styles.streakNumberRow}>
              <Typography variant="h2" weight="bold" color={colors.textPrimary}>
                {current_streak}
              </Typography>
              <Typography variant="title" weight="semibold" color="#FD79A8" style={styles.daysLabel}>
                Day Streak
              </Typography>
            </View>
            <Typography variant="caption" color={colors.textSecondary}>
              {has_checked_in_today
                ? '✨ Today’s reflection released'
                : '🔥 Keep your inner flame alive today'}
            </Typography>
          </View>
        </View>

        {!has_checked_in_today && onCheckInPress && (
          <TouchableOpacity
            style={styles.checkInCta}
            activeOpacity={0.8}
            onPress={onCheckInPress}
          >
            <Typography variant="caption" weight="bold" color="#FFFFFF">
              Check In
            </Typography>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Weekly Activity Dots (Mon - Sun) ── */}
      <View style={[styles.weeklyRow, { borderTopColor: colors.border }]}>
        {DAYS_OF_WEEK.map((day, index) => {
          const isActive = weekly_activity[index] ?? false;
          return (
            <View key={index} style={styles.dayCol}>
              <View
                style={[
                  styles.dayDot,
                  isActive
                    ? styles.dayDotActive
                    : { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
                ]}
              >
                {isActive && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <Typography variant="caption" color={colors.textMuted} style={styles.dayLabel}>
                {day}
              </Typography>
            </View>
          );
        })}
      </View>

      {/* ── Stats Bar: Longest Streak & Total Reflections ── */}
      <View style={[styles.statsBar, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.statItem}>
          <Typography variant="caption" color={colors.textMuted}>
            Personal Best
          </Typography>
          <Typography variant="bodySmall" weight="bold" color={colors.textPrimary}>
            {longest_streak} Days
          </Typography>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Typography variant="caption" color={colors.textMuted}>
            Total Reflections
          </Typography>
          <Typography variant="bodySmall" weight="bold" color={colors.textPrimary}>
            {total_checkins} Released
          </Typography>
        </View>
      </View>

      {/* ── Milestones Carousel ── */}
      <View style={styles.milestonesSection}>
        <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.milestoneHeader}>
          STREAK MILESTONES
        </Typography>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
          {streak_milestone_badges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              activeOpacity={0.75}
              onPress={() => onBadgePress?.(badge)}
              style={[
                styles.badgeChip,
                badge.unlocked
                  ? styles.badgeUnlocked
                  : { backgroundColor: colors.surfaceElevated, borderColor: colors.border, opacity: 0.6 },
              ]}
            >
              <View style={[styles.badgeIconWrapper, badge.unlocked ? styles.iconUnlocked : { backgroundColor: colors.border }]}>
                <Ionicons
                  name={badge.icon as any}
                  size={14}
                  color={badge.unlocked ? '#FD79A8' : colors.textMuted}
                />
              </View>
              <View>
                <Typography
                  variant="caption"
                  weight="bold"
                  color={badge.unlocked ? colors.textPrimary : colors.textMuted}
                >
                  {badge.title}
                </Typography>
                <Typography variant="caption" color={colors.textMuted} style={styles.badgeDays}>
                  {badge.days_required} days
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  counterBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flameCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(253, 121, 168, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(253, 121, 168, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  counterMeta: {
    flex: 1,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  daysLabel: {
    letterSpacing: 0.2,
  },
  checkInCta: {
    backgroundColor: '#FD79A8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.round,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    marginBottom: theme.spacing.sm,
  },
  dayCol: {
    alignItems: 'center',
    gap: 4,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotActive: {
    backgroundColor: '#FD79A8',
  },
  dayLabel: {
    fontSize: 10,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  milestonesSection: {
    marginTop: 4,
  },
  milestoneHeader: {
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  badgesScroll: {
    gap: 8,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    gap: 8,
  },
  badgeUnlocked: {
    backgroundColor: 'rgba(253, 121, 168, 0.08)',
    borderColor: 'rgba(253, 121, 168, 0.3)',
  },
  badgeIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnlocked: {
    backgroundColor: 'rgba(253, 121, 168, 0.2)',
  },
  badgeDays: {
    fontSize: 10,
  },
});
