/**
 * StreamdownRN - React Native Streaming Markdown Renderer
 * 
 * Public API exports
 */

// Main component
export { StreamdownRN, default } from './StreamdownRN';

// Core functionality
export { 
  fixIncompleteMarkdown,
  isMarkdownIncomplete,
  sanitizeMarkdown,
  optimizeForStreaming,
} from './core/parseIncomplete';

export {
  extractComponents,
  extractPartialComponents,
  injectComponentPlaceholders,
  extractComponentOrder,
  removeComponentMarkers,
  validateComponentSyntax,
  getComponentStats,
  getLastJSONCleanup,
} from './core/componentInjector';

// Types
export type {
  StreamdownRNProps,
  ComponentRegistry,
  ComponentDefinition,
  ComponentInstance,
  ProcessedMarkdown,
  ComponentError,
  ThemeConfig,
  ValidationResult,
  JSONSchema,
  ComponentRenderingMetadata,
  ComponentExtractionState,
} from './core/types';

// Progressive rendering components
export { Progressive } from './renderers/Progressive';
export { FieldSkeleton } from './renderers/FieldSkeleton';

// Themes
export { darkTheme, darkMarkdownStyles } from './themes/dark';
export { lightTheme, lightMarkdownStyles } from './themes/light';

// Simple Renderer
export { MarkdownRenderer } from './renderers/MarkdownRenderer';
