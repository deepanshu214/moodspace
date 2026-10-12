/**
 * Free basemaps — no API key, no billing account, no sign-up.
 *
 * CARTO serves OpenStreetMap-derived basemaps from a public CDN. "Positron"
 * and "Dark Matter" are deliberately desaturated, which is what we want: the
 * mood bubbles carry all the colour on this map, so the ground underneath has
 * to stay quiet.
 *
 * The OSM licence requires the attribution to stay visible wherever these are
 * drawn — see <MapAttribution/>.
 */

/** Vector styles for MapLibre GL (web). */
export const FREE_VECTOR_STYLE = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
} as const;

/** Raster tiles, for anything that can only take an {z}/{x}/{y} template. */
export const FREE_RASTER_TILE = {
  light: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  dark: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
} as const;

export const BASEMAP_ATTRIBUTION = '© OpenStreetMap  © CARTO';

export const pickBasemap = (isDark: boolean) =>
  isDark ? FREE_VECTOR_STYLE.dark : FREE_VECTOR_STYLE.light;

export const pickRasterTile = (isDark: boolean) =>
  isDark ? FREE_RASTER_TILE.dark : FREE_RASTER_TILE.light;

/**
 * react-native-maps describes a viewport as a centre plus a span in degrees;
 * MapLibre uses a centre plus a zoom level. These convert between the two so
 * both platforms can be driven from the same region objects.
 */
export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const regionToZoom = (longitudeDelta: number): number => {
  const span = Math.min(360, Math.max(0.0001, longitudeDelta));
  return Math.log2(360 / span);
};

export const zoomToDelta = (zoom: number): number => 360 / Math.pow(2, zoom);
