import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/theme/haptics';

export interface LocationData {
  cityName: string;
  latitude: number;
  longitude: number;
}

export interface LocationPickerModalProps {
  visible: boolean;
  currentLocationName: string;
  onSelectLocation: (data: LocationData) => void;
  onClose: () => void;
}

const GLOBAL_PRESETS: LocationData[] = [
  { cityName: 'New Delhi, India', latitude: 28.6139, longitude: 77.209 },
  { cityName: 'Mumbai, India', latitude: 19.076, longitude: 72.8777 },
  { cityName: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503 },
  { cityName: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { cityName: 'New York, USA', latitude: 40.7128, longitude: -74.006 },
  { cityName: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
  { cityName: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
  { cityName: 'Toronto, Canada', latitude: 43.6532, longitude: -79.3832 },
  { cityName: 'Berlin, Germany', latitude: 52.52, longitude: 13.405 },
  { cityName: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { cityName: 'San Francisco, USA', latitude: 37.7749, longitude: -122.4194 },
];

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  currentLocationName,
  onSelectLocation,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  if (!visible) return null;

  const handleDetectGPS = async () => {
    haptics.medium();
    setIsDetecting(true);
    setDetectError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDetectError('Location permission denied. Please choose a city below.');
        setIsDetecting(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      let name = 'Current Location';
      if (geocode.length > 0) {
        const g = geocode[0];
        const parts = [g.city || g.subregion || g.district, g.region || g.country].filter(Boolean);
        name = parts.join(', ') || 'My Location';
      }

      haptics.success();
      onSelectLocation({
        cityName: name,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      onClose();
    } catch (err: any) {
      setDetectError('Could not detect location. Please select a city below.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectPreset = (preset: LocationData) => {
    haptics.selection();
    onSelectLocation(preset);
    onClose();
  };

  const handleCustomSubmit = () => {
    if (!searchQuery.trim()) return;
    haptics.selection();
    // Default coordinates with slight offset based on string hash for deterministic location
    onSelectLocation({
      cityName: searchQuery.trim(),
      latitude: 20.0 + (searchQuery.length % 30),
      longitude: 70.0 + (searchQuery.length % 60),
    });
    onClose();
  };

  const filteredPresets = GLOBAL_PRESETS.filter((p) =>
    p.cityName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Sheet Header */}
          <View style={styles.header}>
            <View>
              <Typography variant="h3" weight="bold">
                Choose Location 🌍
              </Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                Post your mood from anywhere in the world
              </Typography>
            </View>

            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Current GPS Button */}
          <TouchableOpacity
            style={styles.gpsBtn}
            activeOpacity={0.8}
            onPress={handleDetectGPS}
            disabled={isDetecting}
          >
            {isDetecting ? (
              <ActivityIndicator color={theme.colors.primaryLight} size="small" />
            ) : (
              <Ionicons name="navigate-circle" size={22} color={theme.colors.primaryLight} />
            )}
            <View style={styles.gpsInfo}>
              <Typography variant="body" weight="semibold" color={theme.colors.textPrimary}>
                {isDetecting ? 'Detecting your GPS location…' : 'Use My Current Device Location'}
              </Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Auto-detects your city and coordinates
              </Typography>
            </View>
          </TouchableOpacity>

          {detectError && (
            <Typography variant="caption" color={theme.colors.error} style={styles.errorText}>
              {detectError}
            </Typography>
          )}

          {/* Search or Type City */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search or enter any city..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleCustomSubmit}
              returnKeyType="done"
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity onPress={handleCustomSubmit} style={styles.useCustomBtn}>
                <Typography variant="caption" weight="bold" color={theme.colors.primaryLight}>
                  Use "{searchQuery}"
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          {/* City Presets */}
          <Typography variant="label" color={theme.colors.textMuted} style={styles.sectionLabel}>
            Popular Cities Worldwide
          </Typography>

          <ScrollView style={styles.presetList} showsVerticalScrollIndicator={false}>
            {filteredPresets.map((preset) => {
              const isSelected = preset.cityName === currentLocationName;
              return (
                <TouchableOpacity
                  key={preset.cityName}
                  style={[styles.presetRow, isSelected && styles.presetRowActive]}
                  onPress={() => handleSelectPreset(preset)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={isSelected ? theme.colors.primaryLight : theme.colors.textMuted}
                  />
                  <Typography
                    variant="body"
                    weight={isSelected ? 'bold' : 'regular'}
                    color={isSelected ? theme.colors.primaryLight : theme.colors.textPrimary}
                    style={styles.presetText}
                  >
                    {preset.cityName}
                  </Typography>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={theme.colors.primaryLight} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 15, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(18, 20, 32, 0.94)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: theme.spacing.xl,
    maxHeight: '80%',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.35)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: 12,
  },
  gpsInfo: {
    flex: 1,
  },
  errorText: {
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 46,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  useCustomBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  presetList: {
    maxHeight: 240,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  presetRowActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderRadius: theme.radius.sm,
  },
  presetText: {
    flex: 1,
  },
});
