/**
 * AST Renderer
 * 
 * THE single source of truth for rendering MDAST nodes to React Native.
 * Handles all GitHub Flavored Markdown via remark-gfm.
 * 
 * Includes:
 * - All block-level nodes (paragraph, heading, code, blockquote, list, table, hr, image)
 * - All inline nodes (text, strong, emphasis, delete, code, link, break)
 * - Custom component injection via [{c:"Name",p:{...}}] syntax
 * - Syntax highlighting for code blocks
 */

import React, { ReactNode } from 'react';
import { Text, View, ScrollView, Image, Platform } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import type { Content, Parent, Table as TableNode, Code as CodeNode, List as ListNode, Image as ImageNode } from 'mdast';
import type { ThemeConfig, ComponentRegistry, StableBlock } from '../core/types';
import { getTextStyles, getBlockStyles } from '../themes';
import { extractComponentData, type ComponentData } from '../core/componentParser';

// ============================================================================
// Syntax Highlighting Utilities
// ============================================================================

/**
 * Map common language aliases to Prism language names
 */
function normalizeLanguage(lang: string): string {
  const aliases: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'tsx': 'tsx',
    'jsx': 'jsx',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'shell': 'bash',
    'zsh': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'json5': 'json',
    'dockerfile': 'docker',
  };
  return aliases[lang.toLowerCase()] || lang.toLowerCase();
}

/**
 * Create Prism syntax style from theme colors
 */
function createSyntaxStyle(theme: ThemeConfig) {
  return {
    'pre[class*="language-"]': {
      color: theme.colors.syntaxDefault,
      background: 'transparent',
    },
    'token': { color: theme.colors.syntaxDefault },
    'keyword': { color: theme.colors.syntaxKeyword },
    'builtin': { color: theme.colors.syntaxOperator },
    'class-name': { color: theme.colors.syntaxClass },
    'function': { color: theme.colors.syntaxFunction },
    'string': { color: theme.colors.syntaxString },
    'number': { color: theme.colors.syntaxNumber },
    'operator': { color: theme.colors.syntaxOperator },
    'comment': { color: theme.colors.syntaxComment },
    'punctuation': { color: theme.colors.syntaxDefault },
    'property': { color: theme.colors.syntaxClass },
    'constant': { color: theme.colors.syntaxNumber },
    'boolean': { color: theme.colors.syntaxNumber },
    'tag': { color: theme.colors.syntaxKeyword },
    'attr-name': { color: theme.colors.syntaxString },
    'attr-value': { color: theme.colors.syntaxString },
    'selector': { color: theme.colors.syntaxClass },
    'regex': { color: theme.colors.syntaxString },
  };
}

// ============================================================================
// Component Extraction (re-export for backwards compatibility)
// ============================================================================

export { extractComponentData, type ComponentData };

// ============================================================================
// Main Component
// ============================================================================

export interface ASTRendererProps {
  /** MDAST node to render */
  node: Content;
  /** Theme configuration */
  theme: ThemeConfig;
  /** Component registry for custom components */
  componentRegistry?: ComponentRegistry;
  /** Whether this is streaming (for components) */
  isStreaming?: boolean;
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
  isStreaming = false,
}) => {
  return <>{renderNode(node, theme, componentRegistry, isStreaming)}</>;
};

// ============================================================================
// Node Rendering
// ============================================================================

/**
 * Render a single MDAST node
 */
