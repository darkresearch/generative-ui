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
