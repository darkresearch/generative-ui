/**
 * Component Injector
 * 
 * Parses and injects dynamic components from markdown using the existing registry pattern.
 * Supports the {{component: "Name", props: {...}}} syntax.
 */

import { ComponentRegistry, ComponentInstance, ProcessedMarkdown, ComponentError } from './types';

/**
 * Extract balanced JSON from a string starting at a given position
 * Handles nested braces properly
 */
function extractBalancedJSON(str: string, startIndex: number): { json: string; endIndex: number } | null {
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let jsonStart = -1;

  for (let i = startIndex; i < str.length; i++) {
    const char = str[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\') {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') {
      if (braceCount === 0) jsonStart = i;
      braceCount++;
    } else if (char === '}') {
      braceCount--;
      if (braceCount === 0 && jsonStart !== -1) {
        return {
          json: str.substring(jsonStart, i + 1),
          endIndex: i + 1
        };
      }
    }
  }

  return null;
}

/**
 * Extract and process components from markdown
 */
export function extractComponents(
  markdown: string,
  registry?: ComponentRegistry,
  onError?: (error: ComponentError) => void
): ProcessedMarkdown {
  if (!registry) {
    return { markdown, components: [] };
  }

  console.log('🔍 extractComponents called with markdown:', markdown);

  const components: ComponentInstance[] = [];
  let processedMarkdown = markdown;

  // Pattern to find component start: {{c:"Name",p:
  const componentStartPattern = /\{\{c:\s*"([^"]+)"\s*,\s*p:\s*/g;

  let match;
  while ((match = componentStartPattern.exec(markdown)) !== null) {
    const componentName = match[1];
    const propsStartIndex = match.index + match[0].length;

    // Extract balanced JSON for props
    const jsonResult = extractBalancedJSON(markdown, propsStartIndex);
    if (!jsonResult) {
      console.warn(`Failed to extract props JSON for component '${componentName}'`);
      continue;
    }

    // Check for closing }}
    // Check for closing }}
    const afterPropsIndex = jsonResult.endIndex;
    if (markdown.substring(afterPropsIndex, afterPropsIndex + 2) !== '}}') {
      console.warn(`Missing closing }} for component '${componentName}'`);
      continue;
    }

    // We used to consume extra braces here to handle AI hallucinations (e.g. }}}),
    // but that caused issues when valid text followed (e.g. }} } ).
    // Now we strictly stop after }}.
    const endIndex = afterPropsIndex + 2;

    const fullMatch = markdown.substring(match.index, endIndex);
    const propsJson = jsonResult.json;

    try {
      // Get component from registry
      const componentDef = registry.get(componentName);
      if (!componentDef) {
        console.warn(`Component '${componentName}' not found in registry`);
        continue;
      }

      // Parse props
      let props;
      try {
        props = JSON.parse(propsJson);
      } catch (parseError) {
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        const error: ComponentError = {
          componentName,
          error: new Error(`Invalid JSON props: ${errorMessage}`),
          props: propsJson,
        };
        onError?.(error);
        console.warn('Failed to parse component props:', parseError);
        continue;
      }

      // Validate props against schema
      const validation = registry.validate(componentName, props);
      if (!validation.valid) {
        const error: ComponentError = {
          componentName,
          error: new Error(`Props validation failed: ${validation.errors.join(', ')}`),
          props,
        };
        onError?.(error);
        console.warn('Component props validation failed:', validation.errors);
        continue;
      }

      // Create component instance
      const componentId = `component-${components.length}`;
      const componentInstance: ComponentInstance = {
        id: componentId,
        name: componentName,
        component: componentDef.component,
        props,
        originalText: fullMatch,
      };

      components.push(componentInstance);

      // Replace component syntax with placeholder
      processedMarkdown = processedMarkdown.replace(
        fullMatch,
        `\n\n{{COMPONENT_PLACEHOLDER_${componentId}}}\n\n`
      );

    } catch (error) {
      const componentError: ComponentError = {
        componentName,
        error: error instanceof Error ? error : new Error(String(error)),
        props: propsJson,
      };
      onError?.(componentError);
      console.error('Error processing component:', error);
    }
  }

  return {
    markdown: processedMarkdown,
    components,
  };
}

/**
 * Inject component placeholders back into processed markdown
 * This is used by the renderer to know where to place components
 * 
 * We use a special marker that won't conflict with regular text
 * Note: Using inline code backticks to prevent markdown from processing the marker
 */
