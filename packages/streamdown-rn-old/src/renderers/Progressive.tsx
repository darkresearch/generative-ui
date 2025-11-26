/**
 * Progressive - Declarative framework for progressive field rendering
 * 
 * Allows components to render fields progressively as they arrive during streaming
 */

import React, { createContext, useContext } from 'react';
import { FieldSkeleton } from './FieldSkeleton';
import { ComponentRenderingMetadata, ThemeConfig } from '../core/types';

interface ProgressiveContextValue {
  props: Record<string, any>;
  metadata?: ComponentRenderingMetadata;
  theme: ThemeConfig;
}

const ProgressiveContext = createContext<ProgressiveContextValue | null>(null);

export interface ProgressiveProps {
  props: Record<string, any>;
  metadata?: ComponentRenderingMetadata;
  theme: ThemeConfig;
  children: React.ReactNode;
}

export interface ProgressiveFieldProps {
  name: string;
  skeleton?: {
    width?: number;
    height?: number;
    borderRadius?: number;
  };
  children: (value: any) => React.ReactNode;
}

/**
 * Progressive wrapper component
 * Provides context for Progressive.Field children
 */
function ProgressiveComponent({ props, metadata, theme, children }: ProgressiveProps) {
  return (
    <ProgressiveContext.Provider value={{ props, metadata, theme }}>
      {children}
    </ProgressiveContext.Provider>
  );
}

/**
 * Progressive.Field component
 * Renders field value or skeleton based on availability
 */
function ProgressiveField({ name, skeleton, children }: ProgressiveFieldProps) {
  const context = useContext(ProgressiveContext);
  
  if (!context) {
    throw new Error('Progressive.Field must be used within Progressive component');
  }

  const { props, theme } = context;
  const value = props[name];

  // Check if field exists (handles undefined, null, 0, false, empty string)
  const hasValue = value !== undefined;

  if (hasValue) {
    // Field exists - render with value
    return <>{children(value)}</>;
  } else {
    // Field missing - render skeleton
    return (
      <FieldSkeleton
        width={skeleton?.width}
        height={skeleton?.height}
        borderRadius={skeleton?.borderRadius}
        theme={theme}
      />
    );
  }
}

// Export as Progressive with Field property
export const Progressive = Object.assign(ProgressiveComponent, {
  Field: ProgressiveField,
});

