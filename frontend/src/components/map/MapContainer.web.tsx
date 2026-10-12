import React, {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import maplibregl from 'maplibre-gl';

import { pickBasemap, regionToZoom, zoomToDelta, Region } from './freeTiles';

/**
 * Pinned to maplibre-gl 5.x deliberately.
 *
 * GHSA-jrc7-96c5-q579 (XSS sanitizer bypass in `DOM.sanitize()`) covers
 * everything <= 6.4.0 and is fixed in 6.14.0, but 6.x loads its worker as a
 * module URL that Metro does not serve, so the map renders blank on web.
 *
 * The vulnerable path is unreachable as this component uses the library:
 * `DOM.sanitize()` only runs on popup and attribution HTML. We render no
 * popups (markers are React Native views), pass `attributionControl: false`
 * and draw our own credit, and the style URL is a fixed constant rather than
 * anything a user supplies.
 *
 * Re-evaluate before adding a MapLibre popup, enabling the built-in
 * attribution control, or sourcing a style URL from user input.
 */

export const PROVIDER_DEFAULT = 'default';
export const PROVIDER_GOOGLE = 'google';
export type MapViewType = any;

/**
 * MapLibre ships ~30KB of CSS for controls and popups we don't use — we draw
 * our own zoom buttons and attribution. These are the only rules the canvas
 * itself needs, so we inject them instead of taking a bundler CSS dependency.
 */
const CSS_ID = 'moodspace-maplibre-css';
const ensureCss = () => {
  if (typeof document === 'undefined' || document.getElementById(CSS_ID)) return;
  const el = document.createElement('style');
  el.id = CSS_ID;
  el.textContent = `
.maplibregl-map{position:relative;overflow:hidden;width:100%;height:100%;}
.maplibregl-canvas-container,.maplibregl-canvas{position:absolute;top:0;left:0;width:100%;height:100%;}
.maplibregl-canvas-container canvas{outline:none;}
.maplibregl-ctrl-attrib,.maplibregl-ctrl-logo{display:none !important;}
`;
  document.head.appendChild(el);
};

interface Projection {
  project: (lat: number, lng: number) => { x: number; y: number } | null;
  version: number;
}

const ProjectionContext = createContext<Projection | null>(null);

/**
 * Marker — positions its children over the map at a lat/lng.
 *
 * react-native-maps anchors a marker on its centre. We can't know the child's
 * size up front, so we measure it once and shift by half; until that lands the
 * marker stays transparent rather than visibly jumping into place.
 */
export const Marker: React.FC<any> = ({ coordinate, children, onPress, style }) => {
  const projection = useContext(ProjectionContext);
  const [size, setSize] = useState({ w: 0, h: 0 });

  if (!projection || !coordinate) return null;
  const point = projection.project(coordinate.latitude, coordinate.longitude);
  if (!point) return null;

  return (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.w || height !== size.h) setSize({ w: width, h: height });
      }}
      style={[
        styles.marker,
        {
          left: point.x - size.w / 2,
          top: point.y - size.h / 2,
          opacity: size.w > 0 ? 1 : 0,
        },
        style,
      ]}
    >
      <Pressable onPress={onPress} accessibilityRole={onPress ? 'button' : undefined}>
        {children}
      </Pressable>
    </View>
  );
};

export interface MapContainerProps {
  style?: any;
  initialRegion?: Region;
  /** Switches the basemap between Positron and Dark Matter. */
  isDark?: boolean;
  onRegionChangeComplete?: (region: Region) => void;
  /** Called when WebGL is unavailable, so the caller can fall back. */
  onUnsupported?: () => void;
  children?: React.ReactNode;
  /** Native-only props (customMapStyle, showsUserLocation, …) are ignored here. */
  [key: string]: any;
}

const DEFAULT_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 120,
  longitudeDelta: 240,
};

/**
 * MapContainer (web) — a real, pannable MapLibre GL map on free CARTO
 * basemaps. No API key and no billing account, unlike the Google Maps the
 * native side used to insist on.
 *
 * Markers stay React Native views layered over the canvas rather than DOM
 * markers, so the same <LuminousMoodBubble/> renders on web and on native.
 */
export const MapContainer = forwardRef<any, MapContainerProps>((props, ref) => {
  const { style, initialRegion, isDark = false, onRegionChangeComplete, onUnsupported, children } = props;

  const hostRef = useRef<any>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  // Read through refs inside the map's event handlers: the map is built once,
  // and we don't want a changed callback identity to tear it down.
  const regionCbRef = useRef(onRegionChangeComplete);
  regionCbRef.current = onRegionChangeComplete;
  const unsupportedCbRef = useRef(onUnsupported);
  unsupportedCbRef.current = onUnsupported;

  useEffect(() => {
    ensureCss();
    const host = hostRef.current as HTMLElement | null;
    if (!host || mapRef.current) return;

    const start = initialRegion ?? DEFAULT_REGION;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: host,
        style: pickBasemap(isDark),
        center: [start.longitude, start.latitude],
        zoom: regionToZoom(start.longitudeDelta),
        attributionControl: false,
        // The bubbles are the subject; a tilted or spun map just makes them
        // harder to compare at a glance.
        pitchWithRotate: false,
        dragRotate: false,
        touchZoomRotate: true,
      });
    } catch {
      unsupportedCbRef.current?.();
      return;
    }

    map.touchZoomRotate?.disableRotation();
    mapRef.current = map;

    const bump = () => setVersion((v) => v + 1);
    const emitRegion = () => {
      bump();
      const centre = map.getCenter();
      const lngDelta = zoomToDelta(map.getZoom());
      const height = map.getContainer().clientHeight || 1;
      const width = map.getContainer().clientWidth || 1;
      regionCbRef.current?.({
        latitude: centre.lat,
        longitude: centre.lng,
        longitudeDelta: lngDelta,
        latitudeDelta: lngDelta * (height / width),
      });
    };

    map.on('load', () => {
      setReady(true);
      bump();
    });
    map.on('move', bump);
    map.on('resize', bump);
    map.on('moveend', emitRegion);
    map.on('error', () => {
      /* A failed tile shouldn't blank the atlas — MapLibre retries on its own. */
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // Built once. Theme changes go through setStyle below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current && ready) mapRef.current.setStyle(pickBasemap(isDark));
  }, [isDark, ready]);

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: Region, duration = 400) => {
      mapRef.current?.easeTo({
        center: [region.longitude, region.latitude],
        zoom: regionToZoom(region.longitudeDelta),
        duration,
      });
    },
    getMap: () => mapRef.current,
  }));

  const projection = useMemo<Projection>(
    () => ({
      version,
      project: (lat: number, lng: number) => {
        const map = mapRef.current;
        if (!map) return null;
        const { x, y } = map.project([lng, lat]);
        return { x, y };
      },
    }),
    [version]
  );

  return (
    <View style={style}>
      {/* RNW forwards this ref straight to the underlying div. */}
      <View ref={hostRef} style={StyleSheet.absoluteFill} />
      {ready && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <ProjectionContext.Provider value={projection}>{children}</ProjectionContext.Provider>
        </View>
      )}
    </View>
  );
});

MapContainer.displayName = 'MapContainer';

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
  },
});

export default MapContainer;
