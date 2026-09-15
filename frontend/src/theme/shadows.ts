import { ViewStyle, Platform } from 'react-native';

/**
 * MoodSpace Shadow System
 * Glass-optimized shadows with glow effects for the Liquid Aurora theme
 */

type ShadowStyle = Pick<ViewStyle, 'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'>;

export const shadows = {
  /** Subtle card shadow for glass surfaces */
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  } as ShadowStyle,

  /** Medium elevation for floating elements */
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  } as ShadowStyle,

  /** Strong elevation for modals and sheets */
  heavy: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 16,
  } as ShadowStyle,

  /** Backwards-compatible aliases */
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  } as ShadowStyle,

  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  } as ShadowStyle,

  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  } as ShadowStyle,

  /**
   * Colored glow shadow for glassmorphic elements
   * Simulates the neon border glow effect
   */
  glow: (color: string, intensity: number = 0.4): ShadowStyle => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 16,
    elevation: 6,
  }),

  /**
   * Subtle glass border highlight — top-edge light reflection
   * Use as an overlay style on glass cards for realism
   */
  glassGlow: (color: string, intensity: number = 0.3): ShadowStyle => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: intensity,
    shadowRadius: 12,
    elevation: 4,
  }),

  /**
   * Inner light effect — simulates light hitting the top edge of a glass surface
   * Returns a borderTopColor style instead of shadow (RN doesn't support inset shadows)
   */
  innerLight: (color: string = 'rgba(255,255,255,0.08)') => ({
    borderTopWidth: 1,
    borderTopColor: color,
  }),

  /**
   * Neon pulse glow for active/selected states
   * Higher intensity and larger radius than standard glow
   */
  neonPulse: (color: string): ShadowStyle => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 8,
  }),

  /**
   * Thin neon edge for glassmorphic card borders
   */
  neonEdge: (color: string): ShadowStyle => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  }),
};
