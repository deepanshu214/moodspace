import React, { forwardRef } from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

export { Marker, PROVIDER_DEFAULT };
export type MapViewType = MapView;

export const MapContainer = forwardRef<MapView, any>((props, ref) => {
  return <MapView ref={ref} {...props} />;
});

export default MapContainer;