export function injectComponentPlaceholders(
  markdown: string,
  components: ComponentInstance[]
): string {
  let result = markdown;

  components.forEach((component) => {
    const placeholder = `{{COMPONENT_PLACEHOLDER_${component.id}}}`;
    // Use inline code to prevent markdown processing, but backticks will be stripped
    const componentMarker = `\`__COMPONENT__${component.id}__${component.name}__\``;

    // CRITICAL: Remove newlines around placeholders to ensure inline rendering
    // The AI might put component syntax on separate lines, but we want them inline
    const placeholderPatterns = [
      `\n\n${placeholder}\n\n`, // Blank lines before and after
      `\n${placeholder}\n`,     // Single newlines
      `\n\n${placeholder}`,     // Blank lines before only
      `${placeholder}\n\n`,     // Blank lines after only
      `\n${placeholder}`,       // Single newline before
      `${placeholder}\n`,       // Single newline after
      placeholder               // No newlines (fallback)
    ];

    let replaced = false;
    for (const pattern of placeholderPatterns) {
      if (result.includes(pattern)) {
        // Replace with marker that has NO surrounding newlines
        result = result.replace(pattern, componentMarker);
        replaced = true;
        console.log(`🔧 Injecting component marker (stripped newlines): ${componentMarker}`);
        break;
      }
    }

    if (!replaced) {
      // Fallback: just replace the placeholder directly
      result = result.replace(placeholder, componentMarker);
      console.log(`🔧 Injecting component marker (no newlines found): ${componentMarker}`);
    }
  });

  console.log('📄 Final markdown with placeholders:', result.substring(0, 500));
  console.log('📄 Full final markdown:', result);

  return result;
}

// Global variable to store last JSON cleanup for debugging
let lastJSONCleanupDebug: any = null;

export function getLastJSONCleanup() {
  return lastJSONCleanupDebug;
}

/**
 * Extract partial components (incomplete but parseable props)
 * This allows progressive field rendering during streaming
 */
