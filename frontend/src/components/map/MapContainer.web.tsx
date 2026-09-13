import React, { forwardRef } from 'react';
import { View } from 'react-native';

export const PROVIDER_DEFAULT = 'default';

export const Marker: React.FC<any> = ({ children, style }) => {
  return <View style={style}>{children}</View>;
};

export type MapViewType = any;

export const MapContainer = forwardRef<any, any>((props, ref) => {
  return <View ref={ref} {...props} />;
});

export default MapContainer;
