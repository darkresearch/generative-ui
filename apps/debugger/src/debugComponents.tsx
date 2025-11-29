import React from 'react';
import { View, Text } from 'react-native';
import type {
  ComponentDefinition,
  ComponentRegistry,
} from '@darkresearch/streamdown-rn';

type StatusCardProps = {
  title?: string;
  description?: string;
  priority?: number;
  tickets?: number;
};

const StatusCard: React.FC<StatusCardProps> = ({
  title = 'Untitled',
  description = 'No description provided',
  priority = 3,
  tickets = 0,
}) => (
  <View
    style={{
      padding: 14,
      borderRadius: 12,
      backgroundColor: '#161616',
      borderWidth: 1,
      borderColor: '#2b2b2b',
      gap: 6,
      marginBottom: 12,
    }}
  >
    <Text style={{ color: '#f5f5f5', fontWeight: '600', fontSize: 16 }}>
      {title} · P{priority}
    </Text>
    <Text style={{ color: '#b3b3b3' }}>{description}</Text>
    <Text style={{ color: '#52c41a', fontWeight: '600' }}>
      {tickets} tickets tracked
    </Text>
  </View>
);

const definitions: Record<string, ComponentDefinition> = {
  StatusCard: {
    component: StatusCard,
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