export function extractPartialComponents(
  markdown: string,
  registry?: ComponentRegistry
): ProcessedMarkdown {
  if (!registry) {
    return { markdown, components: [] };
  }

  console.log('🔍 extractPartialComponents called with markdown:', markdown.substring(0, 200));

  const components: ComponentInstance[] = [];
  let processedMarkdown = markdown;
  lastJSONCleanupDebug = null; // Reset for this extraction
  let positionOffset = 0; // Track how positions shift after replacements

  // Pattern to find component start: {{c:"Name",p:
  const componentStartPattern = /\{\{c:\s*"([^"]+)"\s*,\s*p:\s*/g;

  let match;
  while ((match = componentStartPattern.exec(markdown)) !== null) {
    const componentName = match[1];
    console.log('🔍 Found component pattern:', componentName, 'at index:', match.index);
    const propsStartIndex = match.index + match[0].length;

    // Try to extract whatever JSON we have so far (might be incomplete)
    const remainingText = markdown.substring(propsStartIndex);
    const remainingTextUntrimmed = remainingText; // Store original before trim

    console.log('🔍 Remaining text analysis:', {
      propsStartIndex,
      remainingTextLength: remainingText.length,
      remainingTextPreview: remainingText.substring(0, 100),
      markdownTotalLength: markdown.length,
      expectedRemaining: markdown.length - propsStartIndex
    });

    // Find where the props object likely ends (look for }})
    let propsEndIndex = -1;
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < remainingText.length; i++) {
      const char = remainingText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;

        if (braceCount === 0) {
          propsEndIndex = i;
          break;
        }
      }
    }

    let propsJson: string;
    let isIncomplete = false;
    let originalPropsJson = ''; // For incomplete props tracking
    const cleanupSteps: any[] = [];

    if (propsEndIndex === -1) {
      // Props object is incomplete - try to close it and parse
      propsJson = remainingText.trim();
      originalPropsJson = propsJson; // Store for replacement calculation

      // Try to intelligently close the JSON
      // Count how many closing braces we need
      let needsClosing = braceCount; // braceCount will be > 0 if incomplete

      console.log('🔧 Cleaning incomplete JSON:', {
        original: originalPropsJson,
        inString,
        braceCount,
        needsClosing
      });

      // Also check if we're in the middle of a string value
      if (inString) {
        const before = propsJson;
        propsJson += '"'; // Close the string
        cleanupSteps.push({ step: 'Close string', before, after: propsJson });
        console.log('🔧 Closed string:', propsJson);
      }

      // Clean up incomplete field syntax

      // Remove trailing empty field name from closed string: ,"" or ,""
      const beforeEmptyFieldCleanup = propsJson;
      propsJson = propsJson.replace(/,\s*""\s*$/, ''); // Remove comma + empty quotes
      if (beforeEmptyFieldCleanup !== propsJson) {
        cleanupSteps.push({ step: 'Remove trailing empty field name', before: beforeEmptyFieldCleanup, after: propsJson });
        console.log('🔧 Removed trailing empty field name:', { before: beforeEmptyFieldCleanup, after: propsJson });
      }

      // Remove complete field name without colon/value: ,"n" or ,"name" (no colon after)
      const beforeCompleteFieldNoColonCleanup = propsJson;
      propsJson = propsJson.replace(/,\s*"[^"]+"\s*$/, ''); // Remove comma + complete field name (no colon)
      if (beforeCompleteFieldNoColonCleanup !== propsJson) {
        cleanupSteps.push({ step: 'Remove complete field name without colon', before: beforeCompleteFieldNoColonCleanup, after: propsJson });
        console.log('🔧 Removed complete field name without colon:', { before: beforeCompleteFieldNoColonCleanup, after: propsJson });
      }

      // Remove trailing incomplete field name: {"sym":"BTC","name or {"sym":"BTC","
      // Also handles: {"s or {"sym or {"
      const beforeFieldCleanup = propsJson;
      propsJson = propsJson.replace(/,\s*"[^"]*$/, ''); // Remove comma + incomplete field
      if (beforeFieldCleanup !== propsJson) {
        cleanupSteps.push({ step: 'Remove incomplete field after comma (no closing quote)', before: beforeFieldCleanup, after: propsJson });
        console.log('🔧 Removed incomplete field after comma:', { before: beforeFieldCleanup, after: propsJson });
      }

      // Remove incomplete field name at start: {" or {"s or {"sym or {"s" or {"sym"
      // This catches: opening brace + quote + anything that's not a valid field with colon
      const beforeStartFieldCleanup = propsJson;
      // Match: { + optional whitespace + " + any chars + optional " + NO colon after
      propsJson = propsJson.replace(/^\{\s*"[^"]*"?\s*$/, '{'); // Remove opening quote + incomplete field
      if (beforeStartFieldCleanup !== propsJson) {
        cleanupSteps.push({ step: 'Remove incomplete field at start (no colon)', before: beforeStartFieldCleanup, after: propsJson });
        console.log('🔧 Removed incomplete field at start (no colon):', { before: beforeStartFieldCleanup, after: propsJson });
      }

      // Remove field with colon at start (no value): {"sym": or {"name":
      const beforeStartColonCleanup = propsJson;
      propsJson = propsJson.replace(/^\{\s*"[^"]*"\s*:\s*$/, '{'); // Remove field name + colon at start
      if (beforeStartColonCleanup !== propsJson) {
        cleanupSteps.push({ step: 'Remove incomplete field at start (with colon)', before: beforeStartColonCleanup, after: propsJson });
        console.log('🔧 Removed incomplete field at start (with colon):', { before: beforeStartColonCleanup, after: propsJson });
      }

      // Remove trailing field with colon + incomplete value: {"sym":"BTC","name":
      const beforeColonCleanup = propsJson;
      propsJson = propsJson.replace(/,\s*"[^"]*"\s*:\s*$/, ''); // Remove field name and colon
      if (beforeColonCleanup !== propsJson) {
        cleanupSteps.push({ step: 'Remove incomplete field with colon after comma', before: beforeColonCleanup, after: propsJson });
        console.log('🔧 Removed incomplete field with colon after comma:', { before: beforeColonCleanup, after: propsJson });
      }

      // Remove trailing decimal point from numbers: 2. → 2, 45. → 45
      const beforeDecimalCleanup = propsJson;
      propsJson = propsJson.replace(/(\d)\.(?!\d)/g, '$1'); // Remove trailing decimal with no digits after
      if (beforeDecimalCleanup !== propsJson) {
        cleanupSteps.push({ step: 'Remove trailing decimal points', before: beforeDecimalCleanup, after: propsJson });
        console.log('🔧 Removed trailing decimal points:', { before: beforeDecimalCleanup, after: propsJson });
      }

      // Now remove any remaining trailing comma (with optional whitespace)
      const beforeCommaCleanup = propsJson;
      propsJson = propsJson.replace(/,\s*$/, ''); // Remove trailing comma + whitespace
      if (beforeCommaCleanup !== propsJson) {
        cleanupSteps.push({ step: 'Remove trailing comma', before: beforeCommaCleanup, after: propsJson });
        console.log('🔧 Removed trailing comma:', { before: beforeCommaCleanup, after: propsJson });
      }

      // Add closing braces
      const beforeClosingBraces = propsJson;

      // Special case: If original text ends with }}, only add 1 closing brace
      // This handles: {{c:"Name",p:{...}} where we need 1 more } for the props object
      if (originalPropsJson.endsWith('}}')) {
        console.log('🔧 Original ends with }}, only adding 1 closing brace');
        propsJson += '}';
        cleanupSteps.push({ step: 'Add 1 closing brace (text ends with }})', before: beforeClosingBraces, after: propsJson });
      } else {
        // Normal case: add all needed closing braces
        while (needsClosing > 0) {
          propsJson += '}';
          needsClosing--;
        }
        if (beforeClosingBraces !== propsJson) {
          cleanupSteps.push({ step: `Add ${propsJson.length - beforeClosingBraces.length} closing braces`, before: beforeClosingBraces, after: propsJson });
        }
      }

      isIncomplete = true;
      console.log('🔧 Final JSON to parse:', propsJson);

      // Store cleanup steps for debugging
      lastJSONCleanupDebug = {
        original: originalPropsJson,
        final: propsJson,
        steps: cleanupSteps,
        success: false, // Will update after parse attempt
      };
    } else {
      // Props object has closing brace
      propsJson = remainingText.substring(0, propsEndIndex + 1);
      console.log('✅ Props object is complete:', { componentName, propsJson: propsJson.substring(0, 100) });
    }

    try {
      const props = JSON.parse(propsJson);

      // Update cleanup debug info on success
      if (lastJSONCleanupDebug) {
        lastJSONCleanupDebug.success = true;
      }

      // Get component from registry
      const componentDef = registry.get(componentName);
      if (!componentDef) {
        console.warn(`Component '${componentName}' not found in registry`);
        continue;
      }

      // Determine what to replace in the original markdown
      let fullMatch: string;

      if (isIncomplete) {
        // For incomplete props, replace ALL of remainingText (untrimmed - includes trailing }})
        fullMatch = markdown.substring(match.index, match.index + match[0].length + remainingTextUntrimmed.length);
        console.log('🔧 Incomplete component match:', {
          matchStart: match.index,
          matchLength: match[0].length,
          remainingTextLength: remainingTextUntrimmed.length,
          fullMatchLength: fullMatch.length,
          fullMatch
        });
      } else {
        // Props object has closing brace - check if component is complete
        const afterPropsIndex = propsStartIndex + propsEndIndex + 1;
        const hasClosing = markdown.substring(afterPropsIndex, afterPropsIndex + 2) === '}}';

        if (hasClosing) {
          // This is a COMPLETE component - skip it, let extractComponents handle it
          console.log('✅ Component is complete, skipping in partial extraction:', componentName);
          continue;
        }

        // Props has closing brace but no }} - treat as partial
        // Include any trailing } characters that exist (might be partial component closing)
        let endIndex = afterPropsIndex;
        while (markdown[endIndex] === '}') {
          endIndex++;
        }

        fullMatch = markdown.substring(match.index, endIndex);
        console.log('🔧 Complete props but no }} match:', {
          matchStart: match.index,
          afterPropsIndex,
          endIndex,
          trailingBraces: endIndex - afterPropsIndex,
          fullMatchLength: fullMatch.length,
          fullMatch
        });
      }

      // Create partial component instance (don't validate - allow partial props)
      const componentId = `partial-component-${components.length}`;

      const componentInstance: ComponentInstance = {
        id: componentId,
        name: componentName,
        component: componentDef.component,
        props,
        originalText: fullMatch,
      };

      components.push(componentInstance);

      console.log('🔄 Partial component extracted:', {
        componentName,
        availableFields: Object.keys(props),
        fieldCount: Object.keys(props).length,
        isIncomplete
      });

      // Replace with placeholder marker
      // IMPORTANT: Adjust match.index by positionOffset since previous replacements shifted positions
      const marker = `\`__PARTIAL_COMPONENT__${componentId}__${componentName}__\``;
      const beforeReplacement = processedMarkdown;
      const matchIndexInProcessed = match.index + positionOffset;

      processedMarkdown =
        processedMarkdown.substring(0, matchIndexInProcessed) +
        marker +
        processedMarkdown.substring(matchIndexInProcessed + fullMatch.length);

      // Update offset: new marker length - old match length
      const lengthDelta = marker.length - fullMatch.length;
      positionOffset += lengthDelta;

      console.log('🔄 Replaced partial component:', {
        componentName,
        originalPosition: match.index,
        adjustedPosition: matchIndexInProcessed,
        positionOffset,
        lengthDelta,
        fullMatchLength: fullMatch.length,
        markerLength: marker.length,
        beforeLength: beforeReplacement.length,
        afterLength: processedMarkdown.length
      });

    } catch (error) {
      console.log('⏳ Props not yet parseable:', componentName, error);

      // Update cleanup debug info on failure
      if (lastJSONCleanupDebug) {
        lastJSONCleanupDebug.success = false;
        lastJSONCleanupDebug.error = error instanceof Error ? error.message : String(error);
      }

      continue;
    }
  }

  console.log('📊 extractPartialComponents result:', {
    componentsFound: components.length,
    resultMarkdown: processedMarkdown,
    resultMarkdownLength: processedMarkdown.length
  });

  return {
    markdown: processedMarkdown,
    components,
  };
}

