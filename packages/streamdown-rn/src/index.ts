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
// Skeleton Primitives (for building component skeletons)
// ============================================================================

export {
  Skeleton,
  SkeletonText,
  SkeletonRect,
  SkeletonCircle,
  SkeletonNumber,
  type SkeletonProps,
  type SkeletonTextProps,
} from './components';

// ============================================================================
// Security Utilities
// ============================================================================

export {
  sanitizeURL,
  sanitizeProps,
} from './core/sanitize';

// ============================================================================
// Public Types
// ============================================================================

export type {
  // Component props
  StreamdownRNProps,

  // Component injection (for custom component registries)
  ComponentDefinition,
  ComponentRegistry,

  // Custom renderers (for overriding built-in rendering)
  CustomRenderers,
  CodeBlockRenderer,
  CodeBlockRendererProps,

  // Theme (for custom renderer styling)
  ThemeConfig,
  ThemeColors,

  // Debug/Observability
  DebugSnapshot,
} from './core/types';
