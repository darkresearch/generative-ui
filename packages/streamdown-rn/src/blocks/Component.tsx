/**
 * Component - Unified Component Renderer
 * 
 * Renders injected components from [{c:"Name",p:{...}}] syntax.
 * Handles both StableBlock and raw data input.
 */

import React from 'react';
import { View, Text } from 'react-native';
import type { StableBlock, ThemeConfig, ComponentRegistry } from '../core/types';

export interface ComponentBlockProps {
  theme: ThemeConfig;
  componentRegistry?: ComponentRegistry;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct component name (when not using block) */
  componentName?: string;
  /** Direct props (when not using block) */
  props?: Record<string, unknown>;
  /** Whether streaming (for active blocks) */
  isStreaming?: boolean;
}

/**
 * Extract component name and props from raw content
 * Syntax: [{c:"Name",p:{...}}]
 */
export function extractComponentData(content: string): { name: string; props: Record<string, unknown> } {
  const nameMatch = content.match(/\[\{c:\s*"([^"]+)"/);
  if (!nameMatch) {
    return { name: '', props: {} };
  }
  
  const name = nameMatch[1];
  
  // Try to parse props - complete syntax
  const propsMatch = content.match(/\[\{c:\s*"[^"]+"\s*,\s*p:\s*(\{[\s\S]*\})\s*\}\]/);
  let props: Record<string, unknown> = {};
  
  if (propsMatch) {
    try {
      props = JSON.parse(propsMatch[1]);
    } catch {
      // Parse error — try to close incomplete JSON for streaming
      try {
        let propsJson = propsMatch[1];
        let depth = 0;
        for (const char of propsJson) {
          if (char === '{') depth++;
          if (char === '}') depth--;
        }
        while (depth > 0) {
          propsJson += '}';
          depth--;
        }
        props = JSON.parse(propsJson);
      } catch {
        // Still can't parse — use empty props
      }
    }
  } else {
    // Try partial match for streaming (no closing }])
    const partialMatch = content.match(/\[\{c:\s*"[^"]+"\s*,\s*p:\s*(\{[\s\S]*)/);
    if (partialMatch) {
      try {
        let propsJson = partialMatch[1];
        let depth = 0;
        for (const char of propsJson) {
          if (char === '{') depth++;
          if (char === '}') depth--;
        }
        while (depth > 0) {
          propsJson += '}';
          depth--;
        }
        props = JSON.parse(propsJson);
      } catch {
        // Can't parse yet
      }
    }
  }
  
  return { name, props };
}

export const ComponentBlock: React.FC<ComponentBlockProps> = React.memo(
  ({ theme, componentRegistry, block, componentName: directName, props: directProps, isStreaming = false }) => {
    // Determine name and props from either source
    let componentName: string;
    let props: Record<string, unknown>;
    
    if (block) {
      const meta = block.meta as { type: 'component'; name: string; props: Record<string, unknown> };
      if (meta.name) {
        componentName = meta.name;
        props = meta.props || {};
      } else {
        const extracted = extractComponentData(block.content);
        componentName = extracted.name;
        props = extracted.props;
      }
    } else {
      componentName = directName ?? '';
      props = directProps ?? {};
    }
    
    // No component name yet (still streaming)
    if (!componentName) {
      return (
        <View style={{
          padding: 12,
          backgroundColor: theme.colors.codeBackground,
          borderRadius: 8,
          marginBottom: theme.spacing.block,
        }}>
          <Text style={{ color: theme.colors.muted }}>
            Loading component...
          </Text>
        </View>
      );
    }
    
    // No registry provided
    if (!componentRegistry) {
      return (
        <View style={{
          padding: 12,
          backgroundColor: theme.colors.codeBackground,
          borderRadius: 8,
          marginBottom: theme.spacing.block,
        }}>
          <Text style={{ color: theme.colors.muted }}>
            ⚠️ No component registry provided
          </Text>
        </View>
      );
    }
    
    // Component not found
    const componentDef = componentRegistry.get(componentName);
    if (!componentDef) {
      return (
        <View style={{
          padding: 12,
          backgroundColor: theme.colors.codeBackground,
          borderRadius: 8,
          marginBottom: theme.spacing.block,
        }}>
          <Text style={{ color: theme.colors.muted }}>
            ⚠️ Unknown component: {componentName}
          </Text>
        </View>
      );
    }
    
    const Component = componentDef.component;
    
    return (
      <View style={{ marginBottom: theme.spacing.block }}>
        <Component {...props} _isStreaming={isStreaming} />
      </View>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return (
      prev.componentName === next.componentName &&
      JSON.stringify(prev.props) === JSON.stringify(next.props)
    );
  }
);

ComponentBlock.displayName = 'ComponentBlock';

