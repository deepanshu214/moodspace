/**
 * Cinematic Screen Transition Configurations
 * iOS 26 / Liquid Aurora style
 */

export const transitions = {
  /**
   * Fade and Slide Up: Perfect for modals and detail sheets
   */
  fadeSlideUp: {
    gestureDirection: 'vertical' as const,
    transitionSpec: {
      open: {
        animation: 'spring' as const,
        config: {
          damping: 24,
          mass: 1.2,
          stiffness: 140,
        },
      },
      close: {
        animation: 'spring' as const,
        config: {
          damping: 24,
          mass: 1.0,
          stiffness: 180,
        },
      },
    },
    cardStyleInterpolator: ({ current, layouts }: any) => ({
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height * 0.15, 0],
            }),
          },
        ],
      },
    }),
  },

  /**
   * Morph Scale: Screens scale 0.94 -> 1.0 with fade for stack push
   */
  morphScale: {
    transitionSpec: {
      open: {
        animation: 'spring' as const,
        config: {
          damping: 20,
          mass: 0.9,
          stiffness: 220,
        },
      },
      close: {
        animation: 'spring' as const,
        config: {
          damping: 20,
          mass: 0.9,
          stiffness: 220,
        },
      },
    },
    cardStyleInterpolator: ({ current }: any) => ({
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.94, 1],
            }),
          },
        ],
      },
    }),
  },
};
