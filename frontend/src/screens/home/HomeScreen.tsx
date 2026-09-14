import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { HomeStackParamList, MainTabParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { FloatingActionButton } from '@/components/mood/FloatingActionButton';
import { AtmosphericPulseRibbon } from '@/components/mood/AtmosphericPulseRibbon';
import { LuminousMoodBubble } from '@/components/mood/LuminousMoodBubble';
import { BubbleDetailSheet } from '@/components/mood/BubbleDetailSheet';
import { AppWalkthroughModal } from '@/components/tutorial';
import { useAtmosphericPulse } from '@/hooks/useMap';
import { useNearbyBubbles } from '@/hooks/useMood';
import { MapContainer, Marker, PROVIDER_DEFAULT } from '@/components/map';
import { storage } from '@/utils/storage';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

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
    canvasY: SCREEN_HEIGHT * 0.32,
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
    canvasY: SCREEN_HEIGHT * 0.45,
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
    canvasY: SCREEN_HEIGHT * 0.62,
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
    canvasX: SCREEN_WIDTH * 0.62,
    canvasY: SCREEN_HEIGHT * 0.22,
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
    canvasX: SCREEN_WIDTH * 0.78,
    canvasY: SCREEN_HEIGHT * 0.68,
  },
];

const INITIAL_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const mapRef = useRef<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeBubble, setActiveBubble] = useState<DisplayBubble | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);

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
        locationCity: item.city || 'San Francisco',
        weatherCondition: item.weather_condition || 'Starry Sky',
        weatherTemp: item.weather_temp || 18,
        timestamp: 'Recent',
        likesCount: item.reactions_count || 0,
        commentsCount: item.comments_count || 0,
        isAnonymous: item.is_incognito,
        latitude: item.latitude || INITIAL_REGION.latitude + (Math.random() - 0.5) * 0.05,
        longitude: item.longitude || INITIAL_REGION.longitude + (Math.random() - 0.5) * 0.05,
        canvasX: 40 + (idx * 75) % (SCREEN_WIDTH - 80),
        canvasY: 180 + (idx * 85) % (SCREEN_HEIGHT - 320),
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
        const hasSeen = await storage.getItem('hasSeenAppTour_v1');
        if (!hasSeen) {
          setShowTourModal(true);
          await storage.setItem('hasSeenAppTour_v1', 'true');
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
  };

  const dominantEmotion = pulseData?.dominant_emotion || 'calm';
  const averageIntensity = pulseData?.intensity_average || 7.4;
  const activeBubblesCount = pulseData?.active_bubbles_count || allBubbles.length * 18;

  return (
    <ScreenWrapper style={styles.container}>
      {/* Top Atmospheric Pulse Ribbon Header */}
      <AtmosphericPulseRibbon
        dominantEmotion={dominantEmotion}
        intensityAverage={averageIntensity}
        activeBubblesCount={activeBubblesCount}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        onRecenterPress={handleRecenter}
        onStreamPress={() => navigation.navigate('FeedStream')}
        onCirclesPress={() => navigation.navigate('CommunityFlow')}
        onTourPress={() => setShowTourModal(true)}
      />

      {/* Main Map or Cosmic Canvas Area */}
      <View style={styles.canvasContainer}>
        {Platform.OS !== 'web' ? (
          <MapContainer
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_DEFAULT}
            initialRegion={INITIAL_REGION}
            customMapStyle={theme.darkMapStyle}
            userInterfaceStyle="dark"
            showsCompass={false}
            showsUserLocation
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
                  size="md"
                  isFloating
                />
              </Marker>
            ))}
          </MapContainer>
        ) : (
          /* Cosmic Celestial Canvas Fallback for Web/Simulator */
          <View style={styles.cosmicGridCanvas}>
            {/* Ambient Background Glows */}
            <View style={styles.glowNebula1} />
            <View style={styles.glowNebula2} />

            {/* Grid Coordinate Markers */}
            <View style={styles.gridOverlay}>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.15)">
                LAT: 28.6139° N • LNG: 77.2090° E • WORLD MOOD CANVAS
              </Typography>
            </View>

            {/* Starlight Constellation Echoes */}
            {filteredBubbles.map((bubble) => (
              <View
                key={bubble.id}
                style={[
                  styles.celestialMarkerWrapper,
                  { left: bubble.canvasX, top: bubble.canvasY },
                ]}
              >
                <LuminousMoodBubble
                  id={bubble.id}
                  emotion={bubble.emotion}
                  intensity={bubble.intensity}
                  authorName={bubble.authorName}
                  isAnonymous={bubble.isAnonymous}
                  size="md"
                  isFloating
                  onPress={() => handleBubblePress(bubble)}
                />
              </View>
            ))}
          </View>
        )}
      </View>

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

      {/* Floating Create Bubble Action Button */}
      <FloatingActionButton
        onPress={() => (navigation as any).navigate('CreateBubbleModal')}
        label="Check In"
        iconName="sparkles"
      />

      {/* App Tour Walkthrough for New Users */}
      <AppWalkthroughModal
        visible={showTourModal}
        onClose={() => setShowTourModal(false)}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080D',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  cosmicGridCanvas: {
    flex: 1,
    backgroundColor: '#07080D',
    position: 'relative',
    overflow: 'hidden',
  },
  glowNebula1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  glowNebula2: {
    position: 'absolute',
    bottom: '20%',
    right: '5%',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(78, 204, 232, 0.08)',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    zIndex: 5,
  },
  celestialMarkerWrapper: {
    position: 'absolute',
  },
});
