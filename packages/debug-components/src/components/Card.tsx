import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SkeletonText } from 'streamdown-rn';

// ============================================================================
// Styles
// ============================================================================

const cardStyle: ViewStyle = {
  padding: 14,
  borderRadius: 12,
  backgroundColor: '#161616',
  borderWidth: 1,
  borderColor: '#2b2b2b',
  gap: 8,
};

const styles = StyleSheet.create({
  title: {
    color: '#f5f5f5',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
});

// ============================================================================
// Types
// ============================================================================

export type CardProps = {
  title?: string;
  padding?: number;
  children?: React.ReactNode;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Card layout component - a simple container with title and padding.
 */
export const Card: React.FC<CardProps> = ({
  title,
  padding = 14,
  children,
}) => (
  <View style={[cardStyle, { padding }]}>
    {title && <Text style={styles.title}>{title}</Text>}
    {children}
  </View>
);

/**
 * Card skeleton - renders placeholder content while streaming.
 */
export const CardSkeleton: React.FC<Partial<CardProps>> = ({
  title,
  padding = 14,
  children,
}) => (
  <View style={[cardStyle, { padding }]}>
    {title ? (
      <Text style={styles.title}>{title}</Text>
    ) : (
      <SkeletonText width={100} />
    )}
    {children || <SkeletonText lines={3} />}
  </View>
);

/**
 * Card schema for validation
 */
export const CardSchema = {
  type: 'object' as const,
  properties: {
    title: { type: 'string' as const },
    padding: { type: 'number' as const },
  },
  required: [] as string[],
};