/**
 * Extract component placeholders from processed markdown
 * Returns array of component IDs in order of appearance
 */
export function extractComponentOrder(markdown: string): string[] {
  const componentMarkerPattern = /<COMPONENT id="([^"]+)" name="[^"]+" \/>/g;
  const componentIds: string[] = [];

  let match;
  while ((match = componentMarkerPattern.exec(markdown)) !== null) {
    componentIds.push(match[1]);
  }

  return componentIds;
}

/**
 * Remove component markers from markdown (for text-only rendering)
 */
export function removeComponentMarkers(markdown: string): string {
  return markdown.replace(/<COMPONENT[^>]+\/>/g, '');
}

/**
 * Validate component syntax without processing
 * Useful for debugging and development
 */
export function validateComponentSyntax(markdown: string): {
  valid: boolean;
  errors: string[];
  components: string[];
} {
  const errors: string[] = [];
  const components: string[] = [];

  const componentStartPattern = /\{\{component:\s*"([^"]+)",\s*props:\s*/g;

  let match;
  while ((match = componentStartPattern.exec(markdown)) !== null) {
    const componentName = match[1];
    components.push(componentName);

    const propsStartIndex = match.index + match[0].length;
    const jsonResult = extractBalancedJSON(markdown, propsStartIndex);

    if (!jsonResult) {
      errors.push(`Component '${componentName}': Failed to extract props JSON`);
      continue;
    }

    // Validate JSON syntax
    try {
      JSON.parse(jsonResult.json);
    } catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      errors.push(`Component '${componentName}': Invalid JSON props - ${errorMessage}`);
    }

    // Check for closing }}
    const afterPropsIndex = jsonResult.endIndex;
    if (markdown.substring(afterPropsIndex, afterPropsIndex + 2) !== '}}') {
      errors.push(`Component '${componentName}': Missing closing }}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    components,
  };
}

/**
 * Get component statistics from markdown
 */
export function getComponentStats(markdown: string): {
  totalComponents: number;
  uniqueComponents: string[];
  componentCounts: Record<string, number>;
} {
  const componentCounts: Record<string, number> = {};
  const uniqueComponents: string[] = [];
  let totalComponents = 0;

  const componentStartPattern = /\{\{component:\s*"([^"]+)",\s*props:\s*/g;

  let match;
  while ((match = componentStartPattern.exec(markdown)) !== null) {
    const componentName = match[1];
    totalComponents++;

    if (!componentCounts[componentName]) {
      componentCounts[componentName] = 0;
      uniqueComponents.push(componentName);
    }
    componentCounts[componentName]++;
  }

  return {
    totalComponents,
    uniqueComponents,
    componentCounts,
  };
}
