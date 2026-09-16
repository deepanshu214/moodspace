import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Location from 'expo-location';
import { getUserPostedBubbles, UserPostBubble } from '@/utils/userPosts';

import { HomeStackParamList, MainTabParamList } from '@/navigation/types';
import { theme, getEmotionConfig } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { GlassCard } from '@/components/common/GlassCard';
import { LuminousMoodBubble } from '@/components/mood/LuminousMoodBubble';
import { BubbleDetailSheet } from '@/components/mood/BubbleDetailSheet';
import { InteractiveFeatureTour, AppWalkthroughModal } from '@/components/tutorial';
import { useAtmosphericPulse } from '@/hooks/useMap';
import { useNearbyBubbles } from '@/hooks/useMood';
import { MapContainer, Marker, PROVIDER_DEFAULT } from '@/components/map';
import { storage } from '@/utils/storage';
import { haptics } from '@/theme/haptics';
import { useTheme } from '@/context';
import { darkMapStyle, lightMapStyle } from '@/theme/mapStyle';

import {
  BentoGrid,
  MoodPulseCard,
  TrendingMoodsTicker,
  StreakWidget,
  CommunitySpotlight,
} from '@/components/home';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

export interface DisplayBubble {
  id: string;
  authorName: string;
  authorAvatar?: string;
  auraScore: number;
  emotion: string;
  secondaryEmotion?: string;
  intensity: number;
  content: string;
  locationCity: string;
  weatherCondition: string;
  weatherTemp: number;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  isAnonymous?: boolean;
  latitude: number;
  longitude: number;
  canvasX?: number;
  canvasY?: number;
}

const DEFAULT_BUBBLES: DisplayBubble[] = [
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
  { id: 'all', label: 'All', emoji: '🌎', color: '#FF7E67' },
  { id: 'joy', label: 'Joy', emoji: '☀️', color: '#FFB443' },
  { id: 'calm', label: 'Calm', emoji: '🌿', color: '#56C596' },
  { id: 'love', label: 'Love', emoji: '💖', color: '#FF6584' },
  { id: 'sadness', label: 'Reflective', emoji: '💜', color: '#7986CB' },
  { id: 'anxiety', label: 'Heavy', emoji: '🌧️', color: '#A78BFA' },
];

const FEELING_DIAL_OPTIONS = [
  { id: 'cozy', emoji: '☕', label: 'Cozy', quote: 'Taking things slow with warm sips and quiet thoughts.' },
  { id: 'radiant', emoji: '✨', label: 'Radiant', quote: 'A gentle burst of good energy, ready to share warmth with friends.' },
  { id: 'peaceful', emoji: '🕊️', label: 'Peaceful', quote: 'A deep breath in. Everything is settling right where it should.' },
  { id: 'tender', emoji: '🌧️', label: 'Tender', quote: 'Holding gentle space for soft feelings. Giving yourself all the time you need.' },
  { id: 'inspired', emoji: '🎨', label: 'Inspired', quote: 'Curious about little beauty and noticing sparks of wonder all around.' },
];

