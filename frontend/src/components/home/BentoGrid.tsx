import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { staggerDelay } from '@/theme';

interface BentoGridProps {
  /** Number of columns (default 2) */
  columns?: number;
  /** Gap between items in px */
  gap?: number;
  /** Array of items to render */
  children: React.ReactNode[];
  /** Optional container style */
  style?: StyleProp<ViewStyle>;
  /** Enable staggered entry animation */
  animated?: boolean;
  /** Base delay between items in ms */
  staggerMs?: number;
}

/**
 * BentoGrid — masonry-style grid layout with staggered entry animations
 *
 * Distributes children into columns, shortest-column-first for masonry effect.
 * Each item enters with a FadeInDown animation staggered by index.
 */
export const BentoGrid: React.FC<BentoGridProps> = ({
  columns = 2,
  gap = 12,
  children,
  style,
  animated = true,
  staggerMs = 60,
}) => {
  // Distribute children into column arrays (simple alternating for now)
  const columnArrays: React.ReactNode[][] = Array.from({ length: columns }, () => []);

  React.Children.forEach(children, (child, index) => {
    const col = index % columns;
    const wrappedChild = animated ? (
      <Animated.View
        key={`bento-${index}`}
        entering={FadeInDown.delay(staggerDelay(index, staggerMs))
          .springify()
          .damping(18)
          .stiffness(140)}
        style={{ marginBottom: gap }}
      >
        {child}
      </Animated.View>
    ) : (
      <View key={`bento-${index}`} style={{ marginBottom: gap }}>
        {child}
      </View>
    );
    columnArrays[col].push(wrappedChild);
  });

  return (
    <View style={[styles.container, { gap }, style]}>
      {columnArrays.map((colItems, colIndex) => (
        <View key={`col-${colIndex}`} style={styles.column}>
          {colItems}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
  },
  column: {
    flex: 1,
  },
});
