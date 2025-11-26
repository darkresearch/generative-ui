/**
 * FieldSkeleton - Individual field skeleton loader
 * 
 * Small inline skeleton for missing fields during progressive rendering
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { ThemeConfig } from '../core/types';

export interface FieldSkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  theme: ThemeConfig;
  style?: any;
}

export const FieldSkeleton: React.FC<FieldSkeletonProps> = ({
  width = 60,
  height = 16,
  borderRadius = 4,
  theme,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create pulsing animation
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  // Interpolate opacity for pulse effect
  const opacity = pulseAnim.interpolate({
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
          backgroundColor: theme.colors.skeletonBase,
          opacity,
        },
        style,
      ]}
    >
      {/* Shimmer effect overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: theme.colors.skeletonHighlight,
            borderRadius,
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});

