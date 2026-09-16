import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { HomeStackParamList, MainTabParamList } from '@/navigation/types';
import { theme, colors, getEmotionConfig } from '@/theme';
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
    timestamp: '15m ago',
    likesCount: 78,
    commentsCount: 22,
    latitude: 35.6762,
    longitude: 139.6503,
    canvasX: SCREEN_WIDTH * 0.68,
    canvasY: SCREEN_HEIGHT * 0.25,
  },
  {
    id: 'b-3',
    authorName: 'Marcus Aurel',
    auraScore: 510,
    emotion: 'excitement',
    secondaryEmotion: 'Inspired',
    intensity: 8,
    content: 'Finished launching our project from a cozy cafe by the Thames! Excited for what is ahead.',
    locationCity: 'London, UK',
    weatherCondition: 'Mild Rain',
    weatherTemp: 16,
    timestamp: '25m ago',
    likesCount: 52,
    commentsCount: 14,
    latitude: 51.5074,
    longitude: -0.1278,
    canvasX: SCREEN_WIDTH * 0.22,
    canvasY: SCREEN_HEIGHT * 0.28,
  },
  {
    id: 'b-4',
    authorName: 'Sophie Dubois',
    auraScore: 390,
    emotion: 'love',
    secondaryEmotion: 'Grateful',
    intensity: 9,
    content: 'Sitting in Luxembourg Gardens listening to soft acoustic music. Grateful for today.',
    locationCity: 'Paris, France',
    weatherCondition: 'Sunny Afternoon',
    weatherTemp: 21,
    timestamp: '45m ago',
    likesCount: 65,
    commentsCount: 17,
    latitude: 48.8566,
    longitude: 2.3522,
    canvasX: SCREEN_WIDTH * 0.58,
    canvasY: SCREEN_HEIGHT * 0.18,
  },
  {
    id: 'b-5',
    authorName: 'Ghost Echo',
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

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const mapRef = useRef<any>(null);
  const { isDark, colors: activeColors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeBubble, setActiveBubble] = useState<DisplayBubble | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);
  const [isFullMap, setIsFullMap] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [currentRegion, setCurrentRegion] = useState(INITIAL_REGION);

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

  // Combine and normalize bubbles
  const allBubbles = useMemo(() => {
    if (nearbyApiBubbles && nearbyApiBubbles.length > 0) {
      const mapped: DisplayBubble[] = nearbyApiBubbles.map((item, idx) => ({
        id: item.id || `api-${idx}`,
        authorName: item.is_incognito ? 'Anonymous' : (item.user_id || 'Traveler'),
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
      }));
      return mapped;
    }
    return DEFAULT_BUBBLES;
  }, [nearbyApiBubbles]);

  // Filter bubbles
  const filteredBubbles = useMemo(() => {
    if (!selectedFilter) return allBubbles;
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
    <ScreenWrapper style={styles.container}>
      {/* ── Sleek Top Navigation Bar ── */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitles}>
          <Typography variant="h2" weight="heavy" style={{ color: colors.textPrimary }}>
            MoodSpace
          </Typography>
          <Typography variant="caption" style={{ color: colors.textMuted }}>
            Live Emotional Map & Atmosphere
          </Typography>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionPill}
            onPress={() => {
              setShowTourModal(true);
              haptics.light();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={16} color={colors.primaryLight} />
            <Typography variant="caption" weight="bold" style={{ color: colors.primaryLight, marginLeft: 4 }}>
              Guide
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={handleRecenter}
            activeOpacity={0.7}
          >
            <Ionicons name="locate-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        scrollEnabled={isScrollEnabled}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── Hero Section: World Mood Map ─── */}
        <View
          style={[styles.heroMapContainer, isFullMap && styles.fullMap]}
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
            <View style={styles.ambientCanvas}>
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
            colors={['transparent', 'rgba(10, 11, 20, 0.7)', '#0A0B14']}
            locations={[0, 0.7, 1]}
            style={styles.heroFadeMask}
            pointerEvents="none"
          />

          {/* Floating Map Zoom & Action Controls */}
          <View style={styles.mapFloatingControls}>
            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={() => handleZoom(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={() => handleZoom(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapControlBtn}
              onPress={handleRecenter}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={16} color="#00CEC9" />
            </TouchableOpacity>
          </View>

          {/* Floating Map Status Chip */}
          <View style={styles.mapStatusChip}>
            <View style={styles.pulsingDot} />
            <Typography variant="caption" weight="semibold" style={{ color: colors.textPrimary }}>
              {activeBubblesCount} echoes worldwide
            </Typography>
            <TouchableOpacity
              onPress={() => {
                setIsFullMap(!isFullMap);
                haptics.selection();
              }}
              style={styles.expandMapButton}
            >
              <Ionicons
                name={isFullMap ? 'contract-outline' : 'expand-outline'}
                size={14}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── Bento Grid Content Section ─── */}
        {!isFullMap && (
          <View style={styles.bentoSection}>
            {/* 1. Trending Emotions Ticker */}
            <TrendingMoodsTicker
              trends={SAMPLE_TRENDS}
              onEmotionPress={(emotion) => setSelectedFilter(selectedFilter === emotion ? null : emotion)}
            />

            {/* 2. Bento Row: Streak & Community Aura Stat (Fixed equal proportions) */}
            <View style={styles.bentoRow}>
              <View style={styles.bentoHalf}>
                <StreakWidget currentStreak={7} maxStreak={30} />
              </View>

              <View style={styles.bentoHalf}>
                <GlassCard variant="default" style={styles.auraMetricCard}>
                  <Typography variant="overline" style={{ color: colors.textMuted, marginBottom: 4 }}>
                    COMMUNITY AURA
                  </Typography>
                  <Typography variant="stat" style={{ color: colors.primaryLight }}>
                    7.8
                  </Typography>
                  <Typography variant="caption" style={{ color: colors.textSecondary, marginTop: 4 }}>
                    Mostly Calm & Joy ✨
                  </Typography>
                </GlassCard>
              </View>
            </View>

            {/* 3. Mood Pulse Distribution Hero Tile */}
            <View style={styles.bentoFull}>
              <MoodPulseCard
                data={SAMPLE_PULSE_DATA}
                onEmotionPress={(emotion) => setSelectedFilter(selectedFilter === emotion ? null : emotion)}
              />
            </View>

            {/* 4. Community Spotlight Hero Tile */}
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

            {/* 5. Recent Echoes Masonry Feed */}
            <View style={styles.feedHeader}>
              <Typography variant="overline" style={{ color: colors.textMuted }}>
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
                      <Typography variant="caption" weight="semibold" style={{ color: colors.textPrimary, flex: 1 }}>
                        {bubble.authorName}
                      </Typography>
                      <Typography variant="caption">{config.emoji}</Typography>
                    </View>

                    <Typography
                      variant="bodySmall"
                      style={{ color: colors.textSecondary, marginVertical: 8 }}
                      numberOfLines={4}
                    >
                      {bubble.content}
                    </Typography>

                    <View style={styles.cardFooter}>
                      <Typography variant="caption" style={{ color: colors.textMuted, fontSize: 11 }}>
                        📍 {bubble.locationCity.split(',')[0]}
                      </Typography>
                      <Typography variant="caption" style={{ color: colors.textMuted, fontSize: 11 }}>
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
    backgroundColor: '#0A0B14',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerTitles: {
    flex: 1,
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
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.glass.surface,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroMapContainer: {
    width: SCREEN_WIDTH - 32,
    marginHorizontal: 16,
    height: SCREEN_HEIGHT * 0.32,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  fullMap: {
    width: '100%',
    marginHorizontal: 0,
    borderRadius: 0,
    height: SCREEN_HEIGHT * 0.82,
  },
  heroFadeMask: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(18, 20, 32, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mapStatusChip: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 32, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 8,
    zIndex: 10,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  expandMapButton: {
    padding: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bentoSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
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
    marginTop: 6,
    marginBottom: 2,
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
    backgroundColor: '#0A0B14',
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
