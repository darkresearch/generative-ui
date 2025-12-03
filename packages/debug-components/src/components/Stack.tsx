import React from 'react';
import { View } from 'react-native';
import { Skeleton } from 'streamdown-rn';

// ============================================================================
// Types
// ============================================================================

export type StackProps = {
  direction?: 'row' | 'column';
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  children?: React.ReactNode;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Stack layout component - arranges children in a row or column with configurable spacing.
 */
export const Stack: React.FC<StackProps> = ({
  direction = 'column',
  gap = 8,
  align = 'stretch',
  justify = 'flex-start',
  children,
}) => (
  <View style={{
    flexDirection: direction,
    gap,
    alignItems: align,
    justifyContent: justify,
  }}>
    {children}
  </View>
);

/**
 * Stack skeleton - renders placeholder content while streaming.
 */
export const StackSkeleton: React.FC<Partial<StackProps>> = ({
  direction = 'column',
  gap = 8,
  children,
}) => (
  <View style={{ flexDirection: direction, gap }}>
    {children || (
      <>
        <Skeleton height={40} />
        <Skeleton height={40} />
      </>
    )}
  </View>
);

/**
 * Stack schema for validation
 */
export const StackSchema = {
  type: 'object' as const,
  properties: {
    direction: { type: 'string' as const },
    gap: { type: 'number' as const },
    align: { type: 'string' as const },
    justify: { type: 'string' as const },
  },
  required: [] as string[],
};

