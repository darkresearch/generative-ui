/**
 * Component Parser
 * 
 * Pure logic for parsing [{c:...}] component syntax.
 * No React dependencies - safe for testing.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Component data extracted from DSL syntax
 */
export interface ComponentData {
  name: string;
  props: Record<string, unknown>;
  /** CSS Grid-like style for layout (gridColumn, gridRow, etc.) */
  style?: Record<string, unknown>;
  children?: ComponentData[];
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert DSL-style JSON (with unquoted keys) to valid JSON.
 * e.g., {c:"Card",p:{}} -> {"c":"Card","p":{}}
 */
function normalizeToJSON(dsl: string): string {
  // Quote unquoted keys: c: -> "c":, p: -> "p":, children: -> "children":
  return dsl.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
}

/**
 * Close unclosed string values in JSON.
 * Enables progressive prop rendering (e.g., {"title":"On-call → {"title":"On-call")
 */
function closeUnclosedStrings(json: string): string {
  // Track if we're inside a string (accounting for escapes)
  let inString = false;
  
  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    const prevChar = i > 0 ? json[i - 1] : '';
    
    // Check for quote (not escaped)
    if (char === '"' && prevChar !== '\\') {
      inString = !inString;
    }
  }
  
  // If we ended inside a string, close it
  if (inString) {
    return json + '"';
  }
  
  return json;
}

/**
 * Try to repair and parse incomplete JSON by closing open braces/brackets.
 * Now also handles partial string values for progressive prop rendering.
 */
