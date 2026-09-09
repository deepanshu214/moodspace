/**
 * Custom Obsidian Night Map Style for MoodSpace
 * Designed to minimize visual distraction and let emotional bubbles shine like constellations.
 */
export const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#0B0D15' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666C8A' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0B0D15' }, { weight: 2 }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#1E2235' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2C314C' }],
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#A5ABC7' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#161926' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#555A78' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#1C2033' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#232840' }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#2D3352' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#444866' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#101424' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3E4B72' }],
  },
];
