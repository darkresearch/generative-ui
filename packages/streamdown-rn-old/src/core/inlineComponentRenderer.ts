/**
 * Inline Component Renderer
 * 
 * A different approach: Instead of relying on markdown parser rules,
 * we manually split text and inject components inline.
 */

import { ComponentInstance } from './types';

/**
 * Split markdown into segments with component markers
 * Returns an array of {type: 'text' | 'component', content: string | ComponentInstance}
 */
export function splitMarkdownWithComponents(
  markdown: string,
  components: ComponentInstance[]
): Array<{ type: 'text' | 'component'; content: string | ComponentInstance }> {
  const segments: Array<{ type: 'text' | 'component'; content: string | ComponentInstance }> = [];
  
  // Create a map of placeholders to components
  const placeholderMap = new Map<string, ComponentInstance>();
  components.forEach(comp => {
    placeholderMap.set(`\`__COMPONENT__${comp.id}__${comp.name}__\``, comp);
  });
  
  let currentIndex = 0;
  let textBuffer = '';
  
  // Find all component markers in order
  const markerPattern = /`__COMPONENT__([^`]+)__`/g;
  let match;
  
  while ((match = markerPattern.exec(markdown)) !== null) {
    const fullMarker = match[0];
    const componentInstance = placeholderMap.get(fullMarker);
    
    if (componentInstance) {
      // Add text before this component
      if (match.index > currentIndex) {
        textBuffer += markdown.substring(currentIndex, match.index);
      }
      
      // Flush text buffer if not empty
      if (textBuffer) {
        segments.push({ type: 'text', content: textBuffer });
        textBuffer = '';
      }
      
      // Add component
      segments.push({ type: 'component', content: componentInstance });
      
      currentIndex = match.index + fullMarker.length;
    }
  }
  
  // Add remaining text
  if (currentIndex < markdown.length) {
    textBuffer += markdown.substring(currentIndex);
  }
  
  if (textBuffer) {
    segments.push({ type: 'text', content: textBuffer });
  }
  
  return segments;
}

/**
 * Check if markdown contains component markers
 */
export function hasComponentMarkers(markdown: string): boolean {
  return /`__COMPONENT__[^`]+__`/.test(markdown);
}
