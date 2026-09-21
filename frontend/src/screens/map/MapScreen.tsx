import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { PingDot } from '@/components/common/PingDot';
import { MoodGlyph, toMoodKey } from '@/components/mood/MoodGlyph';
import { LuminousMoodBubble } from '@/components/mood/LuminousMoodBubble';
import { BubbleDetailSheet } from '@/components/mood/BubbleDetailSheet';
import { MapContainer, Marker, PROVIDER_GOOGLE, WorldMoodCanvas } from '@/components/map';
import { darkMapStyle, lightMapStyle } from '@/theme/mapStyle';
import { getEmotionConfig, emotionInk, inkOnPastel } from '@/theme';
import { useTheme } from '@/context';
import { haptics } from '@/theme/haptics';
import { useAtmosphericPulse } from '@/hooks/useMap';
import { useNearbyBubbles } from '@/hooks/useMood';
import { getUserPostedBubbles, UserPostBubble } from '@/utils/userPosts';
import { DisplayBubble, toDisplayBubbles, mergeLocalBubbles, filterByEmotion } from '@/utils/bubbles';
import { DEFAULT_BUBBLES } from '@/screens/home/HomeScreen';

const ATLAS_REGION = {
  latitude: 28.6139,
  longitude: 77.209,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'joy', label: 'Joy' },
  { id: 'calm', label: 'Calm' },
  { id: 'love', label: 'Love' },
  { id: 'sadness', label: 'Reflective' },
  { id: 'anxiety', label: 'Heavy' },
];

/**
 * MapScreen — the Stitch "Atlas" tab: the living map at full height, with the
 * flow filter and the same detail sheet the feed uses.
 */
