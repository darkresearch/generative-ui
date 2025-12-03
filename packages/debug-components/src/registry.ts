/**
 * Debug Component Registry
 * 
 * Provides a shared component registry for streamdown-rn debugging and testing.
 * Used by both debugger (web) and debugger-ios apps.
 */

import type { ComponentDefinition, ComponentRegistry } from 'streamdown-rn';
import {
  StatusCard,
  StatusCardSkeleton,
  StatusCardSchema,
  Stack,
  StackSkeleton,
  StackSchema,
  Card,
  CardSkeleton,
  CardSchema,
} from './components';

// ============================================================================
// Component Definitions
// ============================================================================

const definitions: Record<string, ComponentDefinition> = {
  StatusCard: {
    component: StatusCard,
    skeletonComponent: StatusCardSkeleton,
    schema: StatusCardSchema,
  },
  // Stack and Card are available but commented out for now
  // Uncomment when nested component support is ready
  // Stack: {
  //   component: Stack,
  //   skeletonComponent: StackSkeleton,
  //   schema: StackSchema,
  // },
  // Card: {
  //   component: Card,
  //   skeletonComponent: CardSkeleton,
  //   schema: CardSchema,
  // },
};

// ============================================================================
// Registry Implementation
// ============================================================================

/**
 * Debug component registry for streamdown-rn.
 * 
 * Usage:
 * ```tsx
 * import { debugComponentRegistry } from '@darkresearch/debug-components';
 * 
 * <StreamdownRN componentRegistry={debugComponentRegistry}>
 *   {content}
 * </StreamdownRN>
 * ```
 */
export const debugComponentRegistry: ComponentRegistry = {
  get: (name) => definitions[name],
  has: (name) => !!definitions[name],
  validate: (name, props) => {
    const def = definitions[name];
    if (!def?.schema) return { valid: true, errors: [] };

    const errors: string[] = [];
    const candidate = (props ?? {}) as Record<string, unknown>;
    const { properties, required = [] } = def.schema;

    // Check required props
    for (const key of required) {
      if (candidate[key] === undefined || candidate[key] === null) {
        errors.push(`Missing required prop "${key}"`);
      }
    }

    // Type check props
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

/**
 * Get all registered component names
 */
export function getRegisteredComponents(): string[] {
  return Object.keys(definitions);
}

