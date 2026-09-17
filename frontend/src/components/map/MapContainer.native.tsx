import React, { forwardRef } from 'react';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

export { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE };
export type MapViewType = MapView;

export const MapContainer = forwardRef<MapView, any>((props, ref) => {
  return (
    <MapView
      ref={ref}
      provider={PROVIDER_GOOGLE}
      loadingEnabled
      loadingIndicatorColor="#FF8A65"
      loadingBackgroundColor="#FAF7F2"
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      {...props}
    />
  );
});

export default MapContainer;
