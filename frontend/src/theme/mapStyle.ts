/**
 * Google Maps styling for MoodSpace — Playful Neo-Editorial.
 * lightMapStyle — newsprint land, sky-wash water, crisp ink labels, mint parks.
 * darkMapStyle — "Obsidian": charcoal land over deep twilight water.
 */
export const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1C1E24' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9EA3AE' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121316' }, { weight: 2.5 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#333842' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4A4F5A' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#F5F6F8' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#173A2C' }, { visibility: 'on' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2A2D35' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8A90A0' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2E323B' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3A2A26' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#FF5C38' }, { weight: 0.6 }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  // high-contrast twilight water
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#182038' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#60A5FA' }] },
];

export const lightMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#FCF9F8' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#52525B' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }, { weight: 2.5 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#E5E2E1' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#8F7069' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#1E1E1E' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#D9F5E6' }, { visibility: 'on' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#F6F3F2' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E5E2E1' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6B6B74' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FFF4DC' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#FFD15C' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D6ECFB' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0767DE' }] },
];
