import { Easing } from 'react-native-reanimated';

/**
 * MoodSpace Animation & Motion Physics Tokens
 * Crafted for organic, breathing, warm physical interactions
 */

export const timing = {
  instant: 100,
  quick: 200,     // micro-feedback, press state
  standard: 350,  // navigation transitions, card enters
  relaxed: 500,   // hero entrance, sheets
  appear: 600,    // modal bloom, onboarding
  breathe: 2000,  // ambient breathing loop
  drift: 4000,    // slow particle drift
};

export const springs = {
  // Standard everyday interface elements
  default: {
    damping: 18,
    stiffness: 120,
    mass: 0.8,
  },
  // Bouncy: Emotion bubbles, milestone badges, sparkles
  bouncy: {
    damping: 12,
    stiffness: 150,
    mass: 0.6,
  },
  // Slow: Heavy dialogs, sanctuary gates, sheets
  slow: {
    damping: 25,
    stiffness: 80,
    mass: 1.0,
  },
  // Snappy: Button click bounce, tab toggle
  snappy: {
    damping: 20,
    stiffness: 200,
    mass: 0.5,
  },
  // Gentle: Ambient floating, atmospheric levitation
  gentle: {
    damping: 30,
    stiffness: 60,
    mass: 1.2,
  },
};

export const easings = {
  easeOut: Easing.bezier(0.25, 0.1, 0.25, 1),
  easeInOut: Easing.bezier(0.42, 0, 0.58, 1),
  breathe: Easing.bezier(0.4, 0, 0.6, 1),
  anticipate: Easing.bezier(0.36, 0, 0.66, -0.56),
};
