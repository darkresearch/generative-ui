import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  Skeleton,
  SkeletonText,
  SkeletonNumber,
} from 'streamdown-rn';

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#f5f5f5',
    fontWeight: '600',
    fontSize: 16,
  },
  priority: {
    color: '#888',
    fontSize: 14,
  },
  description: {
    color: '#b3b3b3',
    fontSize: 14,
    lineHeight: 20,
  },
  footerRow: {
    marginTop: 4,
  },
  tickets: {
    color: '#52c41a',
    fontWeight: '600',
    fontSize: 13,
  },
});

// ============================================================================
// Types
// ============================================================================

export type StatusCardProps = {
  title?: string;
  description?: string;
  priority?: number;
  tickets?: number;
  children?: React.ReactNode;
};

// ============================================================================
// Components
// ============================================================================

/**
 * StatusCard component - renders a status card with title, description, priority, and ticket count.
 * Supports progressive prop streaming with skeleton placeholders.
 */
export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  description,
  priority,
  tickets,
  children,
}) => (
  <View style={cardStyle}>
    <View style={styles.headerRow}>
      {title ? (
        <Text style={styles.title}>{title}</Text>
      ) : (
        <SkeletonText width={120} />
      )}
      {priority !== undefined ? (
        <Text style={styles.priority}>P{priority}</Text>
      ) : (
        <SkeletonNumber width={24} />
      )}
    </View>
    {description ? (
      <Text style={styles.description}>{description}</Text>
    ) : (
      <SkeletonText width="80%" lines={2} gap={6} />
    )}
    <View style={styles.footerRow}>
      {tickets !== undefined ? (
        <Text style={styles.tickets}>{tickets} tickets tracked</Text>
      ) : (
        <Skeleton width={100} height={14} />
      )}
    </View>
    {children}
  </View>
);

/**
 * StatusCard skeleton - renders placeholders while streaming.
 * Shows any available props, skeletons for missing ones.
 */
export const StatusCardSkeleton: React.FC<Partial<StatusCardProps>> = ({
  title,
  description,
  priority,
  tickets,
  children,
}) => (
  <View style={cardStyle}>
    <View style={styles.headerRow}>
      {title ? (
        <Text style={styles.title}>{title}</Text>
      ) : (
        <SkeletonText width={120} />
      )}
      {priority !== undefined ? (
        <Text style={styles.priority}>P{priority}</Text>
      ) : (
        <SkeletonNumber width={24} />
      )}
    </View>
    {description ? (
      <Text style={styles.description}>{description}</Text>
    ) : (
      <SkeletonText width="80%" lines={2} gap={6} />
    )}
    <View style={styles.footerRow}>
      {tickets !== undefined ? (
        <Text style={styles.tickets}>{tickets} tickets tracked</Text>
      ) : (
        <Skeleton width={100} height={14} />
      )}
    </View>
    {children}
  </View>
);

/**
 * StatusCard schema for validation
 */
export const StatusCardSchema = {
  type: 'object' as const,
  properties: {
    title: { type: 'string' as const, required: true },
    description: { type: 'string' as const },
    priority: { type: 'number' as const },
    tickets: { type: 'number' as const },
  },
  required: ['title'] as string[],
};

