/**
 * AST Renderer
 * 
 * Recursively renders MDAST (Markdown AST) nodes to React Native components.
 * Supports full GitHub Flavored Markdown via remark-gfm.
 */

import React, { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { Content, Parent } from 'mdast';
import type { ThemeConfig, ComponentRegistry } from '../core/types';
import { getTextStyles } from '../themes';
import { extractComponentData } from '../blocks';

export interface ASTRendererProps {
  /** MDAST node to render */
  node: Content;
  /** Theme configuration */
  theme: ThemeConfig;
  /** Component registry for inline components */
  componentRegistry?: ComponentRegistry;
}

/**
 * Main AST Renderer Component
 * 
 * Renders a single MDAST node and its children recursively.
 */
export const ASTRenderer: React.FC<ASTRendererProps> = ({
  node,
  theme,
  componentRegistry,
}) => {
  return <>{renderNode(node, theme, componentRegistry)}</>;
};

/**
 * Render a single MDAST node
 */
function renderNode(
  node: Content,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  
  switch (node.type) {
    // ========================================================================
    // Block-level nodes
    // ========================================================================
    
    case 'paragraph':
      return (
        <Text key={key} style={styles.paragraph}>
          {renderChildren(node, theme, componentRegistry)}
        </Text>
      );
    
    case 'heading':
      const headingStyle = styles[`heading${node.depth}` as keyof typeof styles];
      return (
        <Text key={key} style={headingStyle}>
          {renderChildren(node, theme, componentRegistry)}
        </Text>
      );
    
    case 'code':
      // Code blocks are handled by CodeBlock component
      // This shouldn't be reached if blocks handle it
      return (
        <Text key={key} style={styles.code}>
          {node.value}
        </Text>
      );
    
    case 'blockquote':
      return (
        <View key={key} style={{ borderLeftWidth: 4, borderLeftColor: theme.colors.muted, paddingLeft: 16 }}>
          <Text style={[styles.paragraph, { fontStyle: 'italic' }]}>
            {renderChildren(node, theme, componentRegistry)}
          </Text>
        </View>
      );
    
    case 'list':
      return (
        <View key={key}>
          {node.children.map((item, index) => renderNode(item, theme, componentRegistry, index))}
        </View>
      );
    
    case 'listItem':
      return (
        <View key={key} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={styles.body}>• </Text>
          <View style={{ flex: 1 }}>
            {renderChildren(node, theme, componentRegistry)}
          </View>
        </View>
      );
    
    case 'thematicBreak':
      return (
        <View key={key} style={{
          height: 1,
          backgroundColor: theme.colors.border,
          marginVertical: theme.spacing.block,
        }} />
      );
    
    // ========================================================================
    // Inline (phrasing) nodes
    // ========================================================================
    
    case 'text':
      // Check if text contains inline component syntax
      if (node.value.includes('[{c:')) {
        return renderTextWithComponents(node.value, theme, componentRegistry, key);
      }
      return node.value;
    
    case 'strong':
      return (
        <Text key={key} style={styles.bold}>
          {renderChildren(node, theme, componentRegistry)}
        </Text>
      );
    
    case 'emphasis':
      return (
        <Text key={key} style={styles.italic}>
          {renderChildren(node, theme, componentRegistry)}
        </Text>
      );
    
    case 'delete':
      // GFM strikethrough
      return (
        <Text key={key} style={styles.strikethrough}>
          {renderChildren(node, theme, componentRegistry)}
        </Text>
      );
    
    case 'inlineCode':
      return (
        <Text key={key} style={styles.code}>
          {node.value}
        </Text>
      );
    
    case 'link':
      return (
        <Text
          key={key}
          style={styles.link}
          accessibilityRole="link"
          // TODO: Add onPress for link navigation
        >
          {renderChildren(node, theme, componentRegistry)}
        </Text>
      );
    
    case 'image':
      // Inline image (if in text context, render as placeholder)
      return (
        <Text key={key} style={styles.link}>
          [Image: {node.alt || node.url}]
        </Text>
      );
    
    case 'break':
      return '\n';
    
    // ========================================================================
    // GFM-specific nodes
    // ========================================================================
    
    case 'table':
    case 'tableRow':
    case 'tableCell':
      // Tables are handled by Table block component
      // These shouldn't be reached individually
      return null;
    
    case 'footnoteReference':
      return (
        <Text key={key} style={{ fontSize: 12 }}>
          [{node.identifier}]
        </Text>
      );
    
    case 'footnoteDefinition':
      return null; // Footnotes rendered separately
    
    // ========================================================================
    // Fallback
    // ========================================================================
    
    default:
      console.warn('Unhandled MDAST node type:', (node as any).type);
      return null;
  }
}

/**
 * Render children of a parent node
 */
function renderChildren(
  node: Parent,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry
): ReactNode {
  if (!('children' in node) || !node.children) {
    return null;
  }
  
  return node.children.map((child, index) =>
    renderNode(child as Content, theme, componentRegistry, index)
  );
}

/**
 * Render text that may contain inline component syntax
 * Falls back to component detection for [{c:...}] syntax
 */
function renderTextWithComponents(
  text: string,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  key?: string | number
): ReactNode {
  // Look for inline components
  const componentMatch = text.match(/\[\{c:\s*"([^"]+)"\s*,\s*p:\s*(\{[\s\S]*?\})\s*\}\]/);
  
  if (!componentMatch) {
    return text;
  }
  
  const before = text.slice(0, componentMatch.index);
  const after = text.slice(componentMatch.index! + componentMatch[0].length);
  
  const { name, props } = extractComponentData(componentMatch[0]);
  
  if (!componentRegistry) {
    return (
      <>
        {before}
        <Text style={{ color: theme.colors.muted }}>⚠️ [{name}]</Text>
        {after}
      </>
    );
  }
  
  const componentDef = componentRegistry.get(name);
  if (!componentDef) {
    return (
      <>
        {before}
        <Text style={{ color: theme.colors.muted }}>⚠️ [{name}]</Text>
        {after}
      </>
    );
  }
  
  const Component = componentDef.component;
  
  return (
    <>
      {before}
      <Component key={key} {...props} _isInline={true} />
      {renderTextWithComponents(after, theme, componentRegistry, `${key}-after`)}
    </>
  );
}

/**
 * Render a complete MDAST tree (for testing)
 */
export function renderAST(
  nodes: Content[],
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry
): ReactNode {
  return nodes.map((node, index) => renderNode(node, theme, componentRegistry, index));
}

