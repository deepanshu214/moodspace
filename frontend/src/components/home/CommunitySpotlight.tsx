import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { springs, shadows } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { haptics } from '@/theme/haptics';

interface CommunitySpotlightProps {
  name: string;
  description: string;
  memberCount: number;
  memberAvatars: string[]; // URLs or placeholder names
  emotion: string;
  onJoinPress?: () => void;
}

/**
 * CommunitySpotlight — wide glass hero card for featured community
 * Shows overlapping avatar stack + "Join" glass button
 */
export const CommunitySpotlight: React.FC<CommunitySpotlightProps> = ({
  name,
  description,
  memberCount,
  memberAvatars,
  emotion,
  onJoinPress,
}) => {
  const { colors } = useTheme();
  const joinScale = useSharedValue(1);

  const joinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: joinScale.value }],
  }));

  const handleJoinPressIn = () => {
    joinScale.value = withSpring(0.93, springs.stiff);
    haptics.medium();
  };
  const handleJoinPressOut = () => {
    joinScale.value = withSpring(1, springs.bouncy);
  };

  // Get first 4 avatars for the stack
  const displayAvatars = memberAvatars.slice(0, 4);
  const extraCount = memberCount - displayAvatars.length;

  return (
    <View style={[styles.container, { borderColor: colors.glass.border }, shadows.glassGlow(colors.primary, 0.12)]}>
      <BlurView tint="dark" intensity={25} style={styles.blur}>
        <View style={[styles.content, { backgroundColor: colors.glass.surface }]}>
          {/* Gradient accent at top */}
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.accentStrip}
          />

          <View style={styles.header}>
            <Typography variant="overline" style={{ color: colors.textMuted }}>
              FEATURED COMMUNITY
            </Typography>
          </View>

          <Typography variant="h3" style={{ color: colors.textPrimary, marginBottom: 4 }}>
            {name}
          </Typography>
          <Typography
            variant="bodySmall"
            style={{ color: colors.textSecondary, marginBottom: 16 }}
            numberOfLines={2}
          >
            {description}
          </Typography>

          <View style={styles.footer}>
            {/* Avatar stack */}
            <View style={styles.avatarStack}>
              {displayAvatars.map((avatar, index) => (
                <View
                  key={index}
                  style={[
                    styles.avatarCircle,
                    { borderColor: colors.background },
                    {
                      marginLeft: index > 0 ? -10 : 0,
                      zIndex: displayAvatars.length - index,
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                >
                  <Typography variant="caption" style={{ color: colors.textSecondary }}>
                    {avatar.charAt(0).toUpperCase()}
                  </Typography>
                </View>
              ))}
              {extraCount > 0 && (
                <View style={[styles.avatarCircle, { borderColor: colors.background, marginLeft: -10, backgroundColor: colors.glass.surfaceActive }]}>
                  <Typography variant="caption" weight="semibold" style={{ color: colors.textSecondary, fontSize: 10 }}>
                    +{extraCount > 99 ? '99' : extraCount}
                  </Typography>
                </View>
              )}
              <Typography variant="caption" style={{ color: colors.textMuted, marginLeft: 8 }}>
                {memberCount} members
              </Typography>
            </View>

            {/* Join button */}
            <Pressable
              onPress={onJoinPress}
              onPressIn={handleJoinPressIn}
              onPressOut={handleJoinPressOut}
            >
              <Animated.View style={[styles.joinButton, joinAnimatedStyle]}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.joinGradient}
                >
                  <Typography variant="label" weight="semibold" style={{ color: '#FFFFFF' }}>
                    Join
                  </Typography>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    marginBottom: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  joinGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
});
