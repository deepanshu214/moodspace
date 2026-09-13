import React, { useState, useRef, useMemo } from 'react';
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
import { useAtmosphericPulse } from '@/hooks/useMap';
import { useNearbyBubbles } from '@/hooks/useMood';
import { MapContainer, Marker, PROVIDER_DEFAULT } from '@/components/map';
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
    authorName: 'Elena Rostova',
    auraScore: 420,
    emotion: 'calm',
    secondaryEmotion: 'Grateful',
    intensity: 7,
    content: 'Watching dusk settle over the misty hills. A quiet reminder that rest is also progress.',
    locationCity: 'San Francisco',
    weatherCondition: 'Misty Dusk',
    weatherTemp: 17,
    timestamp: '12m ago',
    likesCount: 24,
    commentsCount: 6,
    latitude: 37.7749,
    longitude: -122.4194,
    canvasX: SCREEN_WIDTH * 0.28,
    canvasY: SCREEN_HEIGHT * 0.32,
  },
  {
    id: 'b-2',
    authorName: 'Marcus Aurel',
    auraScore: 680,
    emotion: 'joy',
    secondaryEmotion: 'Euphoric',
    intensity: 9,
    content: 'Just finished our first community project! The collective energy is electrifying.',
    locationCity: 'Oakland',
    weatherCondition: 'Clear Starlight',
    weatherTemp: 21,
    timestamp: '25m ago',
    likesCount: 58,
    commentsCount: 14,
    latitude: 37.7849,
    longitude: -122.4094,
    canvasX: SCREEN_WIDTH * 0.68,
    canvasY: SCREEN_HEIGHT * 0.45,
  },
  {
    id: 'b-3',
    authorName: 'Kai Tanaka',
    auraScore: 310,
    emotion: 'anxiety',
    secondaryEmotion: 'Restless',
    intensity: 8,
    content: 'Big interview tomorrow morning. Heart is racing a bit, but grounding myself through breath.',
    locationCity: 'Mission District',
    weatherCondition: 'Breezy Fog',
    weatherTemp: 15,
    timestamp: '4m ago',
    likesCount: 19,
    commentsCount: 9,
    latitude: 37.7649,
    longitude: -122.4294,
    canvasX: SCREEN_WIDTH * 0.2,
    canvasY: SCREEN_HEIGHT * 0.62,
  },
  {
    id: 'b-4',
    authorName: 'Sarah Lin',
    auraScore: 540,
    emotion: 'love',
    secondaryEmotion: 'Affectionate',
    intensity: 10,
    content: 'Reunited with my childhood friend after four years apart. Love knows no distance.',
    locationCity: 'Berkeley',
    weatherCondition: 'Warm Sunset',
    weatherTemp: 22,
    timestamp: '1h ago',
    likesCount: 72,
    commentsCount: 18,
    latitude: 37.7949,
    longitude: -122.4394,
    canvasX: SCREEN_WIDTH * 0.62,
    canvasY: SCREEN_HEIGHT * 0.22,
  },
  {
    id: 'b-5',
    authorName: 'Ghost Echo',
    auraScore: 190,
    emotion: 'sadness',
    secondaryEmotion: 'Pensive',
    intensity: 6,
    content: 'Some days feel heavier than others. Letting myself feel it without judgment.',
    locationCity: 'Pacific Heights',
    weatherCondition: 'Drizzle',
    weatherTemp: 14,
    timestamp: '32m ago',
    likesCount: 31,
    commentsCount: 11,
    isAnonymous: true,
    latitude: 37.7889,
    longitude: -122.4334,
    canvasX: SCREEN_WIDTH * 0.78,
    canvasY: SCREEN_HEIGHT * 0.68,
  },
];

const INITIAL_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const mapRef = useRef<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeBubble, setActiveBubble] = useState<DisplayBubble | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
                LAT: 37.7749° N • LNG: 122.4194° W • RESONANCE GRID
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
