/**
 * Stack Layout Component
 * 
 * Flexible container for vertical or horizontal layouts.
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Skeleton } from '../Skeleton';

export interface StackProps {
  /** Layout direction */
  direction?: 'row' | 'column';
  /** Gap between children */
  gap?: number;
  /** Align items on cross axis */
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  /** Justify content on main axis */
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  /** Wrap children */
  wrap?: boolean;
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
 * Stack - Flexible layout container.
 */
export const Stack: React.FC<StackProps> = ({
  direction = 'column',
  gap = 8,
  align = 'stretch',
  justify = 'flex-start',
  wrap = false,
  padding,
  style,
  children,
}) => (
  <View
    style={[
      {
        flexDirection: direction,
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        padding,
      },
      style,
    ]}
  >
    {children}
  </View>
);

/**
 * StackSkeleton - Skeleton version with placeholder children.
 */
export const StackSkeleton: React.FC<Partial<StackProps>> = ({
  direction = 'column',
  gap = 8,
  padding,
  style,
  children,
}) => (
  <View
    style={[
      {
        flexDirection: direction,
        gap,
        padding,
      },
      style,
    ]}
  >
    {children || (
      <>
        <Skeleton height={40} />
        <Skeleton height={40} />
      </>
    )}
  </View>
);

export default Stack;