export function tryParseIncompleteJSON(json: string): unknown | null {
  // Normalize DSL syntax to valid JSON
  let normalized = normalizeToJSON(json);
  
  // First try direct parse
  try {
    return JSON.parse(normalized);
  } catch {
    let repaired = normalized;
    
    // Step 1: Close any unclosed string values
    // This enables progressive prop rendering (e.g., "title":"On → "title":"On")
    repaired = closeUnclosedStrings(repaired);
    
    // Step 2: Remove trailing comma (common in streaming)
    repaired = repaired.replace(/,\s*$/, '');
    
    // Step 3: Remove incomplete keys (no value started yet)
    // Match: comma, whitespace, quoted key, optional colon, then END
    // This removes ,"key" and ,"key": but NOT ,"key":"..." (already closed) or ,"key":123
    repaired = repaired.replace(/,\s*"[^"]*"\s*:?\s*$/g, '');
    
    // Step 4: Remove trailing commas before closing braces/brackets
    repaired = repaired.replace(/,\s*([}\]])/g, '$1');
    
    // Step 5: Count and close unbalanced braces/brackets
    let braceDepth = 0;
    let bracketDepth = 0;
    let inString = false;
    
    for (const char of repaired) {
      if (char === '"') {
        // Simple toggle - we've already closed unclosed strings
        inString = !inString;
      }
      if (!inString) {
        if (char === '{') braceDepth++;
        if (char === '}') braceDepth--;
        if (char === '[') bracketDepth++;
        if (char === ']') bracketDepth--;
      }
    }
    
    // Close brackets first (inner structures), then braces
    while (bracketDepth > 0) {
      repaired += ']';
      bracketDepth--;
    }
    while (braceDepth > 0) {
      repaired += '}';
      braceDepth--;
    }
    
    try {
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

/**
 * Recursively extract children from nested component arrays (complete JSON).
 */
export function extractChildrenRecursive(children: unknown[]): ComponentData[] {
  return children
    .filter((child): child is { c: string; p?: Record<string, unknown>; style?: Record<string, unknown>; children?: unknown[] } => 
      typeof child === 'object' && child !== null && 'c' in child
    )
    .map(child => ({
      name: child.c,
      props: child.p ?? {},
      style: child.style,
      children: child.children ? extractChildrenRecursive(child.children) : undefined,
    }));
}

/**
 * Find balanced closing brace/bracket position.
 * Returns -1 if not found (still streaming).
 */
function findBalancedClose(content: string, openChar: string, closeChar: string): number {
  let depth = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === openChar) depth++;
    if (content[i] === closeChar) {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

/**
 * Extract a single component's props and style from partial content.
 * Content should start at the opening { of the component.
 */
function extractSingleComponentData(content: string): { props: Record<string, unknown>; style?: Record<string, unknown> } {
  let props: Record<string, unknown> = {};
  let style: Record<string, unknown> | undefined;
  
  // Look for p:{...}
  const pMatch = content.match(/p:\s*/);
  if (pMatch) {
    const pStart = pMatch.index! + pMatch[0].length;
    const afterP = content.slice(pStart);
    const pEnd = findBalancedClose(afterP, '{', '}');
    
    if (pEnd > 0) {
      const pJson = afterP.slice(0, pEnd);
      const parsed = tryParseIncompleteJSON(pJson);
      if (parsed && typeof parsed === 'object') {
        props = parsed as Record<string, unknown>;
      }
    } else {
      // p is incomplete, try to repair
      const parsed = tryParseIncompleteJSON(afterP);
      if (parsed && typeof parsed === 'object') {
        props = parsed as Record<string, unknown>;
      }
    }
  }
  
  // Look for style:{...} (layout style, separate from props.style)
  const styleMatch = content.match(/,\s*style:\s*/);
  if (styleMatch) {
    const styleStart = styleMatch.index! + styleMatch[0].length;
    const afterStyle = content.slice(styleStart);
    const styleEnd = findBalancedClose(afterStyle, '{', '}');
    
    if (styleEnd > 0) {
      const styleJson = afterStyle.slice(0, styleEnd);
      const parsed = tryParseIncompleteJSON(styleJson);
      if (parsed && typeof parsed === 'object') {
        style = parsed as Record<string, unknown>;
      }
    }
  }
  
  return { props, style };
}

/**
 * Extract partial children from streaming content.
 * Finds all {c:"Name" patterns and extracts available data for each.
 */
function extractPartialChildren(childrenContent: string): ComponentData[] {
  const children: ComponentData[] = [];
  
  // Find all child component starts: {c:"Name"
  const childPattern = /\{c:\s*"([^"]+)"/g;
  let match;
  
  while ((match = childPattern.exec(childrenContent)) !== null) {
    const childName = match[1];
    const childStart = match.index;
    
    // Extract the content for this child (up to next child or end)
    const remainingContent = childrenContent.slice(childStart);
    
    // Find where this child ends (next {c:" or end of content)
    const nextChildMatch = remainingContent.slice(1).match(/\{c:\s*"/);
    const childContent = nextChildMatch 
      ? remainingContent.slice(0, nextChildMatch.index! + 1)
      : remainingContent;
    
    // Extract props and style for this child
    const { props, style } = extractSingleComponentData(childContent);
    
    // Recursively extract nested children if present
    let nestedChildren: ComponentData[] | undefined;
    const nestedChildrenMatch = childContent.match(/children:\s*\[/);
    if (nestedChildrenMatch) {
      const nestedStart = nestedChildrenMatch.index! + nestedChildrenMatch[0].length;
      const nestedContent = childContent.slice(nestedStart);
      nestedChildren = extractPartialChildren(nestedContent);
      if (nestedChildren.length === 0) nestedChildren = undefined;
    }
    
    children.push({
      name: childName,
      props,
      style,
      children: nestedChildren,
    });
  }
  
  return children;
}

// ============================================================================
// Main Parser
// ============================================================================

/**
 * Extract component data from DSL syntax.
 * Supports: [{c:"Name",p:{...},children:[...]}]
 * 
 * Works for both complete and streaming (partial) content.
 */
export function extractComponentData(content: string): ComponentData {
  const nameMatch = content.match(/\[\{c:\s*"([^"]+)"/);
  if (!nameMatch) {
    return { name: '', props: {} };
  }
  
  const name = nameMatch[1];
  let props: Record<string, unknown> = {};
  let children: ComponentData[] | undefined;
  let style: Record<string, unknown> | undefined;
  
  // Try to extract the full component object (complete JSON)
  const fullMatch = content.match(/\[\{([\s\S]*)\}\]/);
  
  if (fullMatch) {
    // Complete component - parse as JSON
    const innerJson = `{${fullMatch[1]}}`;
    const parsed = tryParseIncompleteJSON(innerJson) as Record<string, unknown> | null;
    
    if (parsed) {
      props = (parsed.p as Record<string, unknown>) ?? {};
      style = parsed.style as Record<string, unknown> | undefined;
      
      // Extract children if present
      if (Array.isArray(parsed.children)) {
        children = extractChildrenRecursive(parsed.children);
      }
    }
  } else {
    // Streaming - extract what we can from partial content
    const componentContent = content.slice(nameMatch.index! + nameMatch[0].length);
    
    // Extract props using shared helper
    const pMatch = componentContent.match(/,\s*p:\s*/);
    if (pMatch) {
      const pStart = pMatch.index! + pMatch[0].length;
      const afterP = componentContent.slice(pStart);
      const pEnd = findBalancedClose(afterP, '{', '}');
      
      if (pEnd > 0) {
        // Complete p:{...}
        const pJson = afterP.slice(0, pEnd);
        const parsed = tryParseIncompleteJSON(pJson);
        if (parsed && typeof parsed === 'object') {
          props = parsed as Record<string, unknown>;
        }
      } else {
        // Incomplete p - try to repair
        const parsed = tryParseIncompleteJSON(afterP);
        if (parsed && typeof parsed === 'object') {
          props = parsed as Record<string, unknown>;
        }
      }
    }
    
    // Extract layout style (top-level, not in props)
    const styleMatch = componentContent.match(/,\s*style:\s*\{/);
    if (styleMatch) {
      const styleStart = styleMatch.index! + styleMatch[0].length - 1; // Include the {
      const afterStyle = componentContent.slice(styleStart);
      const styleEnd = findBalancedClose(afterStyle, '{', '}');
      
      if (styleEnd > 0) {
        const styleJson = afterStyle.slice(0, styleEnd);
        const parsed = tryParseIncompleteJSON(styleJson);
        if (parsed && typeof parsed === 'object') {
          style = parsed as Record<string, unknown>;
        }
      }
    }
    
    // Extract children (even if partial)
    const childrenMatch = componentContent.match(/,\s*children:\s*\[/);
    if (childrenMatch) {
      const childrenStart = childrenMatch.index! + childrenMatch[0].length;
      const childrenContent = componentContent.slice(childrenStart);
      children = extractPartialChildren(childrenContent);
      if (children.length === 0) children = undefined;
    }
  }
  
  return { name, props, style, children };
}

