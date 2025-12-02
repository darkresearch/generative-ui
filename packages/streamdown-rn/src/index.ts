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
// Public Types
// ============================================================================

export type {
  // Component props
  StreamdownRNProps,
  
  // Component injection (for custom component registries)
  ComponentDefinition,
  ComponentRegistry,
  
  // Debug/Observability
  DebugSnapshot,
} from './core/types';
