import React, { forwardRef } from 'react';
import { Platform } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

import { pickRasterTile } from './freeTiles';

export { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE };
export type MapViewType = MapView;

export interface MapContainerProps {
  isDark?: boolean;
  /**
   * Draw CARTO's free OSM basemap instead of the platform's own. Android still
   * needs a Google Maps key to bring the MapView up at all, so this changes
   * how the map looks, not whether it costs anything.
   */
  useFreeTiles?: boolean;
  [key: string]: any;
}

/**
 * MapContainer (native).
 *
 * iOS runs on Apple Maps (PROVIDER_DEFAULT): no API key, no billing account,
 * and it follows the system light/dark appearance. Android has no such option
 * — react-native-maps can only render through Google there — so it keeps
 * PROVIDER_GOOGLE and the key from frontend/.env.
 */
export const MapContainer = forwardRef<MapView, MapContainerProps>(
  ({ isDark = false, useFreeTiles = false, children, ...props }, ref) => {
    const provider = Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

    return (
      <MapView
        ref={ref}
        provider={provider}
        // mapType="none" blanks the built-in basemap so the tile overlay is
        // the only thing drawn. Android-only in react-native-maps.
        mapType={useFreeTiles && Platform.OS === 'android' ? 'none' : 'standard'}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        loadingEnabled
        loadingIndicatorColor="#FF5C38"
        loadingBackgroundColor={isDark ? '#121316' : '#FFFDF9'}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        {...props}
      >
        {useFreeTiles && (
          <UrlTile urlTemplate={pickRasterTile(isDark)} maximumZ={19} zIndex={-1} />
        )}
        {children}
      </MapView>
    );
  }
);

MapContainer.displayName = 'MapContainer';

export default MapContainer;