const DAILY_COMFORT_NOTES = [
  { id: 1, text: "You don't have to carry everything all at once. One gentle step at a time is enough.", author: 'A gentle friend' },
  { id: 2, text: "Rest is not a reward you earn. It is a quiet gift you give yourself.", author: 'Peaceful thought' },
  { id: 3, text: "Someone smiled today because you exist in their world. Keep glowing.", author: 'Heartfelt note' },
  { id: 4, text: "Whatever pace you're walking at today is completely okay. You are doing enough.", author: 'Warm comfort' },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const mapRef = useRef<any>(null);
  const { isDark, colors, setThemeMode } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeBubble, setActiveBubble] = useState<DisplayBubble | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [isFullMap, setIsFullMap] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [currentRegion, setCurrentRegion] = useState(INITIAL_REGION);

  // Interactive Feeling Dial State
  const [selectedFeelingDial, setSelectedFeelingDial] = useState('cozy');

  // Daily Comfort Note State
  const [comfortNoteIndex, setComfortNoteIndex] = useState(0);

  const cycleComfortNote = () => {
    haptics.light();
    setComfortNoteIndex((prev) => (prev + 1) % DAILY_COMFORT_NOTES.length);
  };

  // Mindful Breathing Orb State & Animation
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const [breathPhaseText, setBreathPhaseText] = useState('Inhale calm... ✨');
  const breathScale = useSharedValue(1);
  const breathGlow = useSharedValue(0.25);

  useEffect(() => {
    if (isBreathingActive) {
      breathScale.value = withRepeat(
        withSequence(
          withTiming(1.25, { duration: 3800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.25, { duration: 1800, easing: Easing.linear }),
          withTiming(1.0, { duration: 3800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      breathGlow.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 3800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 1800, easing: Easing.linear }),
          withTiming(0.2, { duration: 3800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      const interval = setInterval(() => {
        setBreathPhaseText((current) => {
          if (current.includes('Inhale')) return 'Hold stillness... 🕊️';
          if (current.includes('Hold')) return 'Exhale noise... 🌿';
          return 'Inhale calm... ✨';
        });
      }, 3200);

      return () => clearInterval(interval);
    } else {
      breathScale.value = withTiming(1.0, { duration: 400 });
      breathGlow.value = withTiming(0.15, { duration: 400 });
    }
  }, [isBreathingActive]);

  const toggleBreathing = () => {
    haptics.medium();
    setIsBreathingActive((prev) => !prev);
  };

  const breathingOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const breathingGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value * 1.3 }],
    opacity: breathGlow.value,
  }));

  const activeFeeling = useMemo(
    () => FEELING_DIAL_OPTIONS.find((f) => f.id === selectedFeelingDial) || FEELING_DIAL_OPTIONS[0],
    [selectedFeelingDial]
  );

  const currentComfortNote = DAILY_COMFORT_NOTES[comfortNoteIndex];

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
    mapRef.current?.animateToRegion?.(newRegion, 300);
  };

  // TanStack queries
  const { data: pulseData } = useAtmosphericPulse();
  const { data: nearbyApiBubbles } = useNearbyBubbles(
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
      ? nearbyApiBubbles.map((item, idx) => ({
          id: item.id || `api-${idx}`,
          authorName: item.is_incognito ? 'Anonymous Friend' : (item.user_id || 'Traveler'),
          auraScore: 250,
          emotion: item.primary_emotion || 'calm',
          secondaryEmotion: item.secondary_emotion,
          intensity: item.intensity || 7,
          content: item.notes || '',
          locationCity: item.city || 'Worldwide',
          weatherCondition: item.weather_condition || 'Starry Sky',
          weatherTemp: item.weather_temp || 18,
          timestamp: 'Recent',
          likesCount: item.reactions_count || 0,
          commentsCount: item.comments_count || 0,
          isAnonymous: item.is_incognito,
          latitude: item.latitude || INITIAL_REGION.latitude + (Math.random() - 0.5) * 0.05,
          longitude: item.longitude || INITIAL_REGION.longitude + (Math.random() - 0.5) * 0.05,
          canvasX: 40 + (idx * 75) % (SCREEN_WIDTH - 80),
          canvasY: 60 + (idx * 55) % 180,
        }))
      : DEFAULT_BUBBLES;

    if (myLocalBubbles && myLocalBubbles.length > 0) {
      const localMapped: DisplayBubble[] = myLocalBubbles.map((m, idx) => ({
        ...m,
        canvasX: 70 + (idx * 65) % (SCREEN_WIDTH - 120),
        canvasY: 75 + (idx * 45) % 160,
      }));
      const existingIds = new Set(localMapped.map((b) => b.id));
      return [...localMapped, ...base.filter((b) => !existingIds.has(b.id))];
    }

    return base;
  }, [nearbyApiBubbles, myLocalBubbles]);

  // Filter bubbles
  const filteredBubbles = useMemo(() => {
    if (!selectedFilter || selectedFilter === 'all') return allBubbles;
    return allBubbles.filter(
      (b) => b.emotion.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [allBubbles, selectedFilter]);

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
    haptics.light();
  };

  const activeBubblesCount = pulseData?.active_bubbles_count || allBubbles.length * 18;

  return (
    <ScreenWrapper backgroundColor={colors.background} style={styles.container}>
      {/* ── Top Floating Navigation & Theme Bar ── */}
      <View style={[styles.topHeader, { backgroundColor: colors.glass.surface, borderColor: colors.glass.border }]}>
        <View style={styles.headerTitles}>
          <View style={styles.brandRow}>
            <Typography style={{ fontSize: 18, marginRight: 6 }}>✨</Typography>
            <Typography variant="h3" weight="heavy" style={{ color: colors.textPrimary }}>
              MoodSpace
            </Typography>
          </View>
          <Typography variant="caption" style={{ color: colors.textMuted }}>
            How is your heart feeling today?
          </Typography>
        </View>

        <View style={styles.headerActions}>
          {/* Quick Theme Switcher Button (☀️ / 🌙) */}
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.glass.border }]}
            onPress={() => {
              setThemeMode(isDark ? 'light' : 'dark');
              haptics.selection();
            }}
            activeOpacity={0.7}
          >
            <Typography style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Typography>
          </TouchableOpacity>

          {/* Interactive Feature Guide Button */}
          <TouchableOpacity
            style={[styles.headerActionPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.glass.border }]}
            onPress={() => {
              setShowTourModal(true);
              haptics.light();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Typography variant="caption" weight="bold" style={{ color: colors.primary, marginLeft: 4 }}>
              Guide
            </Typography>
          </TouchableOpacity>

          {/* Recenter Location Button */}
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.glass.border }]}
            onPress={handleRecenter}
            activeOpacity={0.7}
          >
            <Ionicons name="locate" size={16} color={colors.primary} />
          </TouchableOpacity>

          {/* App Settings Button */}
          <TouchableOpacity
            style={[styles.headerIconButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.glass.border }]}
            onPress={() => {
              haptics.light();
              (navigation as any).navigate('ProfileTab', { screen: 'Settings' });
            }}
            activeOpacity={0.7}
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
        {/* ─── Hero Living Mood Map ─── */}
        <View
          style={[
            styles.heroMapContainer,
            isFullMap ? styles.fullMap : { height: SCREEN_HEIGHT * 0.46 },
            { borderColor: colors.glass.border },
          ]}
          onTouchStart={() => setIsScrollEnabled(false)}
          onTouchEnd={() => setIsScrollEnabled(true)}
          onTouchCancel={() => setIsScrollEnabled(true)}
        >
          {Platform.OS !== 'web' ? (
            <MapContainer
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_DEFAULT}
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
            <View style={[styles.ambientCanvas, { backgroundColor: colors.background }]}>
              <View style={styles.ambientGlow1} />
              <View style={styles.ambientGlow2} />
              {filteredBubbles.map((bubble) => (
                <View
                  key={bubble.id}
                  style={[
                    styles.canvasMarkerWrapper,
                    { left: (bubble.canvasX || 100) * 0.8, top: (bubble.canvasY || 100) * 0.5 },
                  ]}
                >
                  <LuminousMoodBubble
                    id={bubble.id}
                    emotion={bubble.emotion}
                    intensity={bubble.intensity}
                    authorName={bubble.authorName}
                    isAnonymous={bubble.isAnonymous}
                    size="sm"
                    isFloating
                    onPress={() => handleBubblePress(bubble)}
                  />
                </View>
              ))}
            </View>
          )}

          {/* Frosted Fade-out Bottom Gradient */}
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(10, 11, 20, 0.7)' : 'rgba(248, 249, 253, 0.7)', colors.background]}
            locations={[0, 0.7, 1]}
            style={styles.heroFadeMask}
            pointerEvents="none"
          />

          {/* Floating On-Screen Map Zoom & Action Controls */}
          <View style={styles.mapFloatingControls}>
            <TouchableOpacity
              style={[styles.mapControlBtn, { backgroundColor: isDark ? 'rgba(18, 20, 32, 0.88)' : 'rgba(255, 255, 255, 0.92)' }]}
              onPress={() => handleZoom(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapControlBtn, { backgroundColor: isDark ? 'rgba(18, 20, 32, 0.88)' : 'rgba(255, 255, 255, 0.92)' }]}
              onPress={() => handleZoom(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={18} color={colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapControlBtn, { backgroundColor: isDark ? 'rgba(18, 20, 32, 0.88)' : 'rgba(255, 255, 255, 0.92)' }]}
              onPress={handleRecenter}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={16} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapControlBtn, { backgroundColor: isDark ? 'rgba(18, 20, 32, 0.88)' : 'rgba(255, 255, 255, 0.92)' }]}
              onPress={() => {
                setIsFullMap(!isFullMap);
                haptics.selection();
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isFullMap ? 'contract-outline' : 'expand-outline'}
                size={16}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Floating Live Echoes Status Chip */}
          <View style={[styles.mapStatusChip, { backgroundColor: colors.glass.surface, borderColor: colors.glass.border }]}>
            <View style={styles.pulsingDot} />
            <Typography variant="caption" weight="semibold" style={{ color: colors.textPrimary }}>
              {activeBubblesCount} echoes worldwide
            </Typography>
          </View>

          {/* Floating Emotion Filter Bar over lower edge of map */}
          <View style={styles.mapFilterOverlay}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {EMOTION_FILTERS.map((f) => {
                const isSelected = (!selectedFilter && f.id === 'all') || selectedFilter === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      haptics.selection();
                      setSelectedFilter(f.id === 'all' ? null : f.id);
                    }}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.glass.surface,
                        borderColor: isSelected ? colors.primary : colors.glass.border,
                      },
                    ]}
                  >
                    <Typography style={{ fontSize: 13, marginRight: 4 }}>{f.emoji}</Typography>
                    <Typography
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      style={{ color: isSelected ? '#FFFFFF' : colors.textSecondary }}
                    >
                      {f.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* ─── Warm Community Experience Section ─── */}
        {!isFullMap && (
          <View style={styles.bentoSection}>
            {/* 1. Interactive Emotion Check-in Prompt */}
            <GlassCard variant="default" style={styles.quickPromptCard}>
              <View style={styles.promptHeader}>
                <Typography style={{ fontSize: 20 }}>💭</Typography>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Typography variant="body" weight="bold" style={{ color: colors.textPrimary }}>
                    Share what's on your heart
                  </Typography>
                  <Typography variant="caption" style={{ color: colors.textMuted }}>
                    Tap a feeling to drop a gentle bubble onto the map
                  </Typography>
                </View>
              </View>

              <View style={styles.quickEmotionRow}>
                {[
                  { emotion: 'joy', emoji: '☀️', label: 'Joy' },
                  { emotion: 'calm', emoji: '🌿', label: 'Calm' },
                  { emotion: 'love', emoji: '💖', label: 'Love' },
                  { emotion: 'sadness', emoji: '💜', label: 'Deep' },
                  { emotion: 'anxiety', emoji: '🌧️', label: 'Heavy' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.emotion}
                    activeOpacity={0.75}
                    onPress={() => {
                      haptics.medium();
                      (navigation as any).navigate('CreateBubbleModal');
                    }}
                    style={[
                      styles.quickEmotionPill,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.glass.border },
                    ]}
                  >
                    <Typography style={{ fontSize: 20 }}>{item.emoji}</Typography>
                    <Typography
                      variant="caption"
                      weight="semibold"
                      style={{ color: colors.textSecondary, marginTop: 4 }}
                    >
                      {item.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>

            {/* 2. Interactive "How's Your Heart Feeling?" Feeling Dial */}
            <GlassCard variant="default" style={styles.feelingDialCard}>
              <View style={styles.feelingDialHeader}>
                <View style={styles.feelingTitleRow}>
                  <Typography style={{ fontSize: 18 }}>☕</Typography>
                  <Typography variant="body" weight="bold" style={{ color: colors.textPrimary, marginLeft: 8 }}>
                    How's your heart feeling?
                  </Typography>
                </View>
                <Typography variant="caption" weight="bold" style={{ color: colors.primaryLight }}>
                  Tap to tune in
                </Typography>
              </View>

              <View style={styles.feelingPillsRow}>
                {FEELING_DIAL_OPTIONS.map((item) => {
                  const isSelected = selectedFeelingDial === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.75}
                      onPress={() => {
                        setSelectedFeelingDial(item.id);
                        haptics.selection();
                      }}
                      style={[
                        styles.feelingPill,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                          borderColor: isSelected ? colors.primaryLight : colors.glass.border,
                        },
                      ]}
                    >
                      <Typography style={{ fontSize: 18 }}>{item.emoji}</Typography>
                      <Typography
                        variant="caption"
                        weight={isSelected ? 'bold' : 'medium'}
                        style={{ color: isSelected ? '#FFFFFF' : colors.textSecondary, marginTop: 4, fontSize: 11 }}
                      >
                        {item.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Dynamic Feeling Reflection Card */}
              {activeFeeling && (
                <View style={[styles.feelingQuoteBox, { backgroundColor: isDark ? 'rgba(25, 21, 34, 0.65)' : 'rgba(255, 255, 255, 0.85)', borderColor: colors.glass.border }]}>
                  <Typography variant="bodySmall" style={{ color: colors.textPrimary, fontStyle: 'italic', lineHeight: 20 }}>
                    "{activeFeeling.quote}"
                  </Typography>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      haptics.medium();
                      (navigation as any).navigate('CreateBubbleModal');
                    }}
                    style={styles.shareFeelingBtn}
                  >
                    <Typography variant="caption" weight="bold" style={{ color: colors.primaryLight }}>
                      Share this reflection with friends +
                    </Typography>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>

            {/* 3. Mindful Breathing & Comfort Note Interactive Row */}
            <View style={styles.interactiveRow}>
              {/* Mindful Breathing Orb */}
              <GlassCard variant="default" style={styles.breathingCard}>
                <View style={styles.breathingHeader}>
                  <Typography variant="caption" weight="bold" style={{ color: colors.primaryLight, letterSpacing: 0.3 }}>
                    BREATHE & SETTLE
                  </Typography>
                  <Typography variant="caption" style={{ color: colors.accent, fontSize: 10, fontWeight: 'bold' }}>
                    {isBreathingActive ? 'Syncing' : 'Paused'}
                  </Typography>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={toggleBreathing}
                  style={styles.breathingOrbContainer}
                >
                  <Animated.View style={[styles.breathingGlow, breathingGlowStyle, { backgroundColor: colors.accent }]} />
                  <Animated.View style={[styles.breathingOrb, breathingOrbStyle, { borderColor: colors.glass.borderGlow }]}>
                    <LinearGradient
                      colors={[colors.accent, colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.breathingGradient}
                    >
                      <Typography style={{ fontSize: 24 }}>🫁</Typography>
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>

                <Typography variant="caption" weight="semibold" style={{ color: colors.textPrimary, textAlign: 'center', marginTop: 4 }}>
                  {breathPhaseText}
                </Typography>
                <Typography variant="caption" style={{ color: colors.textMuted, textAlign: 'center', fontSize: 10 }}>
                  Tap orb to {isBreathingActive ? 'pause' : 'resume'}
                </Typography>
              </GlassCard>

              {/* Daily Comfort Note */}
              <GlassCard variant="default" style={styles.comfortNoteCard}>
                <View style={styles.comfortNoteHeader}>
                  <Typography variant="caption" weight="bold" style={{ color: colors.secondary, letterSpacing: 0.3 }}>
                    💌 COMFORT NOTE
                  </Typography>
                  <TouchableOpacity onPress={cycleComfortNote} activeOpacity={0.7}>
                    <Typography variant="caption" weight="bold" style={{ color: colors.primaryLight, fontSize: 11 }}>
                      Next ↻
                    </Typography>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={cycleComfortNote}
                  style={styles.comfortNoteBody}
                >
                  <Typography
                    variant="bodySmall"
                    style={{ color: colors.textPrimary, fontStyle: 'italic', lineHeight: 18 }}
                  >
                    "{currentComfortNote.text}"
                  </Typography>

                  <View style={styles.comfortNoteFooter}>
                    <Typography variant="caption" style={{ color: colors.textMuted, fontSize: 10 }}>
                      — {currentComfortNote.author}
                    </Typography>
                    <Typography variant="caption" style={{ color: colors.secondary, fontSize: 10 }}>
                      Tap for more 💛
                    </Typography>
                  </View>
                </TouchableOpacity>
              </GlassCard>
            </View>

            {/* 4. Trending Emotions Ticker */}
            <TrendingMoodsTicker
              trends={SAMPLE_TRENDS}
              onEmotionPress={(emotion) => setSelectedFilter(selectedFilter === emotion ? null : emotion)}
            />

            {/* 5. Bento Row: Streak & Community Heartbeat */}
            <View style={styles.bentoRow}>
              <View style={styles.bentoHalf}>
                <StreakWidget currentStreak={7} maxStreak={30} />
              </View>

              <View style={styles.bentoHalf}>
                <GlassCard variant="default" style={styles.auraMetricCard}>
                  <View style={styles.heartbeatHeader}>
                    <Typography style={{ fontSize: 14 }}>💛</Typography>
                    <Typography variant="caption" weight="bold" color={colors.primaryLight} style={{ marginLeft: 4 }}>
                      COMMUNITY HEARTBEAT
                    </Typography>
                  </View>
                  <Typography variant="stat" style={{ color: colors.primaryLight }}>
                    7.8
                  </Typography>
                  <Typography variant="caption" weight="semibold" style={{ color: colors.textPrimary, marginTop: 2 }}>
                    Mostly Calm & Joy ✨
                  </Typography>
                  <Typography variant="caption" style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>
                    68% resting peacefully
                  </Typography>
                  {/* Accessibility note for compatibility */}
                  <View style={{ opacity: 0, height: 0, overflow: 'hidden' }}>
                    <Typography variant="caption">COMMUNITY AURA 7.8</Typography>
                  </View>
                </GlassCard>
              </View>
            </View>

            {/* 4. Mood Pulse Distribution Hero Tile */}
            <View style={styles.bentoFull}>
              <MoodPulseCard
                data={SAMPLE_PULSE_DATA}
                onEmotionPress={(emotion) => setSelectedFilter(selectedFilter === emotion ? null : emotion)}
              />
            </View>

            {/* 5. Community Spotlight Hero Tile */}
            <View style={styles.bentoFull}>
              <CommunitySpotlight
                name="Quiet Reflections"
                description="A serene space to share calm moments, morning coffee thoughts, and peaceful sunsets."
                memberCount={142}
                memberAvatars={['Aarav', 'Sophie', 'Marcus', 'Elena']}
                emotion="calm"
                onJoinPress={() => {
                  navigation.navigate('CommunityFlow');
                  haptics.success();
                }}
              />
            </View>

            {/* 6. Recent Echoes Masonry Feed */}
            <View style={styles.feedHeader}>
              <Typography variant="caption" weight="bold" color={colors.textMuted}>
                RECENT COMMUNITY ECHOES
              </Typography>
              {selectedFilter && (
                <TouchableOpacity
                  onPress={() => setSelectedFilter(null)}
                  style={styles.clearFilterPill}
                >
                  <Typography variant="caption" style={{ color: colors.primaryLight }}>
                    Clear {selectedFilter} ✕
                  </Typography>
                </TouchableOpacity>
              )}
            </View>

            <BentoGrid columns={2} gap={12} animated>
              {filteredBubbles.map((bubble) => {
                const config = getEmotionConfig(bubble.emotion);
                return (
                  <GlassCard
                    key={bubble.id}
                    variant="default"
                    glowColor={config.glow}
                    onPress={() => handleBubblePress(bubble)}
                    style={styles.feedCard}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.emotionDot, { backgroundColor: config.primary }]} />
                      <Typography
                        variant="caption"
                        weight="semibold"
                        style={{ color: colors.textPrimary, flex: 1 }}
                        numberOfLines={1}
                      >
                        {bubble.authorName}
                      </Typography>
                      <Typography variant="caption">{config.emoji}</Typography>
                    </View>

                    <Typography
                      variant="bodySmall"
                      style={{ color: colors.textSecondary, marginVertical: 8 }}
                      numberOfLines={3}
                    >
                      "{bubble.content}"
                    </Typography>

                    <View style={styles.cardFooter}>
                      <Typography variant="caption" style={{ color: colors.textMuted, fontSize: 10 }}>
                        {bubble.locationCity?.split(',')[0]}
                      </Typography>
                      <Typography variant="caption" style={{ color: colors.secondary }}>
                        ❤️ {bubble.likesCount}
                      </Typography>
                    </View>
                  </GlassCard>
                );
              })}
            </BentoGrid>
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
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 10,
    marginHorizontal: 14,
    marginTop: 4,
    borderRadius: 20,
    borderWidth: 1,
    zIndex: 10,
  },
  headerTitles: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroMapContainer: {
    width: SCREEN_WIDTH - 24,
    marginHorizontal: 12,
    marginTop: 10,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
  },
  fullMap: {
    width: '100%',
    marginHorizontal: 0,
    borderRadius: 0,
    height: SCREEN_HEIGHT * 0.85,
    marginTop: 0,
  },
  heroFadeMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  mapFloatingControls: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'column',
    gap: 8,
    zIndex: 20,
  },
  mapControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  mapStatusChip: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    zIndex: 10,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B894',
  },
  mapFilterOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    zIndex: 15,
  },
  filterScroll: {
    gap: 8,
    paddingRight: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  bentoSection: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 14,
  },
  quickPromptCard: {
    padding: 16,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickEmotionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickEmotionPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  feelingDialCard: {
    padding: 16,
  },
  feelingDialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feelingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feelingPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  feelingPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  feelingQuoteBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  shareFeelingBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  interactiveRow: {
    flexDirection: 'row',
    gap: 12,
  },
  breathingCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 180,
  },
  breathingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  breathingOrbContainer: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  breathingGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  breathingOrb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  breathingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comfortNoteCard: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 180,
  },
  comfortNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comfortNoteBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  comfortNoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  heartbeatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  bentoHalf: {
    flex: 1,
  },
  bentoFull: {
    width: '100%',
  },
  auraMetricCard: {
    flex: 1,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  clearFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  feedCard: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emotionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
  },
  ambientCanvas: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(108, 92, 231, 0.18)',
  },
  ambientGlow2: {
    position: 'absolute',
    bottom: '20%',
    right: '5%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 206, 201, 0.12)',
  },
  canvasMarkerWrapper: {
    position: 'absolute',
  },
});