function renderNode(
  node: Content,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  const blockStyles = getBlockStyles(theme);
  
  switch (node.type) {
    // ========================================================================
    // Block-level nodes
    // ========================================================================
    
    case 'paragraph':
      return (
        <Text key={key} style={styles.paragraph}>
          {renderChildren(node, theme, componentRegistry, isStreaming)}
        </Text>
      );
    
    case 'heading':
      const headingStyle = styles[`heading${node.depth}` as keyof typeof styles];
      return (
        <Text key={key} style={headingStyle}>
          {renderChildren(node, theme, componentRegistry, isStreaming)}
        </Text>
      );
    
    case 'code':
      return renderCodeBlock(node as CodeNode, theme, key);
    
    case 'blockquote':
      return renderBlockquote(node, theme, componentRegistry, isStreaming, key);
    
    case 'list':
      return renderList(node as ListNode, theme, componentRegistry, isStreaming, key);
    
    case 'listItem':
      return (
        <View key={key} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={styles.body}>• </Text>
          <View style={{ flex: 1 }}>
            {renderChildren(node, theme, componentRegistry, isStreaming)}
          </View>
        </View>
      );
    
    case 'thematicBreak':
      return (
        <View key={key} style={blockStyles.horizontalRule} />
      );
    
    case 'table':
      return renderTable(node as TableNode, theme, componentRegistry, isStreaming, key);
    
    case 'html':
      // Render HTML as plain text (React Native doesn't support HTML)
      return (
        <Text key={key} style={[styles.code, { color: theme.colors.muted }]}>
          {node.value}
        </Text>
      );
    
    // ========================================================================
    // Inline (phrasing) nodes
    // ========================================================================
    
    case 'text':
      // Check if text contains inline component syntax
      if (node.value.includes('[{c:')) {
        return renderTextWithComponents(node.value, theme, componentRegistry, isStreaming, key);
      }
      return node.value;
    
    case 'strong':
      return (
        <Text key={key} style={styles.bold}>
          {renderChildren(node, theme, componentRegistry, isStreaming)}
        </Text>
      );
    
    case 'emphasis':
      return (
        <Text key={key} style={styles.italic}>
          {renderChildren(node, theme, componentRegistry, isStreaming)}
        </Text>
      );
    
    case 'delete':
      // GFM strikethrough
      return (
        <Text key={key} style={styles.strikethrough}>
          {renderChildren(node, theme, componentRegistry, isStreaming)}
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
        >
          {renderChildren(node, theme, componentRegistry, isStreaming)}
        </Text>
      );
    
    case 'image':
      return renderImage(node as ImageNode, theme, key);
    
    case 'break':
      return '\n';
    
    // ========================================================================
    // GFM-specific nodes (handled above or ignored)
    // ========================================================================
    
    case 'tableRow':
    case 'tableCell':
      // Handled by renderTable
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
      console.warn('Unhandled MDAST node type:', (node as Content).type);
      return null;
  }
}

/**
 * Render children of a parent node
 */
function renderChildren(
  node: Parent,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false
): ReactNode {
  if (!('children' in node) || !node.children) {
    return null;
  }
  
  return node.children.map((child, index) =>
    renderNode(child as Content, theme, componentRegistry, isStreaming, index)
  );
}

// ============================================================================
// Specialized Renderers
// ============================================================================

/**
 * Render a code block with syntax highlighting
 */
function renderCodeBlock(
  node: CodeNode,
  theme: ThemeConfig,
  key?: string | number
): ReactNode {
  const blockStyles = getBlockStyles(theme);
  const code = node.value.replace(/\n+$/, ''); // Trim trailing newlines
  const language = node.lang || 'text';
  const normalizedLanguage = normalizeLanguage(language);
  const syntaxStyle = createSyntaxStyle(theme);
  
  return (
    <View key={key} style={blockStyles.codeBlock}>
      {language && language !== 'text' && (
        <Text style={{
          color: theme.colors.muted,
          fontSize: 12,
          marginBottom: 8,
          fontFamily: theme.fonts.mono,
        }}>
          {language}
        </Text>
      )}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={syntaxStyle}
          highlighter="prism"
          customStyle={{
            backgroundColor: 'transparent',
            padding: 0,
            margin: 0,
          }}
          fontSize={14}
          fontFamily={Platform.select({
            ios: 'Menlo',
            android: 'monospace',
            web: 'monospace',
            default: 'monospace',
          })}
          PreTag={View as any}
          CodeTag={Text as any}
        >
          {code}
        </SyntaxHighlighter>
      </ScrollView>
    </View>
  );
}

/**
 * Render a list (ordered or unordered)
 */
