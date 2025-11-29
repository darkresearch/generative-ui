/**
 * Skeleton Primitives
 * 
 * Animated placeholder components for streaming UI.
 * Used by component skeletons to show loading states.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';

// ============================================================================
// Types
// ============================================================================

export interface SkeletonProps {
  /** Width of the skeleton (number for pixels, percentage string like '80%') */
  width?: number | `${number}%`;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Additional styles */
  style?: ViewStyle;
}

export interface SkeletonTextProps extends Omit<SkeletonProps, 'height' | 'borderRadius'> {
  /** Number of lines to render */
  lines?: number;
  /** Line height */
  lineHeight?: number;
  /** Gap between lines */
  gap?: number;
}

// ============================================================================
// Constants
// ============================================================================

const SHIMMER_DURATION = 1200;
const DEFAULT_COLORS = {
  base: 'rgba(255, 255, 255, 0.08)',
  highlight: 'rgba(255, 255, 255, 0.15)',
};

// ============================================================================
// Base Skeleton Component
// ============================================================================

/**
 * Base skeleton with shimmer animation.
 * Use this for custom shapes or use the specialized variants below.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: SHIMMER_DURATION,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: SHIMMER_DURATION,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ============================================================================
// Specialized Variants
// ============================================================================

/**
 * Text skeleton - single or multi-line text placeholder.
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  width = '100%',
  lines = 1,
  lineHeight = 14,
  gap = 8,
  style,
}) => {
  if (lines === 1) {
    return <Skeleton width={width} height={lineHeight} borderRadius={4} style={style} />;
  }

  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => {
        // Last line is typically shorter
        const lineWidth = index === lines - 1 ? '70%' : width;
        return (
          <Skeleton
            key={index}
            width={lineWidth}
            height={lineHeight}
            borderRadius={4}
            style={index < lines - 1 ? { marginBottom: gap } : undefined}
          />
        );
      })}
    </View>
  );
};

/**
 * Rectangle skeleton - for images, cards, or block content.
 */
export const SkeletonRect: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 100,
  borderRadius = 8,
  style,
}) => {
  return <Skeleton width={width} height={height} borderRadius={borderRadius} style={style} />;
};

/**
 * Circle skeleton - for avatars or icons.
 */
export const SkeletonCircle: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 40,
  style,
}) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
};

/**
 * Number skeleton - short placeholder for numeric values.
 */
export const SkeletonNumber: React.FC<{ width?: number; style?: ViewStyle }> = ({
  width = 40,
  style,
}) => {
  return <Skeleton width={width} height={16} borderRadius={4} style={style} />;
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: DEFAULT_COLORS.base,
  },
  textContainer: {
    flexDirection: 'column',
  },
});

// ============================================================================
// Exports
// ============================================================================

export default Skeleton;

