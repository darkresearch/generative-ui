/**
 * Grid Layout Component
 * 
 * Simple grid layout for arranging items.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Skeleton } from '../Skeleton';

export interface GridProps {
  /** Number of columns */
  columns?: number;
  /** Gap between items */
  gap?: number;
  /** Padding */
  padding?: number;
  /** Additional styles */
  style?: ViewStyle;
  /** Children */
  children?: React.ReactNode;
  /** Streaming flag (passed by ComponentBlock) */
  _isStreaming?: boolean;
}

/**
 * Grid - Simple grid layout.
 * Uses flexbox with wrap to create a grid effect.
 */
export const Grid: React.FC<GridProps> = ({
  columns = 2,
  gap = 8,
  padding,
  style,
  children,
}) => {
  // Calculate item width based on columns (accounting for gaps)
  const itemWidth = `${100 / columns}%` as const;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap,
          padding,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child) =>
        child ? (
          <View style={{ width: itemWidth, maxWidth: itemWidth }}>
            {child}
          </View>
        ) : null
      )}
    </View>
  );
};

/**
 * GridSkeleton - Skeleton version with placeholder items.
 */
export const GridSkeleton: React.FC<Partial<GridProps>> = ({
  columns = 2,
  gap = 8,
  padding,
  style,
  children,
}) => {
  const itemWidth = `${100 / columns}%` as const;
  const placeholderCount = columns * 2; // Show 2 rows of placeholders

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap,
          padding,
        },
        style,
      ]}
    >
      {children ||
        Array.from({ length: placeholderCount }).map((_, index) => (
          <View key={index} style={{ width: itemWidth, maxWidth: itemWidth }}>
            <Skeleton height={80} />
          </View>
        ))}
    </View>
  );
};

export default Grid;