export const MapScreen: React.FC<any> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const mapRef = useRef<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [activeBubble, setActiveBubble] = useState<DisplayBubble | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [region, setRegion] = useState(ATLAS_REGION);
  const [webZoom, setWebZoom] = useState(1);
  const [myPosts, setMyPosts] = useState<UserPostBubble[]>([]);

  const { data: pulseData } = useAtmosphericPulse();
  const { data: nearbyApiBubbles } = useNearbyBubbles(ATLAS_REGION.latitude, ATLAS_REGION.longitude, 25);

  useFocusEffect(
    useCallback(() => {
      getUserPostedBubbles().then(setMyPosts);
    }, [])
  );

  const allBubbles = useMemo(() => {
    const base: DisplayBubble[] =
      nearbyApiBubbles && nearbyApiBubbles.length > 0
        ? toDisplayBubbles(nearbyApiBubbles, ATLAS_REGION.latitude, ATLAS_REGION.longitude)
        : DEFAULT_BUBBLES;
    return mergeLocalBubbles(base, myPosts);
  }, [nearbyApiBubbles, myPosts]);

  const bubbles = useMemo(() => filterByEmotion(allBubbles, selectedFilter), [allBubbles, selectedFilter]);

  const zoom = (zoomIn: boolean) => {
    haptics.selection();
    const factor = zoomIn ? 0.5 : 2;
    const next = {
      latitude: region.latitude,
      longitude: region.longitude,
      latitudeDelta: Math.max(0.01, Math.min(70, region.latitudeDelta * factor)),
      longitudeDelta: Math.max(0.01, Math.min(70, region.longitudeDelta * factor)),
    };
    setRegion(next);
    setWebZoom((z) => Math.min(4, Math.max(1, zoomIn ? z * 1.4 : z / 1.4)));
    mapRef.current?.animateToRegion?.(next, 300);
  };

  const recenter = () => {
    mapRef.current?.animateToRegion?.(ATLAS_REGION, 900);
    setWebZoom(1);
    haptics.light();
  };

  return (
    <ScreenWrapper backgroundColor={colors.background} style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Typography variant="h3" style={{ color: colors.textPrimary }}>
            Live Atlas
          </Typography>
          <View style={styles.liveRow}>
            <PingDot size={7} />
            <Typography variant="overline" style={{ color: colors.textMuted, marginLeft: 6 }}>
              {typeof pulseData?.active_bubbles_count === 'number'
                ? `${pulseData.active_bubbles_count.toLocaleString()} SHARING NOW`
                : 'SHARING NOW'}
            </Typography>
          </View>
        </View>
        <View style={[styles.freqBadge, { backgroundColor: colors.secondary, borderColor: colors.ink }]}>
          <Typography variant="overline" style={{ color: inkOnPastel }}>
            {webZoom.toFixed(1)}x
          </Typography>
        </View>
      </View>

      <View style={[styles.mapWrap, { borderColor: colors.ink }]}>
        {Platform.OS !== 'web' ? (
          <MapContainer
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={ATLAS_REGION}
            customMapStyle={isDark ? darkMapStyle : lightMapStyle}
            userInterfaceStyle={isDark ? 'dark' : 'light'}
            showsCompass={false}
            showsUserLocation
            onRegionChangeComplete={(r: any) => setRegion(r)}
          >
            {bubbles.map((bubble) => (
              <Marker
                key={bubble.id}
                coordinate={{ latitude: bubble.latitude, longitude: bubble.longitude }}
                onPress={() => {
                  setActiveBubble(bubble);
                  setIsDetailOpen(true);
                }}
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
            bubbles={bubbles}
            colors={colors}
            isDark={isDark}
            zoom={webZoom}
            onBubblePress={(bubble) => {
              setActiveBubble(bubble);
              setIsDetailOpen(true);
            }}
          />
        )}

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}
            onPress={() => zoom(true)}
            accessibilityLabel="Zoom in"
          >
            <Ionicons name="add" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}
            onPress={() => zoom(false)}
            accessibilityLabel="Zoom out"
          >
            <Ionicons name="remove" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.secondary, borderColor: colors.ink }]}
            onPress={recenter}
            accessibilityLabel="Recenter map"
          >
            <Ionicons name="locate" size={16} color={inkOnPastel} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((f) => {
            const isSelected = (!selectedFilter && f.id === 'all') || selectedFilter === f.id;
            const config = getEmotionConfig(f.id);
            const fill = f.id === 'all' ? colors.primary : config.primary;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => {
                  haptics.light();
                  setSelectedFilter(f.id === 'all' ? null : f.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Filter by ${f.label}`}
                style={[
                  styles.chip,
                  { backgroundColor: isSelected ? fill : colors.surface, borderColor: colors.ink },
                ]}
              >
                {f.id === 'all' ? (
                  <Ionicons
                    name="globe-outline"
                    size={14}
                    color={isSelected ? inkOnPastel : colors.textSecondary}
                  />
                ) : (
                  <MoodGlyph
                    mood={toMoodKey(f.id)}
                    size={14}
                    color={isSelected ? inkOnPastel : emotionInk(config, isDark)}
                  />
                )}
                <Typography
                  variant="label"
                  style={{ color: isSelected ? inkOnPastel : colors.textSecondary, marginLeft: 6 }}
                >
                  {f.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Tactile
          offset={2}
          radius={14}
          backgroundColor={colors.primary}
          contentStyle={styles.dropBtn}
          onPress={() => {
            haptics.medium();
            navigation.navigate('CreateBubbleModal');
          }}
          accessibilityLabel="Drop a mood bubble on the map"
        >
          <Ionicons name="add" size={18} color={inkOnPastel} />
          <Typography variant="button" style={{ color: inkOnPastel, marginLeft: 6 }}>
            Drop a Bubble Here
          </Typography>
        </Tactile>
      </View>

      <BubbleDetailSheet
        visible={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        bubble={activeBubble}
        onNavigateDetails={(id) => {
          if (activeBubble) {
            navigation.navigate('HomeTab', {
              screen: 'BubbleDetails',
              params: { bubbleId: id, emotion: activeBubble.emotion, authorName: activeBubble.authorName },
            });
          }
        }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  freqBadge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  mapWrap: {
    flex: 1,
    margin: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  controls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    alignItems: 'center',
  },
  controlBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingBottom: 130,
  },
  filterScroll: {
    paddingRight: 8,
    paddingBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    marginRight: 8,
  },
  dropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
});
