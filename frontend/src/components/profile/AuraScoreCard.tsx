import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { inkFor } from '@/theme/colors';
import { Typography } from '../common/Typography';
import { Ionicons } from '@expo/vector-icons';
import { AuraScoreBreakdown } from '@/api/types';

interface AuraScoreCardProps {
  aura: AuraScoreBreakdown;
  onExploreAuraHelp?: () => void;
}

export const AuraScoreCard: React.FC<AuraScoreCardProps> = ({
  aura,
  onExploreAuraHelp,
}) => {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const {
    total_score,
    tier,
    tier_color,
    tier_emoji,
    next_tier,
    points_to_next_tier,
    progress_percentage,
    breakdown,
  } = aura;

  const METRICS = [
    { label: 'Check-in Consistency', value: breakdown.checkin_consistency, icon: 'calendar-outline', color: '#60A5FA' },
    { label: 'Empathy Shared', value: breakdown.empathy_reactions_given, icon: 'heart-outline', color: '#F87171' },
    { label: 'Supportive Echoes', value: breakdown.supportive_comments, icon: 'chatbubble-outline', color: '#FF5C38' },
    { label: 'Sanctuary Presence', value: breakdown.sanctuary_participation, icon: 'planet-outline', color: '#5CD694' },
    { label: 'Resonance Matches', value: breakdown.resonance_connections, icon: 'sparkles-outline', color: '#C084FC' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* ── Top Header: Tier & Score ── */}
      <View style={styles.header}>
        <View style={styles.tierInfo}>
          <View style={[styles.glowRing, { backgroundColor: colors.surfaceElevated, borderColor: tier_color }]}>
            <Typography variant="h2" weight="bold" color={inkFor(tier_color, isDark)}>
              {total_score}
            </Typography>
            <Typography variant="caption" color={colors.textMuted} style={styles.auraLabel}>
              AURA
            </Typography>
          </View>

          <View style={styles.tierMeta}>
            <View style={[styles.tierBadge, { backgroundColor: tier_color + '20' }]}>
              <Typography variant="caption" weight="bold" color={inkFor(tier_color, isDark)}>
                {tier_emoji} {tier}
              </Typography>
            </View>
            <Typography variant="caption" color={colors.textSecondary} style={styles.nextTierText}>
              {points_to_next_tier} pts to {next_tier}
            </Typography>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
          style={[styles.expandBtn, { backgroundColor: colors.surfaceElevated }]}
        >
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* ── Tier Progress Bar ── */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.surfaceElevated }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress_percentage}%`, backgroundColor: tier_color },
            ]}
          />
        </View>
        <Typography variant="caption" color={colors.textMuted} style={styles.percentageText}>
          {progress_percentage}%
        </Typography>
      </View>

      {/* ── Contributing Factors (Expandable) ── */}
      {expanded && (
        <View style={[styles.breakdownSection, { borderTopColor: colors.border }]}>
          <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.breakdownTitle}>
            CONTRIBUTING HARMONICS
          </Typography>

          {METRICS.map((metric) => (
            <View key={metric.label} style={styles.metricRow}>
              <View style={styles.metricLabelCol}>
                <Ionicons name={metric.icon as any} size={14} color={inkFor(metric.color, isDark)} style={styles.metricIcon} />
                <Typography variant="caption" color={colors.textSecondary}>
                  {metric.label}
                </Typography>
              </View>
              <Typography variant="caption" weight="bold" color={colors.textPrimary}>
                +{metric.value} pts
              </Typography>
            </View>
          ))}

          <Typography variant="caption" color={colors.textMuted} style={styles.philosophyNote}>
            Aura reflects vulnerability, authentic support, and emotional presence — never social status.
          </Typography>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  glowRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  auraLabel: {
    fontSize: 9,
    letterSpacing: 1,
    marginTop: -2,
  },
  tierMeta: {
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radius.round,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  nextTierText: {
    lineHeight: 16,
  },
  expandBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: theme.radius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.round,
  },
  percentageText: {
    fontSize: 11,
    minWidth: 32,
    textAlign: 'right',
  },
  breakdownSection: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    gap: 8,
  },
  breakdownTitle: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    marginRight: 8,
  },
  philosophyNote: {
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
    textAlign: 'center',
  },
});
