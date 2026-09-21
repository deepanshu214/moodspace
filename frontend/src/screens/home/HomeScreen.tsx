import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  TouchableOpacity,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getUserPostedBubbles, UserPostBubble } from '@/utils/userPosts';
import { DisplayBubble, toDisplayBubbles, mergeLocalBubbles, filterByEmotion } from '@/utils/bubbles';


import { HomeStackParamList, MainTabParamList } from '@/navigation/types';
import { theme, getEmotionConfig, emotionInk } from '@/theme';
import { staggeredEntrance } from '@/theme/animations';
import { inkOnPastel } from '@/theme/colors';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { GlassCard } from '@/components/common/GlassCard';
import { SkeletonCard } from '@/components/common/Skeleton';
import { LuminousMoodBubble } from '@/components/mood/LuminousMoodBubble';
import { MoodPinTag } from '@/components/mood/MoodPinTag';
import { MoodGlyph, ReactionGlyph, toMoodKey, ReactionKey } from '@/components/mood/MoodGlyph';
import { VoiceTape } from '@/components/mood/VoiceTape';
import { Tactile } from '@/components/common/Tactile';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { BubbleDetailSheet } from '@/components/mood/BubbleDetailSheet';
import { ReactionFloater } from '@/components/mood/ReactionFloater';
import { InteractiveFeatureTour, AppWalkthroughModal } from '@/components/tutorial';
import { useAtmosphericPulse } from '@/hooks/useMap';
import { useNearbyBubbles } from '@/hooks/useMood';
import { MapContainer, Marker, PROVIDER_GOOGLE, WorldMoodCanvas } from '@/components/map';
import { storage } from '@/utils/storage';
import { haptics } from '@/theme/haptics';
import { useTheme } from '@/context';
import { darkMapStyle, lightMapStyle } from '@/theme/mapStyle';
import { MoodSpaceLogo } from '@/components/common/MoodSpaceLogo';

import {
  BentoGrid,
  MoodPulseCard,
  TrendingMoodsTicker,
  StreakWidget,
  CommunitySpotlight,
  LuckyVibeCard,
  LiveAtmosphereStrip,
} from '@/components/home';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type { DisplayBubble };

export const DEFAULT_BUBBLES: DisplayBubble[] = [
  {
    id: 'b-1',
    authorName: 'Aarav Sharma',
    auraScore: 420,
    emotion: 'calm',
    secondaryEmotion: 'Peaceful',
    intensity: 7,
    content: 'Morning breeze on the balcony with warm chai. A quiet moment before the day begins.',
    locationCity: 'New Delhi, India',
    weatherCondition: 'Clear Morning',
    weatherTemp: 26,
    timestamp: '8m ago',
    likesCount: 34,
    commentsCount: 8,
    latitude: 28.6139,
    longitude: 77.209,
    canvasX: SCREEN_WIDTH * 0.28,
    canvasY: SCREEN_HEIGHT * 0.22,
  },
  {
    id: 'b-2',
    authorName: 'Elena Rostova',
    auraScore: 680,
    emotion: 'joy',
    secondaryEmotion: 'Radiant',
    intensity: 9,
    content: 'Walking through Shibuya under the city lights. Energy in the air is incredible!',
    locationCity: 'Tokyo, Japan',
    weatherCondition: 'Crisp Starlight',
    weatherTemp: 18,
    timestamp: '14m ago',
    likesCount: 89,
    commentsCount: 14,
    latitude: 35.6762,
    longitude: 139.6503,
    canvasX: SCREEN_WIDTH * 0.65,
    canvasY: SCREEN_HEIGHT * 0.18,
  },
  {
    id: 'b-3',
    authorName: 'Liam Chen',
    auraScore: 310,
    emotion: 'calm',
    secondaryEmotion: 'Grateful',
    intensity: 8,
    content: 'Rain gently pattering against the library window. Found a cozy corner with my book.',
    locationCity: 'London, UK',
    weatherCondition: 'Gentle Rain',
    weatherTemp: 15,
    timestamp: '28m ago',
    likesCount: 52,
    commentsCount: 11,
    latitude: 51.5074,
    longitude: -0.1278,
    canvasX: SCREEN_WIDTH * 0.45,
    canvasY: SCREEN_HEIGHT * 0.32,
  },
  {
    id: 'b-4',
    authorName: 'Sophie Moreau',
    auraScore: 540,
    emotion: 'love',
    secondaryEmotion: 'Connected',
    intensity: 9,
    content: 'Sunset over Montmartre with old friends. Reminded of how much love is in the little things.',
    locationCity: 'Paris, France',
    weatherCondition: 'Golden Twilight',
    weatherTemp: 21,
    timestamp: '39m ago',
    likesCount: 76,
    commentsCount: 22,
    latitude: 48.8566,
    longitude: 2.3522,
    canvasX: SCREEN_WIDTH * 0.15,
    canvasY: SCREEN_HEIGHT * 0.28,
  },
  {
    id: 'b-5',
    authorName: 'Anonymous Friend',
    auraScore: 210,
    emotion: 'sadness',
    secondaryEmotion: 'Reflective',
    intensity: 6,
    content: 'Some days feel heavier than others. Letting myself slow down without judgment.',
    locationCity: 'New York, USA',
    weatherCondition: 'Cloudy Evening',
    weatherTemp: 19,
    timestamp: '52m ago',
    likesCount: 41,
    commentsCount: 19,
    isAnonymous: true,
    latitude: 40.7128,
    longitude: -74.006,
    canvasX: SCREEN_WIDTH * 0.72,
    canvasY: SCREEN_HEIGHT * 0.26,
  },
];

