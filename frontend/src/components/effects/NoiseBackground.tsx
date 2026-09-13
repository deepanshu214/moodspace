import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/theme';
import { GlowOrb } from './GlowOrb';
import { ParticleCanvas } from './ParticleCanvas';

export interface NoiseBackgroundProps {
  children?: React.ReactNode;
  showOrbs?: boolean;
  showParticles?: boolean;
  primaryOrbColor?: string;
  secondaryOrbColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const NoiseBackground: React.FC<NoiseBackgroundProps> = ({
  children,
  showOrbs = true,
  showParticles = false,
  primaryOrbColor = theme.colors.primary,
  secondaryOrbColor = theme.colors.accent,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {showOrbs && (
        <>
          <GlowOrb
            color={primaryOrbColor}
            size={340}
            duration={4500}
            style={styles.topOrb}
          />
          <GlowOrb
            color={secondaryOrbColor}
            size={280}
            duration={5200}
            style={styles.bottomOrb}
          />
        </>
      )}

      {showParticles && <ParticleCanvas count={16} />}

      {/* Subtle overlay layer for depth */}
      <View style={styles.overlay} pointerEvents="none" />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  },
  topOrb: {
    top: -80,
    right: -60,
  },
  bottomOrb: {
    bottom: -80,
    left: -60,
  },
  overlay: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: 'rgba(13, 14, 21, 0.4)',
  },
});