function renderList(
  node: ListNode,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  const ordered = node.ordered ?? false;
  
  return (
    <View key={key} style={{ marginBottom: theme.spacing.block }}>
      {node.children.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={[styles.body, { width: 24 }]}>
            {ordered ? `${index + 1}.` : '•'}
          </Text>
          <View style={{ flex: 1 }}>
            {item.children.map((child, childIndex) =>
              renderListItemChild(child as Content, theme, componentRegistry, isStreaming, childIndex)
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Render a child node inside a list item.
 * Strips paragraph margins to prevent double-spacing in lists.
 */
function renderListItemChild(
  node: Content,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  
  // For paragraphs inside list items, render without margin
  if (node.type === 'paragraph') {
    return (
      <Text key={key} style={[styles.body, { marginBottom: 0 }]}>
        {renderChildren(node, theme, componentRegistry, isStreaming)}
      </Text>
    );
  }
  
  // For nested lists, render with reduced margin
  if (node.type === 'list') {
    return (
      <View key={key} style={{ marginTop: 4, marginBottom: 0 }}>
        {renderList(node as ListNode, theme, componentRegistry, isStreaming)}
      </View>
    );
  }
  
  // For other types, use normal rendering
  return renderNode(node, theme, componentRegistry, isStreaming, key);
}

/**
 * Render a blockquote.
 * Strips paragraph margins to prevent extra spacing at the end.
 */
function renderBlockquote(
  node: { children?: Content[] },
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  const blockStyles = getBlockStyles(theme);
  
  return (
    <View key={key} style={blockStyles.blockquote}>
      {node.children?.map((child, index) => {
        // For paragraphs inside blockquotes, render without bottom margin
        if (child.type === 'paragraph') {
          return (
            <Text key={index} style={[styles.body, { marginBottom: 0 }]}>
              {renderChildren(child, theme, componentRegistry, isStreaming)}
            </Text>
          );
        }
        // For other types, use normal rendering
        return renderNode(child, theme, componentRegistry, isStreaming, index);
      })}
    </View>
  );
}

/**
 * Render a table
 */
function renderTable(
  node: TableNode,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  const rows = node.children;
  
  if (rows.length === 0) return null;
  
  const headerRow = rows[0];
  const bodyRows = rows.slice(1);
  
  return (
    <View key={key} style={{ marginBottom: theme.spacing.block }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        borderBottomWidth: 2, 
        borderBottomColor: theme.colors.border,
        paddingBottom: 8,
        marginBottom: 8,
      }}>
        {headerRow.children.map((cell, cellIndex) => (
          <View key={cellIndex} style={{ flex: 1, paddingHorizontal: 8 }}>
            <Text style={[styles.bold, { fontSize: 14 }]}>
              {cell.children.map((child, childIndex) =>
                renderNode(child as Content, theme, componentRegistry, isStreaming, childIndex)
              )}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Body */}
      {bodyRows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ 
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
          paddingVertical: 8,
        }}>
          {row.children.map((cell, cellIndex) => (
            <View key={cellIndex} style={{ flex: 1, paddingHorizontal: 8 }}>
              <Text style={styles.body}>
                {cell.children.map((child, childIndex) =>
                  renderNode(child as Content, theme, componentRegistry, isStreaming, childIndex)
                )}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Render an image
 */
function renderImage(
  node: ImageNode,
  theme: ThemeConfig,
  key?: string | number
): ReactNode {
  const styles = getTextStyles(theme);
  
  // For now, render as a placeholder with alt text
  // Full image support would require Image component with dimensions
  if (!node.url) {
    return null;
  }
  
  return (
    <View key={key} style={{ marginVertical: theme.spacing.block }}>
      <Image
        source={{ uri: node.url }}
        style={{ 
          width: '100%', 
          height: 200, 
          borderRadius: 8,
          backgroundColor: theme.colors.codeBackground,
        }}
        resizeMode="contain"
        accessibilityLabel={node.alt || 'Image'}
      />
      {node.alt && (
        <Text style={[styles.body, { color: theme.colors.muted, marginTop: 4, textAlign: 'center' }]}>
          {node.alt}
        </Text>
      )}
    </View>
  );
}

/**
 * Render text that may contain inline component syntax
 */
function renderTextWithComponents(
  text: string,
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false,
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
      <Component key={key} {...props} _isInline={true} _isStreaming={isStreaming} />
      {renderTextWithComponents(after, theme, componentRegistry, isStreaming, `${key}-after`)}
    </>
  );
}

// ============================================================================
// Block-level Component Renderer (for StableBlock with type='component')
// ============================================================================

export interface ComponentBlockProps {
  theme: ThemeConfig;
  componentRegistry?: ComponentRegistry;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct component name (when not using block) */
  componentName?: string;
  /** Direct props (when not using block) */
  props?: Record<string, unknown>;
  /** CSS Grid-like style for layout positioning */
  style?: Record<string, unknown>;
  /** Direct children (when not using block) */
  children?: ComponentData[];
  /** Whether streaming (for active blocks) */
  isStreaming?: boolean;
}

/**
 * Render error/fallback states for components.
 */
function renderComponentError(theme: ThemeConfig, message: string): ReactNode {
  return (
    <View style={{
      padding: 12,
      backgroundColor: theme.colors.codeBackground,
      borderRadius: 8,
      marginBottom: theme.spacing.block,
    }}>
      <Text style={{ color: theme.colors.muted }}>{message}</Text>
    </View>
  );
}

/**
 * Render a block-level custom component with skeleton and children support.
 */
export const ComponentBlock: React.FC<ComponentBlockProps> = React.memo(
  ({ 
    theme, 
    componentRegistry, 
    block, 
    componentName: directName, 
    props: directProps,
    style: directStyle,
    children: directChildren,
    isStreaming = false,
  }) => {
    // Extract component data from block or direct props
    let componentName: string;
    let props: Record<string, unknown>;
    let style: Record<string, unknown> | undefined;
    let children: ComponentData[] | undefined;
    
    if (block) {
      const meta = block.meta as { type: 'component'; name: string; props: Record<string, unknown> };
      if (meta.name) {
        componentName = meta.name;
        props = meta.props || {};
      } else {
        const extracted = extractComponentData(block.content);
        componentName = extracted.name;
        props = extracted.props;
        style = extracted.style;
        children = extracted.children;
      }
    } else {
      componentName = directName ?? '';
      props = directProps ?? {};
      style = directStyle;
      children = directChildren;
    }
    
    // No component name yet (still streaming) - render nothing
    // The component will appear once we have enough to show its skeleton
    if (!componentName) {
      return null;
    }
    
    // No registry provided
    if (!componentRegistry) {
      return renderComponentError(theme, '⚠️ No component registry provided');
    }
    
    // Component not found
    const componentDef = componentRegistry.get(componentName);
    if (!componentDef) {
      return renderComponentError(theme, `⚠️ Unknown component: ${componentName}`);
    }
    
    // Render children recursively if present, passing style for layout
    const renderedChildren = children?.length ? (
      children.map((child, index) => (
        <ComponentBlock
          key={index}
          theme={theme}
          componentRegistry={componentRegistry}
          componentName={child.name}
          props={child.props}
          style={child.style}
          children={child.children}
          isStreaming={isStreaming}
        />
      ))
    ) : undefined;
    
    // Merge props.style (component config) with layout style (positioning)
    // props.style = component-specific config (e.g., Canvas gridTemplateColumns)
    // style = layout positioning in parent (e.g., gridColumn: "span 2")
    const mergedStyle = { ...(props.style as object), ...style };
    
    // When streaming, prefer skeleton component if available
    if (isStreaming && componentDef.skeletonComponent) {
      const SkeletonComponent = componentDef.skeletonComponent;
      return (
        <View style={{ marginBottom: theme.spacing.block }}>
          <SkeletonComponent {...props} style={mergedStyle} _isStreaming={true}>
            {renderedChildren}
          </SkeletonComponent>
        </View>
      );
    }
    
    // Render the main component
    const Component = componentDef.component;
    return (
      <View style={{ marginBottom: theme.spacing.block }}>
        <Component {...props} style={mergedStyle} _isStreaming={isStreaming}>
          {renderedChildren}
        </Component>
      </View>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return (
      prev.componentName === next.componentName &&
      prev.isStreaming === next.isStreaming &&
      JSON.stringify(prev.props) === JSON.stringify(next.props) &&
      JSON.stringify(prev.children) === JSON.stringify(next.children)
    );
  }
);

ComponentBlock.displayName = 'ComponentBlock';

// ============================================================================
// Exports
// ============================================================================

/**
 * Render a complete MDAST tree (for testing)
 */
export function renderAST(
  nodes: Content[],
  theme: ThemeConfig,
  componentRegistry?: ComponentRegistry,
  isStreaming = false
): ReactNode {
  return nodes.map((node, index) => renderNode(node, theme, componentRegistry, isStreaming, index));
}