const INITIAL_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const SAMPLE_TRENDS = [
  { emotion: 'calm', changePercent: 18 },
  { emotion: 'joy', changePercent: 12 },
  { emotion: 'excitement', changePercent: 7 },
  { emotion: 'love', changePercent: 5 },
  { emotion: 'anxiety', changePercent: -8 },
];

const SAMPLE_PULSE_DATA = [
  { emotion: 'calm', percentage: 38 },
  { emotion: 'joy', percentage: 26 },
  { emotion: 'anxiety', percentage: 18 },
  { emotion: 'sadness', percentage: 12 },
  { emotion: 'anger', percentage: 6 },
];

const EMOTION_FILTERS = [
  { id: 'all', label: 'All', emoji: '🌎' },
  { id: 'joy', label: 'Joy', emoji: '☀️' },
  { id: 'calm', label: 'Calm', emoji: '🌿' },
  { id: 'love', label: 'Love', emoji: '💖' },
  { id: 'sadness', label: 'Reflective', emoji: '💜' },
  { id: 'anxiety', label: 'Heavy', emoji: '🌧️' },
];

/** Opaque navy header band: shell ink and translucent paper pills (same in both modes). */
const HEADER_INK = '#FFFDF9';
const HEADER_INK_SOFT = '#9EA3AE';
const HEADER_PILL = {
  backgroundColor: 'rgba(255, 255, 255,0.12)',
  borderColor: 'rgba(255, 255, 255,0.24)',
};



const formatCompact = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n);

/** "● 1.4k feeling right now" — the chip breathes so the map reads as live. */
const LiveActivityPulse: React.FC<{ count: number; colors: any }> = ({ count, colors }) => {
  const breath = useSharedValue(1);

  useEffect(() => {
    breath.value = withRepeat(
      withSequence(
        withTiming(0.82, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const breathStyle = useAnimatedStyle(() => ({ opacity: breath.value }));

  return (
    <Animated.View
      style={[
        styles.mapStatusChip,
        { backgroundColor: colors.glass.surface, borderColor: colors.glass.border },
        breathStyle,
      ]}
    >
      <HeartbeatDot color={colors.successInk} />
      <Typography variant="caption" weight="semibold" style={{ color: colors.textPrimary }}>
        {formatCompact(count)} feeling right now
      </Typography>
    </Animated.View>
  );
};

/** Small heartbeat-style pulsing dot used on the live activity chip */
const HeartbeatDot: React.FC<{ color?: string }> = ({ color = '#5CD694' }) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 550, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 550, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      false
    );
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.55 + (pulse.value - 1) * -0.25,
  }));

  return (
    <View style={{ width: 8, height: 8, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          { width: 8, height: 8, borderRadius: 4, backgroundColor: color },
          dotStyle,
        ]}
      />
    </View>
  );
};

const SELECTED_SCALE = 1.06;

