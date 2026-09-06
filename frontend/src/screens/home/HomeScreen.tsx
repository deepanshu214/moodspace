import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { HomeStackParamList, MainTabParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { MoodBubble } from '@/components/mood/MoodBubble';
import { FloatingActionButton } from '@/components/mood/FloatingActionButton';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

const mockBubbles = [
  {
    id: 'b-1',
    author: 'Elena',
    emotion: 'calm',
    intensity: 7,
    lat: 37.7749,
    lng: -122.4194,
    x: 120,
    y: 180,
  },
  {
    id: 'b-2',
    author: 'Marcus',
    emotion: 'joy',
    intensity: 9,
    lat: 37.7849,
    lng: -122.4094,
    x: 240,
    y: 280,
  },
  {
    id: 'b-3',
    author: 'Kai',
    emotion: 'anxiety',
    intensity: 8,
    lat: 37.7649,
    lng: -122.4294,
    x: 70,
    y: 380,
  },
  {
    id: 'b-4',
    author: 'Sarah',
    emotion: 'love',
    intensity: 10,
    lat: 37.7949,
    lng: -122.4394,
    x: 210,
    y: 460,
  },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleBubblePress = (bubble: (typeof mockBubbles)[0]) => {
    navigation.navigate('BubbleDetails', {
      bubbleId: bubble.id,
      emotion: bubble.emotion,
      authorName: bubble.author,
    });
  };

  return (
    <ScreenWrapper style={styles.container}>
      {/* Top Atmosphere Info Bar */}
      <View style={styles.topInfoBar}>
        <View style={styles.atmospherePill}>
          <Typography variant="bodySmall">🌊</Typography>
          <Typography variant="caption" weight="bold" color={theme.colors.accent} style={styles.pillText}>
            Global Pulse: Calm & Reflective
          </Typography>
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          activeOpacity={0.75}
          onPress={() => setActiveFilter(activeFilter ? null : 'joy')}
        >
          <Ionicons name="options-outline" size={18} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Map View or Simulated Atmospheric Canvas */}
      <View style={styles.mapCanvas}>
        {Platform.OS !== 'web' ? (
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: 37.7749,
              longitude: -122.4194,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }}
            userInterfaceStyle="dark"
          >
            {mockBubbles.map((bubble) => (
              <Marker
                key={bubble.id}
                coordinate={{ latitude: bubble.lat, longitude: bubble.lng }}
                onPress={() => handleBubblePress(bubble)}
              >
                <MoodBubble
                  emotion={bubble.emotion}
                  intensity={bubble.intensity}
                  authorName={bubble.author}
                  size="sm"
                  isFloating
                />
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.webFallbackCanvas}>
            <View style={styles.gridBackground}>
              {mockBubbles.map((bubble) => (
                <View
                  key={bubble.id}
                  style={[styles.simulatedMarker, { left: bubble.x, top: bubble.y }]}
                >
                  <MoodBubble
                    emotion={bubble.emotion}
                    intensity={bubble.intensity}
                    authorName={bubble.author}
                    size="md"
                    onPress={() => handleBubblePress(bubble)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

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
    backgroundColor: theme.colors.background,
  },
  topInfoBar: {
    position: 'absolute',
    top: 56,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  atmospherePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceGlass,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  pillText: {
    marginLeft: 6,
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surfaceGlass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
  },
  webFallbackCanvas: {
    flex: 1,
    backgroundColor: '#0D0E15',
    position: 'relative',
  },
  gridBackground: {
    flex: 1,
    position: 'relative',
  },
  simulatedMarker: {
    position: 'absolute',
  },
});
