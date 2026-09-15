import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/theme';
import { GlowOrb } from './GlowOrb';
import { ParticleCanvas } from './ParticleCanvas';
import { AuroraBackground } from './AuroraBackground';

export interface NoiseBackgroundProps {
  children?: React.ReactNode;
  showOrbs?: boolean;
  showParticles?: boolean;
  primaryOrbColor?: string;
  secondaryOrbColor?: string;
  emotion?: string;
  reducedMotion?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const NoiseBackground: React.FC<NoiseBackgroundProps> = ({
  children,
  showOrbs = true,
  showParticles = false,
  primaryOrbColor = theme.colors.primary,
  secondaryOrbColor = theme.colors.accent,
  emotion,
  reducedMotion = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <AuroraBackground emotion={emotion} reducedMotion={reducedMotion} />
      
      {showOrbs && !reducedMotion && (
        <>
          <GlowOrb
            color={primaryOrbColor}
            size={340}
            duration={4500}
            wandering={true}
            style={styles.topOrb}
          />
          <GlowOrb
            color={secondaryOrbColor}
            size={280}
            duration={5200}
            wandering={true}
            style={styles.bottomOrb}
          />
        </>
      )}

      {showParticles && !reducedMotion && <ParticleCanvas count={16} />}

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 14, 21, 0.4)',
  },
});