/** Springs a pill up while selected; `squeeze` gives a tap response that settles on the new state. */
const useSelectionSpring = (isSelected: boolean) => {
  const scale = useSharedValue(isSelected ? SELECTED_SCALE : 1);

  useEffect(() => {
    scale.value = withSpring(isSelected ? SELECTED_SCALE : 1, theme.springs.pillowy);
  }, [isSelected]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const squeeze = (willBeSelected: boolean) => {
    scale.value = withSequence(
      withSpring(0.92, { damping: 14, stiffness: 420 }),
      withSpring(willBeSelected ? SELECTED_SCALE : 1, theme.springs.pillowy)
    );
  };

  return { style, squeeze };
};

/** Global flow filter chip — mood glyph over a pigment fill, Stitch-style. */
const SpringyFilterPill: React.FC<{
  filter: { id: string; label: string; emoji: string };
  isSelected: boolean;
  colors: any;
  isDark: boolean;
  /** Shown on the "All" chip only. */
  count?: string;
  onPress: () => void;
}> = ({ filter, isSelected, colors, isDark, count, onPress }) => {
  // Deliberately no selected-scale here: a 1.06 pop left the chosen chip 2px
  // taller than its neighbours, so the row never sat flush.
  const spring = useSelectionSpring(false);
  const isAll = filter.id === 'all';
  const config = getEmotionConfig(filter.id);
  const fill = isAll ? colors.primary : config.primary;

  // Tapping always selects this pill, so the squeeze settles at the selected size.
  const handlePress = () => {
    haptics.light();
    spring.squeeze(true);
    onPress();
  };

  return (
    <Animated.View style={spring.style}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`Filter by ${filter.label}`}
        style={[
          styles.filterPill,
          {
            backgroundColor: isSelected ? fill : colors.surface,
            borderColor: colors.ink,
          },
        ]}
      >
        {isAll ? (
          <Ionicons name="globe-outline" size={14} color={isSelected ? inkOnPastel : colors.textSecondary} />
        ) : (
          <MoodGlyph
            mood={toMoodKey(filter.id)}
            size={14}
            color={isSelected ? inkOnPastel : emotionInk(config, isDark)}
          />
        )}
        <Typography
          variant="label"
          style={{ color: isSelected ? inkOnPastel : colors.textSecondary, marginLeft: 6 }}
        >
          {filter.label}
        </Typography>
        {isAll && count && (
          <View style={[styles.filterCount, { backgroundColor: isSelected ? inkOnPastel : colors.surfaceWarm }]}>
            <Typography variant="overline" style={{ color: isSelected ? '#FFFDF9' : colors.textSecondary }}>
              {count}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const REACTIONS: { key: ReactionKey; label: string }[] = [
  { key: 'empathy', label: 'Support' },
  { key: 'hug', label: 'Hug' },
  { key: 'heart', label: 'With You' },
  { key: 'celebrate', label: 'Celebrate' },
];

/** One echo/feed card — the Stitch field-note card with reaction pills. */
const FeedEchoCard: React.FC<{
  bubble: DisplayBubble;
  colors: any;
  isDark: boolean;
  onPress: () => void;
}> = ({ bubble, colors, isDark, onPress }) => {
  const config = getEmotionConfig(bubble.emotion);
  const ink = emotionInk(config, isDark);
  const [reacted, setReacted] = useState<ReactionKey | null>(null);
  const [floaterKey, setFloaterKey] = useState(0);
  const countScale = useSharedValue(1);

  const handleReact = (rx: ReactionKey) => {
    haptics.light();
    const next = reacted === rx ? null : rx;
    setReacted(next);
    if (next) setFloaterKey((k) => k + 1);
    countScale.value = withSequence(
      withSpring(1.35, { damping: 8, stiffness: 320, mass: 0.6 }),
      withSpring(1, theme.springs.pillowy)
    );
  };

  const countStyle = useAnimatedStyle(() => ({ transform: [{ scale: countScale.value }] }));

  return (
    <Tactile offset={4} radius={24} contentStyle={styles.feedCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatarCircle, { backgroundColor: config.primary, borderColor: colors.ink }]}>
          <Typography variant="label" style={{ color: inkOnPastel }}>
            {(bubble.authorName || '?').charAt(0).toUpperCase()}
          </Typography>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={styles.nameRow}>
            <Typography variant="label" numberOfLines={1} style={{ color: colors.textPrimary }}>
              {bubble.authorName}
            </Typography>
            <View style={[styles.cityTag, { borderColor: colors.ink, backgroundColor: colors.surfaceWarm }]}>
              <Typography variant="overline" numberOfLines={1} style={{ color: colors.textPrimary }}>
                {bubble.locationCity?.split(',')[0]}
              </Typography>
            </View>
          </View>
          <Typography variant="caption" numberOfLines={1} style={{ color: colors.textMuted }}>
            {bubble.timestamp} • {bubble.weatherCondition} {bubble.weatherTemp}°
          </Typography>
        </View>
        <View style={[styles.moodBadge, { backgroundColor: config.primary, borderColor: colors.ink }]}>
          <MoodGlyph mood={toMoodKey(bubble.emotion)} size={12} color={inkOnPastel} />
          <Typography variant="overline" style={{ color: inkOnPastel, marginLeft: 4 }}>
            {(bubble.secondaryEmotion || config.label).toUpperCase()}
          </Typography>
        </View>
      </View>

      <Typography variant="body" style={{ color: colors.textSecondary, marginTop: 12 }} numberOfLines={4}>
        “{bubble.content}”
      </Typography>

      {!!bubble.tags?.length && (
        <View style={styles.tagRow}>
          {bubble.tags.slice(0, 3).map((t) => (
            <View key={t} style={[styles.echoTag, { borderColor: colors.border }]}>
              <Typography variant="overline" style={{ color: colors.textMuted }}>
                #{t.toUpperCase()}
              </Typography>
            </View>
          ))}
        </View>
      )}

      {!!bubble.photoUrl && (
        <Image
          source={{ uri: bubble.photoUrl }}
          style={[styles.echoPhoto, { borderColor: colors.ink }]}
          resizeMode="cover"
          accessibilityLabel="Photo attached to this echo"
        />
      )}

      {/* The tape only appears when the bubble actually carries a voice note. */}
      {!!bubble.voiceUrl && (
        <VoiceTape uri={bubble.voiceUrl} durationMs={bubble.voiceDurationMs} tint={config.primary} />
      )}

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        {REACTIONS.map((rx) => {
          const isOn = reacted === rx.key;
          // Only two counts come back from the API; the rest stay blank until
          // this reader reacts rather than showing an invented tally.
          const base = rx.key === 'heart' ? bubble.likesCount : rx.key === 'empathy' ? bubble.commentsCount : 0;
          const shown = base + (isOn ? 1 : 0);
          return (
            <TouchableOpacity
              key={rx.key}
              onPress={() => handleReact(rx.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isOn }}
              accessibilityLabel={`${rx.label} this echo`}
              style={[
                styles.reactionPill,
                { borderColor: colors.ink, backgroundColor: isOn ? config.background : colors.surface },
              ]}
            >
              {isOn && rx.key === 'heart' && <ReactionFloater emoji="❤️" triggerKey={floaterKey} />}
              <ReactionGlyph reaction={rx.key} size={13} color={isOn ? ink : colors.textMuted} />
              {shown > 0 && (
                <Animated.View style={isOn ? countStyle : undefined}>
                  <Typography variant="overline" style={{ color: isOn ? ink : colors.textMuted, marginLeft: 4 }}>
                    {shown}
                  </Typography>
                </Animated.View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Tactile>
  );
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const mapRef = useRef<any>(null);
  // Must be reactive: a module-level Dimensions snapshot can be 0 (page loaded in a
  // hidden tab) and never updates on rotation or split-screen, collapsing the map.
  const { height: windowHeight } = useWindowDimensions();
  const { isDark, colors, setThemeMode } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeBubble, setActiveBubble] = useState<DisplayBubble | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [isFullMap, setIsFullMap] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [currentRegion, setCurrentRegion] = useState(INITIAL_REGION);
  // The web atlas has no Google Maps camera, so it zooms about its own centre.
  const [webZoom, setWebZoom] = useState(1);


  const handleZoom = (zoomIn: boolean) => {
    haptics.selection();
    const factor = zoomIn ? 0.5 : 2.0;
    const newRegion = {
      latitude: currentRegion.latitude,
      longitude: currentRegion.longitude,
      latitudeDelta: Math.max(0.01, Math.min(70, (currentRegion.latitudeDelta || 0.15) * factor)),
      longitudeDelta: Math.max(0.01, Math.min(70, (currentRegion.longitudeDelta || 0.15) * factor)),
    };
    setCurrentRegion(newRegion);
    setWebZoom((z) => Math.min(4, Math.max(1, zoomIn ? z * 1.4 : z / 1.4)));
    mapRef.current?.animateToRegion?.(newRegion, 300);
  };

  // TanStack queries
  const { data: pulseData } = useAtmosphericPulse();
  const { data: nearbyApiBubbles, isLoading: isFeedLoading } = useNearbyBubbles(
    INITIAL_REGION.latitude,
    INITIAL_REGION.longitude,
    25
  );

  const [myLocalBubbles, setMyLocalBubbles] = useState<UserPostBubble[]>([]);

  const loadLocalBubbles = useCallback(async () => {
    const posts = await getUserPostedBubbles();
    setMyLocalBubbles(posts);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocalBubbles();
    }, [loadLocalBubbles])
  );

  // Combine and normalize bubbles
  const allBubbles = useMemo(() => {
    const base: DisplayBubble[] = (nearbyApiBubbles && nearbyApiBubbles.length > 0)
      ? toDisplayBubbles(nearbyApiBubbles, INITIAL_REGION.latitude, INITIAL_REGION.longitude)
      : DEFAULT_BUBBLES;

    return mergeLocalBubbles(base, myLocalBubbles);
  }, [nearbyApiBubbles, myLocalBubbles]);

  // Filter bubbles
  const filteredBubbles = useMemo(
    () => filterByEmotion(allBubbles, selectedFilter),
    [allBubbles, selectedFilter]
  );

  // Auto-prompt walkthrough for new users
  useEffect(() => {
    const checkTour = async () => {
      try {
        const hasSeenV2 = await storage.getItem('hasCompletedInteractiveTour_v2');
        const hasSeenV1 = await storage.getItem('hasSeenAppTour_v1');
        if (!hasSeenV2 && !hasSeenV1) {
          setShowTourModal(true);
        }
      } catch {}
    };
    checkTour();
  }, []);

  // Request location permission on mount to center map near user if available
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          mapRef.current?.animateToRegion?.({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
          }, 1200);
        }
      } catch {}
    };
    fetchUserLocation();
  }, []);

  const handleBubblePress = (bubble: DisplayBubble) => {
    setActiveBubble(bubble);
    setIsDetailOpen(true);
  };

  const handleRecenter = () => {
    mapRef.current?.animateToRegion?.(INITIAL_REGION, 1000);
    setWebZoom(1);
    haptics.light();
  };

  const activeBubblesCount = pulseData?.active_bubbles_count || allBubbles.length * 18;

  /** Cities represented on the map right now, and the mood leading them. */
  const cityCount = useMemo(
    () => new Set(allBubbles.map((b) => b.locationCity?.split(',')[0]).filter(Boolean)).size,
    [allBubbles]
  );

  const dominantEmotion = useMemo(() => {
    const tally = new Map<string, number>();
    allBubbles.forEach((b) => tally.set(b.emotion, (tally.get(b.emotion) || 0) + 1));
    return [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'calm';
  }, [allBubbles]);

  const dominantConfig = getEmotionConfig(dominantEmotion);
  const dominantInk = emotionInk(dominantConfig, isDark);

  // Shimmer sweep for the "share your vibe" bar, triggered on press
  const shimmerX = useSharedValue(-140);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));
  const triggerShimmer = () => {
    shimmerX.value = -140;
    shimmerX.value = withTiming(SCREEN_WIDTH, { duration: 750, easing: Easing.out(Easing.ease) });
  };

  // Contrast: day title 13.7:1 / subtitle 10.1:1 on navy; night title 6.1:1 / subtitle 4.7:1 on citrus.
  const shareTheme = isDark
    ? { fill: ['#FF5C38', '#FFB4A3'] as const, title: '#1E1E1E', subtitle: '#252830', pill: '#1E1E1E', pillInk: '#FFFDF9', border: 'rgba(28, 30, 36,0.15)' }
    : { fill: ['#1E1E1E', '#252830'] as const, title: '#FFFDF9', subtitle: '#5CD694', pill: '#FF5C38', pillInk: '#1E1E1E', border: 'rgba(255, 255, 255,0.10)' };

  const shareScale = useSharedValue(1);
  const shareScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));
  const openShare = () => {
    haptics.medium();
    triggerShimmer();
    (navigation as any).navigate('CreateBubbleModal');
  };

  return (
    <ScreenWrapper backgroundColor={colors.background} style={styles.container}>
      {/* ── Masthead: brand, guide, settings, profile ── */}
      <View style={[styles.topHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <MoodSpaceLogo size={34} showBackground animated={false} />
          <View style={{ marginLeft: 10, flexShrink: 1 }}>
            <Typography variant="h4" numberOfLines={1} style={{ color: colors.textPrimary }}>
              MoodSpace
            </Typography>
            <Typography variant="overline" style={{ color: colors.textMuted }}>
              FEED
            </Typography>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Light / Dark / System, spelled out rather than hidden in an icon */}
          <ThemeToggle />

          {/* Chats — no tab of its own in the Stitch bar */}
          <TouchableOpacity
            style={[styles.headerIconButton, { borderColor: colors.ink, backgroundColor: colors.surface }]}
            onPress={() => {
              haptics.light();
              (navigation as any).navigate('ChatsTab');
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Chats"
          >
            <Ionicons name="chatbubbles-outline" size={16} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* App settings */}
          <TouchableOpacity
            style={[styles.headerIconButton, { borderColor: colors.ink, backgroundColor: colors.surface }]}
            onPress={() => {
              haptics.light();
              (navigation as any).navigate('ProfileTab', { screen: 'Settings' });
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="App Settings"
          >
            <Ionicons name="settings-outline" size={16} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        scrollEnabled={isScrollEnabled}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!isFullMap && (
          <>
            {/* ① Live atmosphere strip */}
            <Animated.View entering={staggeredEntrance(0)} style={styles.blockGap}>
              <LiveAtmosphereStrip count={pulseData?.active_bubbles_count} />
            </Animated.View>

            {/* ② Lucky Vibe deck */}
            <Animated.View entering={staggeredEntrance(1)} style={styles.blockGap}>
              <LuckyVibeCard
                onVibePress={(emotion) => setSelectedFilter(selectedFilter === emotion ? null : emotion)}
              />
            </Animated.View>
          </>
        )}

        {/* ③ Planetary live vibe map */}
        <Tactile offset={4} radius={24} style={styles.blockGap} contentStyle={styles.mapCard}>
          <View style={styles.mapCardHeader}>
            <Ionicons name="globe-outline" size={18} color={colors.textPrimary} />
            <Typography variant="h4" style={{ color: colors.textPrimary, marginLeft: 8, flex: 1 }}>
              Planetary Live Vibe
            </Typography>
            <View style={[styles.zoomBadge, { backgroundColor: colors.primary, borderColor: colors.ink }]}>
              <Typography variant="overline" style={{ color: inkOnPastel }}>
                ZOOMED {webZoom.toFixed(1)}x
              </Typography>
            </View>
          </View>

          <View
            style={[
              styles.heroMapContainer,
              { borderColor: colors.ink },
              isFullMap ? [styles.fullMap, { height: windowHeight * 0.72 }] : { height: windowHeight * 0.34 },
            ]}
            onTouchStart={() => setIsScrollEnabled(false)}
            onTouchEnd={() => setIsScrollEnabled(true)}
            onTouchCancel={() => setIsScrollEnabled(true)}
          >
            {Platform.OS !== 'web' ? (
              <MapContainer
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
                initialRegion={INITIAL_REGION}
                customMapStyle={isDark ? darkMapStyle : lightMapStyle}
                userInterfaceStyle={isDark ? 'dark' : 'light'}
                showsCompass={false}
                showsUserLocation
                onRegionChangeComplete={(r: any) => setCurrentRegion(r)}
              >
                {filteredBubbles.map((bubble) => (
                  <Marker
                    key={bubble.id}
                    coordinate={{
                      latitude: bubble.latitude,
                      longitude: bubble.longitude,
                    }}
                    onPress={() => handleBubblePress(bubble)}
                  >
                    <LuminousMoodBubble
                      id={bubble.id}
                      emotion={bubble.emotion}
                      intensity={bubble.intensity}
                      authorName={bubble.authorName}
                      isAnonymous={bubble.isAnonymous}
                      size="sm"
                      isFloating
                    />
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <WorldMoodCanvas
                bubbles={filteredBubbles}
                colors={colors}
                isDark={isDark}
                zoom={webZoom}
                onBubblePress={handleBubblePress}
              />
            )}

            {/* Floating on-screen map zoom & action controls */}
            <View style={styles.mapFloatingControls}>
              <TouchableOpacity
                style={[styles.mapControlBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}
                onPress={() => handleZoom(true)}
                activeOpacity={0.8}
                accessibilityLabel="Zoom in"
              >
                <Ionicons name="add" size={18} color={colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mapControlBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}
                onPress={() => handleZoom(false)}
                activeOpacity={0.8}
                accessibilityLabel="Zoom out"
              >
                <Ionicons name="remove" size={18} color={colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mapControlBtn, { backgroundColor: colors.secondary, borderColor: colors.ink }]}
                onPress={handleRecenter}
                activeOpacity={0.8}
                accessibilityLabel="Recenter map"
              >
                <Ionicons name="locate" size={16} color={inkOnPastel} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mapControlBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}
                onPress={() => {
                  setIsFullMap(!isFullMap);
                  haptics.selection();
                }}
                activeOpacity={0.8}
                accessibilityLabel={isFullMap ? 'Exit full screen map' : 'Expand map'}
              >
                <Ionicons
                  name={isFullMap ? 'contract-outline' : 'expand-outline'}
                  size={16}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Live activity pulse */}
            <LiveActivityPulse count={activeBubblesCount} colors={colors} />
          </View>

          <View style={styles.mapCardFooter}>
            <Typography variant="caption" style={{ color: colors.textSecondary, flex: 1 }}>
              Global dominant:{' '}
              <Typography variant="caption" weight="bold" style={{ color: dominantInk }}>
                {dominantConfig.label}
              </Typography>
            </Typography>
            <TouchableOpacity
              onPress={() => {
                haptics.light();
                setIsFullMap(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Explore the full atlas"
            >
              <Typography variant="caption" weight="bold" style={[styles.atlasLink, { color: colors.accentInk }]}>
                Explore Atlas →
              </Typography>
            </TouchableOpacity>
          </View>
        </Tactile>

        {!isFullMap && (
          <View>
            {/* ④ Drop a bubble */}
            <Animated.View entering={staggeredEntrance(2)} style={[styles.blockGap, shareScaleStyle]}>
              <Tactile
                offset={4}
                radius={16}
                backgroundColor={colors.primary}
                contentStyle={styles.ctaButton}
                onPress={openShare}
                accessibilityLabel="Drop a mood bubble on the map"
              >
                <Animated.View style={[styles.shimmerStrip, shimmerStyle]} pointerEvents="none">
                  <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.65)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                </Animated.View>
                <Ionicons name="add" size={20} color={inkOnPastel} />
                <Typography variant="button" style={{ color: inkOnPastel, marginLeft: 6 }}>
                  Drop a Mood Bubble on the Map
                </Typography>
              </Tactile>
            </Animated.View>

            {/* ⑤ Global flow filter */}
            <Animated.View entering={staggeredEntrance(3)} style={styles.blockGap}>
              <View style={styles.sectionHeader}>
                <Typography variant="overline" style={{ color: colors.textMuted }}>
                  GLOBAL FLOW FILTER
                </Typography>
                <Typography variant="caption" style={{ color: colors.textMuted }}>
                  Tap to isolate
                </Typography>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {EMOTION_FILTERS.map((f) => {
                  const isSelected = (!selectedFilter && f.id === 'all') || selectedFilter === f.id;
                  return (
                    <SpringyFilterPill
                      key={f.id}
                      filter={f}
                      isSelected={isSelected}
                      colors={colors}
                      isDark={isDark}
                      count={f.id === 'all' ? formatCompact(activeBubblesCount) : undefined}
                      onPress={() => setSelectedFilter(f.id === 'all' ? null : f.id)}
                    />
                  );
                })}
              </ScrollView>
            </Animated.View>

            {/* ⑥ Community resonance stamps */}
            <Animated.View entering={staggeredEntrance(4)} style={styles.blockGap}>
              <TrendingMoodsTicker
                trends={SAMPLE_TRENDS}
                onEmotionPress={(emotion) => setSelectedFilter(selectedFilter === emotion ? null : emotion)}
              />
            </Animated.View>

            {/* ⑦ Streak ticket + verified circle */}
            <Animated.View entering={staggeredEntrance(5)} style={[styles.blockGap, styles.bentoRow]}>
              <View style={styles.bentoWide}>
                <StreakWidget
                  style={styles.fillCard}
                  currentStreak={7}
                  maxStreak={30}
                  onPress={() => {
                    haptics.light();
                    (navigation as any).navigate('ProfileTab');
                  }}
                />
              </View>
              <View style={styles.bentoNarrow}>
                <CommunitySpotlight
                  style={styles.fillCard}
                  name="Quiet Reflections"
                  description="A serene space for calm moments."
                  memberCount={142}
                  memberAvatars={['Aarav', 'Sophie', 'Marcus', 'Elena']}
                  emotion="calm"
                  onJoinPress={() => {
                    navigation.navigate('CommunityFlow');
                    haptics.success();
                  }}
                />
              </View>
            </Animated.View>

            {/* ⑧ 24h emotional spectrum */}
            <Animated.View entering={staggeredEntrance(6)} style={styles.blockGap}>
              <MoodPulseCard
                data={SAMPLE_PULSE_DATA}
                onEmotionPress={(emotion) => setSelectedFilter(selectedFilter === emotion ? null : emotion)}
              />
            </Animated.View>

            {/* ⑨ Recent echoes */}
            <Animated.View entering={staggeredEntrance(7)} style={styles.feedHeader}>
              <Typography variant="h3" style={{ color: colors.textPrimary }}>
                Recent Echoes
              </Typography>
              {selectedFilter && (
                <TouchableOpacity
                  onPress={() => setSelectedFilter(null)}
                  style={[styles.clearFilterPill, { backgroundColor: colors.surfaceWarm, borderColor: colors.ink }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Clear ${selectedFilter} filter`}
                >
                  <Typography variant="overline" style={{ color: colors.textPrimary }}>
                    CLEAR {selectedFilter.toUpperCase()} ✕
                  </Typography>
                </TouchableOpacity>
              )}
            </Animated.View>

            {isFeedLoading && filteredBubbles.length === 0 ? (
              <View style={styles.feedSkeletonRow}>
                <SkeletonCard style={styles.feedSkeletonCard} />
                <SkeletonCard style={styles.feedSkeletonCard} />
              </View>
            ) : (
              <BentoGrid columns={1} gap={12} animated>
                {filteredBubbles.map((bubble) => (
                  <FeedEchoCard
                    key={bubble.id}
                    bubble={bubble}
                    colors={colors}
                    isDark={isDark}
                    onPress={() => handleBubblePress(bubble)}
                  />
                ))}
              </BentoGrid>
            )}

            {/* ⑩ Heartbeat footer */}
            <View style={styles.heartbeatFooter}>
              <HeartbeatDot color={colors.accent} />
              <Typography variant="overline" style={{ color: colors.textMuted, marginHorizontal: 8 }}>
                LIVE HEARTBEAT OF {cityCount} {cityCount === 1 ? 'CITY' : 'CITIES'}
              </Typography>
              <HeartbeatDot color={colors.accent} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Interactive Bottom Sheet Detail Overlay */}
      <BubbleDetailSheet
        visible={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        bubble={activeBubble}
        onNavigateDetails={(id) => {
          if (activeBubble) {
            navigation.navigate('BubbleDetails', {
              bubbleId: id,
              emotion: activeBubble.emotion,
              authorName: activeBubble.authorName,
            });
          }
        }}
      />

      {/* Interactive In-App Feature Guide */}
      <InteractiveFeatureTour
        visible={showTourModal}
        onClose={() => setShowTourModal(false)}
      />

      {/* Classical Feature Walkthrough (Accessible via Guide or Settings) */}
      <AppWalkthroughModal
        visible={showWalkthroughModal}
        onClose={() => setShowWalkthroughModal(false)}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 4 : 8,
    paddingBottom: 10,
    borderBottomWidth: 2,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    // The controls keep their size; the brand truncates instead of pushing
    // them past the gutter on narrow phones.
    flexShrink: 0,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 140,
  },
  blockGap: {
    marginBottom: 16,
  },
  mapCard: {
    padding: 12,
  },
  mapCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  zoomBadge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  heroMapContainer: {
    borderWidth: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullMap: {
    borderRadius: 16,
  },
  mapCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  atlasLink: {
    textDecorationLine: 'underline',
  },
  mapFloatingControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    alignItems: 'center',
  },
  mapControlBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  mapStatusChip: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 2,
  },
  filterScroll: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Fixed height: the glyph chips and the icon chip measured 40 vs 38 and the
    // row sat a couple of pixels out of true.
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    marginRight: 8,
  },
  filterCount: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    overflow: 'hidden',
  },
  shimmerStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
  },
  bentoRow: {
    flexDirection: 'row',
    // Both cards in this row stretch to the taller one so their bases line up.
    alignItems: 'stretch',
  },
  bentoWide: {
    flex: 3,
    marginRight: 12,
  },
  fillCard: {
    flex: 1,
  },
  bentoNarrow: {
    flex: 2,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clearFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 2,
  },
  feedCard: {
    padding: 14,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityTag: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 6,
    maxWidth: 110,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 2,
    marginTop: 12,
    paddingTop: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  echoTag: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginTop: 4,
  },
  echoPhoto: {
    width: '100%',
    height: 180,
    borderWidth: 2,
    borderRadius: 14,
    marginTop: 12,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginTop: 4,
  },
  heartbeatFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  feedSkeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedSkeletonCard: {
    flex: 1,
    height: 150,
    marginHorizontal: 4,
  },
});
