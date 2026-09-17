/**
 * MoodSpace Animation System
 * React-spring-inspired physics presets translated to Reanimated WithSpringConfig
 */

import { WithSpringConfig } from 'react-native-reanimated';

// ─── Spring Presets (react-spring philosophy, Reanimated execution) ───

export const springs = {
  /** Default comfortable spring */
  default: { damping: 15, stiffness: 150, mass: 1 } as WithSpringConfig,

  /** Playful overshoot — notifications, badges, emotion bubbles */
  bouncy: { damping: 8, stiffness: 180, mass: 0.8 } as WithSpringConfig,
  
  /** Same as bouncy — react-spring "wobbly" equivalent */
  wobbly: { damping: 8, stiffness: 180, mass: 0.8 } as WithSpringConfig,

  /** Critically damped — snappy button taps, tab switches */
  snappy: { damping: 20, stiffness: 300, mass: 0.6 } as WithSpringConfig,

  /** Same as snappy — react-spring "stiff" equivalent */
  stiff: { damping: 20, stiffness: 300, mass: 0.6 } as WithSpringConfig,

  /** Heavy, slow — modals, bottom sheets, page transitions */
  slow: { damping: 26, stiffness: 120, mass: 1.4 } as WithSpringConfig,

  /** Same as slow — react-spring "molasses" equivalent */
  molasses: { damping: 26, stiffness: 120, mass: 1.4 } as WithSpringConfig,

  /** Gentle ambient float — background elements, decorative motion */
  gentle: { damping: 12, stiffness: 60, mass: 1.2 } as WithSpringConfig,

  /** Shared element morphing transitions */
  morph: { damping: 18, stiffness: 200, mass: 1.0 } as WithSpringConfig,
};

// ─── Timing Constants ───

export const timing = {
  instant: 100,
  quick: 200,
  standard: 350,
  relaxed: 500,
  breathe: 2000,
  drift: 4000,
  /** Aurora blob cycle durations */
  auroraSlow: 12000,
  auroraMedium: 8000,
  auroraFast: 4000,
};

// ─── Easing Curves ───

export const easings = {
  breathe: [0.4, 0, 0.6, 1] as [number, number, number, number],
  anticipate: [0.38, 0.005, 0.215, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

// ─── Stagger Utility ───

/**
 * Returns a delay value for staggered entry animations
 * Usage: FadeInDown.delay(staggerDelay(index))
 */
export const staggerDelay = (index: number, baseMs: number = 60): number => {
  return index * baseMs;
};

/**
 * Returns an array of delay values for N children
 */
export const staggerChildren = (count: number, baseMs: number = 60): number[] => {
  return Array.from({ length: count }, (_, i) => i * baseMs);
};

// ─── Float Loop Config ───

/** Perpetual y-oscillation config for ambient floating elements */
export const floatConfig = {
  amplitude: 6,
  duration: 3000,
};
