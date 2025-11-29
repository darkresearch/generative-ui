/**
 * Card Layout Component
 * 
 * Container with background, padding, and border.
 */

import React from 'react';
import { View, Text, ViewStyle, StyleSheet } from 'react-native';
import { SkeletonText } from '../Skeleton';

export interface CardProps {
  /** Card title */
  title?: string;
  /** Padding inside card */
  padding?: number;
  /** Background color */
  backgroundColor?: string;
  /** Border color */
  borderColor?: string;
  /** Border radius */
  borderRadius?: number;
  /** Additional styles */
  style?: ViewStyle;
  /** Children */
  children?: React.ReactNode;
  /** Streaming flag (passed by ComponentBlock) */
  _isStreaming?: boolean;
}

/**
 * Card - Container with visual styling.
 */
export const Card: React.FC<CardProps> = ({
  title,
  padding = 14,
  backgroundColor = 'rgba(255, 255, 255, 0.04)',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = 12,
  style,
  children,
}) => (
  <View
    style={[
      styles.card,
      {
        padding,
        backgroundColor,
        borderColor,
        borderRadius,
      },
      style,
    ]}
  >
    {title && <Text style={styles.title}>{title}</Text>}
    {children}
  </View>
);

/**
 * CardSkeleton - Skeleton version with placeholder content.
 */
export const CardSkeleton: React.FC<Partial<CardProps>> = ({
  title,
  padding = 14,
  backgroundColor = 'rgba(255, 255, 255, 0.04)',
  borderColor = 'rgba(255, 255, 255, 0.1)',
  borderRadius = 12,
  style,
  children,
}) => (
  <View
    style={[
      styles.card,
      {
        padding,
        backgroundColor,
        borderColor,
        borderRadius,
      },
      style,
    ]}
  >
    {title ? (
      <Text style={styles.title}>{title}</Text>
    ) : (
      <SkeletonText width={100} style={{ marginBottom: 8 }} />
    )}
    {children || <SkeletonText lines={3} />}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    gap: 8,
  },
  title: {
    color: '#f5f5f5',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 4,
  },
});

export default Card;

