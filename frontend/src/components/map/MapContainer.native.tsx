import React, { forwardRef } from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

export { Marker, PROVIDER_DEFAULT };
export type MapViewType = MapView;

export const MapContainer = forwardRef<MapView, any>((props, ref) => {
  return (
    <MapView
      ref={ref}
      loadingEnabled
      loadingIndicatorColor="#6C5CE7"
      loadingBackgroundColor="#0F1019"
      rotateEnabled={false}
      pitchEnabled={false}
      {...props}
    />
  );
});

export default MapContainer;
