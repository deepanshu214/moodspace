import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunity';
import { Ionicons } from '@expo/vector-icons';

export interface CommunityCardProps {
  id: string;
  name: string;
  description: string;
  category?: string;
  memberCount: number;
  dominantEmotion?: string;
  privacy?: string;
  isJoined?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  id,
  name,
  description,
  category = 'Mindfulness',
  memberCount,
  dominantEmotion = 'calm',
  privacy = 'public',
  isJoined = false,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const [joined, setJoined] = useState(isJoined);
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();

  const handleToggleJoin = () => {
    if (joined) {
      setJoined(false);
      leaveCommunity(id);
    } else {
      setJoined(true);
      joinCommunity(id);
    }
  };

  const emotionConfig = theme.getEmotionConfig(dominantEmotion);

  return (
    <Card variant="elevated" style={[styles.card, style]}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {/* Top Header Row: Category Badge & Member Count */}
        <View style={styles.topRow}>
          <View style={styles.categoryPill}>
            <Ionicons name="sparkles" size={12} color={emotionConfig.primary} />
            <Typography variant="caption" weight="bold" color={emotionConfig.primary}>
              {category}
            </Typography>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.memberPill}>
              <Ionicons name="people-outline" size={13} color={colors.textMuted} />
              <Typography variant="caption" color={colors.textMuted}>
                {memberCount}
              </Typography>
            </View>

            {privacy === 'private' && (
              <View style={styles.privatePill}>
                <Ionicons name="lock-closed" size={11} color="#A29BFE" />
              </View>
            )}
          </View>
        </View>

        {/* Community Name & Dominant Emotion */}
        <View style={styles.titleRow}>
          <Typography variant="title" weight="bold" color={colors.textPrimary}>
            {name}
          </Typography>
          <View
            style={[
              styles.emotionBadge,
              { backgroundColor: emotionConfig.background, borderColor: emotionConfig.primary },
            ]}
          >
            <Typography variant="caption">{emotionConfig.emoji}</Typography>
            <Typography
              variant="caption"
              weight="bold"
              color={emotionConfig.primary}
              style={styles.emotionLabel}
            >
              {emotionConfig.label}
            </Typography>
          </View>
        </View>

        {/* Description */}
        <Typography
          variant="bodySmall"
          color={colors.textSecondary}
          numberOfLines={2}
          style={styles.desc}
        >
          {description}
        </Typography>

        {/* Footer Action Row */}
        <View style={styles.footerRow}>
          <Typography variant="caption" color={colors.accentInk} weight="semibold">
            Explore Sanctuary →
          </Typography>

          <Button
            title={joined ? 'Joined' : 'Join Circle'}
            variant={joined ? 'outline' : 'primary'}
            size="sm"
            loading={isJoining || isLeaving}
            onPress={handleToggleJoin}
            style={styles.joinBtn}
          />
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(17, 20, 34, 0.9)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privatePill: {
    padding: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(162, 155, 254, 0.15)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  emotionLabel: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  desc: {
    lineHeight: 20,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 10,
  },
  joinBtn: {
    minWidth: 88,
  },
});
