/**
 * StreamdownRN - Streaming Markdown Renderer for React Native
 * 
 * High-performance streaming markdown renderer optimized for AI responses.
 * 
 * @packageDocumentation
 */

// ============================================================================
// Main Component
// ============================================================================

export { StreamdownRN, default } from './StreamdownRN';

// ============================================================================
// Types
// ============================================================================

export type {
  // Block types
  BlockType,
  HeadingLevel,
  StableBlock as StableBlockType,
  ActiveBlock as ActiveBlockType,
  BlockMeta,
  BlockRegistry,
  IncompleteTagState,
  
  // Component injection
  ComponentDefinition,
  ComponentRegistry,
  JSONSchema,
  ValidationResult,
  
  // Theme
  ThemeConfig,
  ThemeColors,
  
  // Props
  StreamdownRNProps,
  BlockRendererProps,
  ActiveBlockRendererProps,
  
  // Debug/Observability
  DebugSnapshot,
} from './core/types';

// ============================================================================
// Utilities
// ============================================================================

export {
  hashContent,
  generateBlockId,
  INITIAL_REGISTRY,
} from './core/types';

export {
  processNewContent,
  resetRegistry,
} from './core/splitter';

export {
  parseMarkdown,
  parseBlockContent,
  parseBlocks,
  isValidMarkdown,
} from './core/parser';

export {
  updateTagState,
  fixIncompleteMarkdown,
  INITIAL_INCOMPLETE_STATE,
} from './core/incomplete';

// ============================================================================
// Themes
// ============================================================================

export {
  darkTheme,
  lightTheme,
  getTheme,
  getTextStyles,
  getBlockStyles,
} from './themes';

// ============================================================================
// Renderers (for advanced customization)
// ============================================================================

export { StableBlock } from './renderers/StableBlock';
export { ActiveBlock } from './renderers/ActiveBlock';
export { ASTRenderer, renderAST } from './renderers/ASTRenderer';
export { renderInlineContent } from './renderers/InlineRenderer';

// ============================================================================
// Block Components (unified renderers)
// ============================================================================

export {
  CodeBlock,
  Heading,
  Paragraph,
  List,
  Blockquote,
  ComponentBlock,
  HorizontalRule,
  ImageBlock,
  Table,
  normalizeLanguage,
  createSyntaxStyle,
} from './blocks';

// Block component prop types
export type {
  CodeBlockProps,
  HeadingProps,
  ParagraphProps,
  ListProps,
  BlockquoteProps,
  ComponentBlockProps,
  HorizontalRuleProps,
  ImageBlockProps,
  TableProps,
} from './blocks';
