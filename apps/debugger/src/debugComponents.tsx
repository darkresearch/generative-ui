import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {
  Skeleton,
  SkeletonText,
  SkeletonNumber,
  Canvas,
  CanvasSkeleton,
  type ComponentDefinition,
  type ComponentRegistry,
} from '@darkresearch/streamdown-rn';

// ============================================================================
// Shared Styles
// ============================================================================

const cardStyle: ViewStyle = {
  padding: 14,
  borderRadius: 12,
  backgroundColor: '#161616',
  borderWidth: 1,
  borderColor: '#2b2b2b',
  gap: 8,
};

// ============================================================================
// StatusCard Component
// ============================================================================

type StatusCardProps = {
  title?: string;
  description?: string;
  priority?: number;
  tickets?: number;
  children?: React.ReactNode;
};

/**
 * Main StatusCard component - renders actual content.
 */
const StatusCard: React.FC<StatusCardProps> = ({
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
const StatusCardSkeleton: React.FC<Partial<StatusCardProps>> = ({
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

// ============================================================================
// Stack Layout Component
// ============================================================================

type StackProps = {
  direction?: 'row' | 'column';
  gap?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  children?: React.ReactNode;
};

const Stack: React.FC<StackProps> = ({
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

const StackSkeleton: React.FC<Partial<StackProps>> = ({
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

// ============================================================================
// Card Layout Component
// ============================================================================

type CardProps = {
  title?: string;
  padding?: number;
  children?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({
  title,
  padding = 14,
  children,
}) => (
  <View style={[cardStyle, { padding }]}>
    {title && <Text style={styles.cardTitle}>{title}</Text>}
    {children}
  </View>
);

const CardSkeleton: React.FC<Partial<CardProps>> = ({
  title,
  padding = 14,
  children,
}) => (
  <View style={[cardStyle, { padding }]}>
    {title ? (
      <Text style={styles.cardTitle}>{title}</Text>
    ) : (
      <SkeletonText width={100} />
    )}
    {children || <SkeletonText lines={3} />}
  </View>
);

// ============================================================================
// Component Registry
// ============================================================================

const definitions: Record<string, ComponentDefinition> = {
  StatusCard: {
    component: StatusCard,
    skeletonComponent: StatusCardSkeleton,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', required: true },
        description: { type: 'string' },
        priority: { type: 'number' },
        tickets: { type: 'number' },
      },
      required: ['title'],
    },
  },
  Stack: {
    component: Stack,
    skeletonComponent: StackSkeleton,
    schema: {
      type: 'object',
      properties: {
        direction: { type: 'string' },
        gap: { type: 'number' },
        align: { type: 'string' },
        justify: { type: 'string' },
      },
    },
  },
  Card: {
    component: Card,
    skeletonComponent: CardSkeleton,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        padding: { type: 'number' },
      },
    },
  },
  Canvas: {
    component: Canvas,
    skeletonComponent: CanvasSkeleton,
    schema: {
      type: 'object',
      properties: {
        style: { type: 'object' },
      },
    },
  },
};

export const debugComponentRegistry: ComponentRegistry = {
  get: (name) => definitions[name],
  has: (name) => !!definitions[name],
  validate: (name, props) => {
    const def = definitions[name];
    if (!def?.schema) return { valid: true, errors: [] };

    const errors: string[] = [];
    const candidate = (props ?? {}) as Record<string, unknown>;
    const { properties, required = [] } = def.schema;

    for (const key of required) {
      if (candidate[key] === undefined || candidate[key] === null) {
        errors.push(`Missing required prop "${key}"`);
      }
    }

    for (const [key, meta] of Object.entries(properties)) {
      const value = candidate[key];
      if (value === undefined || value === null) continue;

      if (meta.type === 'number' && typeof value !== 'number') {
        errors.push(`Prop "${key}" must be a number`);
      }
      if (meta.type === 'string' && typeof value !== 'string') {
        errors.push(`Prop "${key}" must be a string`);
      }
    }

    return { valid: errors.length === 0, errors };
  },
};

// ============================================================================
// Styles
// ============================================================================

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
  cardTitle: {
    color: '#f5f5f5',
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
});
