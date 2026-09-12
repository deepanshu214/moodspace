import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { EchoMatchResponse, EchoMatchReason } from '@/api/types';

interface ResonanceMatchCardProps {
  match: EchoMatchResponse;
  onConnect: (match: EchoMatchResponse) => void;
  onPass: (match: EchoMatchResponse) => void;
  isConnecting?: boolean;
}

const REASON_LABELS: Record<EchoMatchReason, { icon: string; label: string }> = {
  shared_emotion:        { icon: 'heart',               label: 'Sharing the same feeling' },
  complementary_emotion: { icon: 'git-merge',           label: 'Complementary energy' },
  location_proximity:    { icon: 'location',             label: 'Near you' },
  community_overlap:     { icon: 'people',               label: 'Mutual sanctuary' },
  mood_pattern:          { icon: 'trending-up',          label: 'Similar mood journey' },
};

function formatResonanceBar(score: number): string {
  const filled = Math.round(score / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

export const ResonanceMatchCard: React.FC<ResonanceMatchCardProps> = ({
  match,
  onConnect,
  onPass,
  isConnecting,
}) => {
  const emotionCfg = theme.getEmotionConfig(match.current_emotion);
  const isAnon = match.is_anonymous;

  return (
    <View style={[styles.card, { borderColor: emotionCfg.primary + '40' }]}>
      {/* Emotion glow strip */}
      <View style={[styles.emotionStrip, { backgroundColor: emotionCfg.background }]}>
        <Typography variant="caption" color={emotionCfg.primary} style={styles.emotionLabel}>
          {emotionCfg.emoji} {emotionCfg.label}
        </Typography>
        {match.expires_at && (
          <Ionicons name="time-outline" size={12} color={emotionCfg.primary} />
        )}
      </View>

      {/* Avatar + identity */}
      <View style={styles.identity}>
        <Avatar
          name={isAnon ? '?' : match.display_name}
          source={isAnon ? undefined : (match.avatar_url ?? undefined)}
          size="lg"
          emotion={match.current_emotion}
        />

        <View style={styles.nameBlock}>
          <Typography variant="title" weight="semibold">
            {isAnon ? '🌀 Wandering Spirit' : match.display_name}
          </Typography>
          {match.city && !isAnon && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={theme.colors.textMuted} />
              <Typography variant="caption" color={theme.colors.textMuted}>
                {match.city}
              </Typography>
            </View>
          )}
          {match.mutual_communities !== undefined && match.mutual_communities > 0 && (
            <View style={styles.locationRow}>
              <Ionicons name="people-outline" size={13} color={theme.colors.textMuted} />
              <Typography variant="caption" color={theme.colors.textMuted}>
                {match.mutual_communities} mutual sanctuar{match.mutual_communities === 1 ? 'y' : 'ies'}
              </Typography>
            </View>
          )}
        </View>
      </View>

      {/* Resonance score bar */}
      <View style={styles.resonanceSection}>
        <View style={styles.resonanceHeader}>
          <Typography variant="bodySmall" color={theme.colors.textSecondary}>
            Resonance Score
          </Typography>
          <Typography
            variant="title"
            color={emotionCfg.primary}
            weight="bold"
          >
            {match.resonance_score}%
          </Typography>
        </View>
        <View style={styles.resonanceBar}>
          <View
            style={[
              styles.resonanceFill,
              {
                width: `${match.resonance_score}%`,
                backgroundColor: emotionCfg.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Match reasons */}
      {match.match_reasons.length > 0 && (
        <View style={styles.reasonsRow}>
          {match.match_reasons.slice(0, 3).map((reason) => {
            const meta = REASON_LABELS[reason];
            return (
              <View key={reason} style={styles.reasonPill}>
                <Ionicons
                  name={meta.icon as any}
                  size={11}
                  color={theme.colors.textSecondary}
                />
                <Typography variant="caption" color={theme.colors.textSecondary} style={styles.reasonText}>
                  {meta.label}
                </Typography>
              </View>
            );
          })}
        </View>
      )}

      {/* Icebreaker suggestion */}
      {match.icebreaker && (
        <View style={styles.icebreaker}>
          <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.colors.primaryLight} />
          <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.icebreakerText}>
            💬 "{match.icebreaker.prompt}"
          </Typography>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onPass(match)}
          style={styles.passBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <Button
          title={isConnecting ? 'Connecting…' : '✦ Connect'}
          variant="primary"
          onPress={() => onConnect(match)}
          style={styles.connectBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  emotionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  emotionLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resonanceSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: 8,
  },
  resonanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resonanceBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.round,
    overflow: 'hidden',
  },
  resonanceFill: {
    height: '100%',
    borderRadius: theme.radius.round,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: 6,
  },
  reasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reasonText: {
    fontSize: 11,
  },
  icebreaker: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primaryLight,
    gap: 8,
  },
  icebreakerText: {
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  passBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtn: {
    flex: 1,
  },
});
