/**
 * Incomplete Markdown Parser
 * 
 * Handles incomplete markdown gracefully during streaming.
 * Inspired by Streamdown's approach but adapted for React Native.
 */

import { IncompleteTagState, INITIAL_INCOMPLETE_STATE, ComponentRegistry } from './types';



/**
 * Fix incomplete markdown by completing partial syntax
 * Now optimized to only process from earliest incomplete tag position
 */
export function fixIncompleteMarkdown(
  text: string,
  state?: IncompleteTagState,
  registry?: ComponentRegistry
): string {
  if (!text || text.length === 0) {
    return text;
  }

  // Always hide incomplete markers (even when stack is empty)
  text = hideIncompleteCodeBlockMarkers(text);
  text = hideIncompleteListMarkers(text);
  
  const { cleanText } = hideIncompleteComponents(text, registry);
  text = cleanText;

  // If we have state and no incomplete tags, skip completion processing
  if (state && state.stack.length === 0) {
    console.log('✅ No incomplete tags - skipping completion processing');
    return text;
  }

  // If we have state, we can skip processing text before earliestPosition
  const startPos = state ? state.earliestPosition : 0;
  
  // Only process the portion that needs fixing
  if (startPos > 0 && startPos < text.length) {
    const unchangedPart = text.substring(0, startPos);
    const needsFixing = text.substring(startPos);
    
    console.log('🔄 Performance: Only processing from position', startPos, 
                'out of', text.length, 'characters');
    
    return unchangedPart + processMarkdown(needsFixing, true, state?.inCodeBlock || false, registry);
  }

  return processMarkdown(text, true, state?.inCodeBlock || false, registry);
}

/**
 * Process markdown text (original fixIncompleteMarkdown logic)
 * @param skipHiding - if true, skip hiding logic (already done in parent)
 * @param inCodeBlock - if true, skip all markdown fixes except code block fixes
 */
function processMarkdown(text: string, skipHiding = false, inCodeBlock = false, registry?: ComponentRegistry): string {
  if (!text || text.length === 0) {
    return text;
  }

  let processedText = text;

  if (!skipHiding) {
    // Hide incomplete code block markers FIRST
    processedText = hideIncompleteCodeBlockMarkers(processedText);
    
    // Hide incomplete list markers (before components, so components can still use them)
    processedText = hideIncompleteListMarkers(processedText);

    // Hide incomplete component syntax
    const { cleanText, bufferedComponent } = hideIncompleteComponents(processedText, registry);
    processedText = cleanText;
    
    // Log if we're buffering anything
    if (bufferedComponent) {
      console.log('🚫 Hiding incomplete component from display');
    }
  }

  // If we're inside a code block, skip all markdown fixes (code is raw)
  if (inCodeBlock) {
    // Only fix code blocks themselves
    processedText = fixIncompleteCodeBlock(processedText);
    return processedText;
  }

  // Fix incomplete bold text - but only if it's truly incomplete
  // Check if the text has unmatched ** at the beginning
  processedText = fixIncompleteBold(processedText);

  // Fix incomplete italic text (must check after bold to avoid conflicts)
  processedText = fixIncompleteItalic(processedText);

  // Fix incomplete inline code
  processedText = fixIncompleteCode(processedText);

  // Fix incomplete code blocks
  processedText = fixIncompleteCodeBlock(processedText);

  // Fix incomplete links
  processedText = fixIncompleteLink(processedText);

  // Handle incomplete lists - ensure proper line breaks
  processedText = fixIncompleteList(processedText);

  // Handle incomplete headings - ensure proper line breaks
  processedText = fixIncompleteHeadings(processedText);

  return processedText;
}

/**
 * Hide incomplete code block markers (`, ``, or ``` at the end without content)
 */
function hideIncompleteCodeBlockMarkers(text: string): string {
  // Check if text ends with 1, 2, or 3 backticks
  const match = text.match(/(```?)$/);
  
  if (match) {
    const backticks = match[1];
    
    // Only hide if it's JUST the backticks (no language identifier yet)
    // This allows ```j to show the code block starting to form
    if (backticks.length <= 3) {
      const beforeBackticks = text.substring(0, text.length - backticks.length);
      console.log(`🚫 Hiding incomplete code block markers: "${backticks}"`);
      return beforeBackticks;
    }
  }
  
  return text;
}

/**
 * Hide incomplete list markers (- or + at end of line without space)
 * Only hide if the marker is at the end of a line and not followed by a space
 * This prevents "-" and "+" from being parsed as list items until "- " or "+ " is typed
 * IMPORTANT: Preserves horizontal rules (---, ***, ___) which are three or more dashes/asterisks/underscores
 */
function hideIncompleteListMarkers(text: string): string {
  // Normalize em-dashes (—) and en-dashes (–) to regular hyphens (-) for horizontal rules
  // iOS keyboard auto-converts hyphens to em-dashes, but markdown horizontal rules require regular hyphens
  // Only normalize on lines that could be horizontal rules (to avoid breaking actual em-dashes in content)
  const lines = text.split('\n');
  const normalizedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Check if line looks like a horizontal rule (only dashes/asterisks/underscores, optionally with whitespace)
    // If so, normalize em-dashes and en-dashes to regular hyphens
    // Note: em-dash (—) U+2014, en-dash (–) U+2013, hyphen (-) U+002D
    if (/^\s*[-—–*_]+\s*$/.test(line)) {
      // This line could be a horizontal rule - normalize Unicode dashes to ASCII hyphens
      line = line.replace(/[—–]/g, '-'); // Replace em-dash (—) and en-dash (–) with regular hyphen (-)
    }
    normalizedLines.push(line);
  }
  
  // Split into lines to check each line
  const processedLines: string[] = [];
  
  for (let i = 0; i < normalizedLines.length; i++) {
    let line = normalizedLines[i];
    const isLastLine = i === normalizedLines.length - 1;
    
    // Check if this line is a horizontal rule (three or more dashes, asterisks, or underscores)
    // Horizontal rules: ---, ***, ___ (three or more, optionally with leading whitespace)
    // Match: optional whitespace, then three or more of the same character (-, *, or _)
    const horizontalRuleMatch = line.match(/^\s*([-*_])\1{2,}\s*$/);
    
    if (horizontalRuleMatch) {
      // This is a horizontal rule - preserve it
      processedLines.push(line);
      continue;
    }
    
    // Check if line ends with "-" or "+" (not followed by space)
    // Only hide if it's at the end of the line (or end of text)
    // IMPORTANT: Don't hide single "-" if it could be part of a horizontal rule (---)
    // We need to allow users to type three dashes without hiding them prematurely
    if (isLastLine) {
      // For the last line, check if it ends with "-" or "+" without space after
      // But only if it's a single dash/plus (not part of a horizontal rule)
      // CRITICAL: Don't hide single "-" because it could be the start of "---"
      // Only hide "+" for incomplete list markers
      const singlePlusMatch = line.match(/^(\s*)\+$/);
      
      if (singlePlusMatch) {
        // Hide the "+" marker - remove it (but NOT "-" because it could be part of "---")
        const beforeMarker = line.substring(0, line.length - 1);
        processedLines.push(beforeMarker);
        continue;
      }
    }
    
    processedLines.push(line);
  }
  
  return processedLines.join('\n');
}

/**
 * Hide incomplete component syntax and insert skeleton placeholders
 * Returns the text with skeleton markers for incomplete components
 */
function hideIncompleteComponents(text: string, registry?: ComponentRegistry): { cleanText: string; bufferedComponent: string } {
  // Find the last occurrence of {{ (any component start, not just {{c:)
  const lastComponentStart = text.lastIndexOf('{{');
  
  // Check if the last {{ is complete
  let lastComponentIsComplete = false;
  
  if (lastComponentStart !== -1) {
    const textAfterComponentStart = text.substring(lastComponentStart);
    
    // Quick check: does it have closing }}?
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < textAfterComponentStart.length; i++) {
      const char = textAfterComponentStart[i];
      const nextChar = textAfterComponentStart[i + 1];
      
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
        
        if (braceCount === 1 && nextChar === '}') {
          lastComponentIsComplete = true;
          break;
        }
      }
    }
  }
  
  // Hide single trailing { if no unclosed component
  if (text.endsWith('{') && !text.endsWith('{{') && (lastComponentStart === -1 || lastComponentIsComplete)) {
    console.log('🚫 Hiding single trailing {');
    return { cleanText: text.slice(0, -1), bufferedComponent: '{' };
  }
  
  if (lastComponentStart === -1) {
    // No component syntax found
    return { cleanText: text, bufferedComponent: '' };
  }
  
  // Re-check completion (we already did this above, but keep for clarity)
  const textAfterComponentStart = text.substring(lastComponentStart);
  
  // Count braces to find matching closing }}
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let foundClosing = false;
  
  for (let i = 0; i < textAfterComponentStart.length; i++) {
    const char = textAfterComponentStart[i];
    const nextChar = textAfterComponentStart[i + 1];
    
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
      
      // Check if this is the closing }} (two consecutive })
      // When braceCount hits 1, we're at the first } of the final }}
      if (braceCount === 1 && nextChar === '}') {
        foundClosing = true;
        break;
      }
    }
  }
  
  if (foundClosing) {
    // Component is complete, don't hide anything
    console.log('✅ Complete component found, not hiding');
    return { cleanText: text, bufferedComponent: '' };
  }
  
  // Component is incomplete - try to extract component name and insert skeleton
  const bufferedComponent = text.substring(lastComponentStart);
  let cleanText = text.substring(0, lastComponentStart);
  
  console.log('🔒 Buffering incomplete component:', {
    cleanText: cleanText.substring(Math.max(0, cleanText.length - 50)),
    bufferLength: bufferedComponent.length,
    bufferPreview: bufferedComponent.substring(0, 100)
  });
  
  // Try to extract component name from incomplete syntax: {{c:"ComponentName"
  const componentNameMatch = bufferedComponent.match(/^\{\{c:\s*"([^"]+)"/);
  
  if (componentNameMatch && registry) {
    const componentName = componentNameMatch[1];
    const componentDef = registry.get(componentName);
    
    if (componentDef) {
      // Check if we've started the props section: {{c:"Name",p:{
      const hasPropsStart = /^\{\{c:\s*"[^"]+"\s*,\s*p:\s*\{/.test(bufferedComponent);
      
      // Always insert empty component marker
      // It will be replaced by partial component marker once JSON becomes parseable
      const emptyComponentMarker = `\`__EMPTY_COMPONENT__${componentName}__\``;
      cleanText = cleanText + emptyComponentMarker;
      
      if (hasPropsStart) {
        console.log('💀 Inserting empty component marker (props started, waiting for parseable JSON):', componentName);
      } else {
        console.log('💀 Inserting empty component marker (props not started yet):', componentName);
      }
    }
  }
  
  return { cleanText, bufferedComponent };
}

/**
 * Fix incomplete bold text by checking for truly unmatched ** pairs
 * Handles streaming cases where ** appears at the end or has content without closing
 */
function fixIncompleteBold(text: string): string {
  // Find all ** occurrences
  const boldMarkers = [];
  let index = 0;
  while ((index = text.indexOf('**', index)) !== -1) {
    boldMarkers.push(index);
    index += 2;
  }
  
  // If we have an odd number of **, the last one is unclosed
  if (boldMarkers.length % 2 === 1) {
    // Get the position of the last unclosed **
    const lastMarkerPos = boldMarkers[boldMarkers.length - 1];
    const textAfterLastMarker = text.substring(lastMarkerPos + 2);
    
    // Check if text ends with ** (no content after)
    if (text.endsWith('**') && textAfterLastMarker.length === 0) {
      // Complete with zero-width space: **\u200B** (empty bold = invisible)
      return text + '\u200B**';
    }
    
    // If there's content after the last **, complete it
    if (textAfterLastMarker.trim().length > 0) {
      // Check if text ends with a single * (likely the first * of closing **)
      // Remove it before adding the closing **
      let contentToClose = textAfterLastMarker;
      if (text.endsWith('*') && !text.endsWith('**') && !text.endsWith('***')) {
        // Remove the trailing single *
        contentToClose = textAfterLastMarker.slice(0, -1);
      }
      
      // Insert closing ** before any trailing whitespace
      const trimmed = contentToClose.trimEnd();
      const trailingWhitespace = contentToClose.substring(trimmed.length);
      const beforeWhitespace = text.substring(0, lastMarkerPos + 2 + trimmed.length);
      
      return beforeWhitespace + '**' + trailingWhitespace;
    }
  }
  
  return text;
}

/**
 * Fix incomplete italic text by checking for unmatched * pairs
 * Must be called after fixIncompleteBold to avoid conflicts
 * Handles streaming cases where * appears at the end or has content without closing
 * IMPORTANT: Skips list markers (* at start of line) to avoid interfering with list parsing
 */
function fixIncompleteItalic(text: string): string {
  // Split into lines to check for list markers
  const lines = text.split('\n');
  const processedLines: string[] = [];
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let line = lines[lineIndex];
    
    // Skip italic processing if this line starts with a list marker (*, -, +)
    // List markers are: * at start of line (with optional leading whitespace) followed by space
    const isListMarker = /^\s*[-*+]\s+/.test(line);
    
    if (isListMarker) {
      // This is a list item - don't process italic markers
      processedLines.push(line);
      continue;
    }
    
    // Process italic markers for non-list lines
  // First, check if text ends with a single * (not part of **)
    if (line.endsWith('*') && !line.endsWith('**')) {
    // Count all single * that aren't part of **
    const singleStars: number[] = [];
    let index = 0;
      while (index < line.length) {
        if (line[index] === '*') {
        // Check if this is part of **
          if (index < line.length - 1 && line[index + 1] === '*') {
          index += 2; // Skip both stars
          continue;
        }
        singleStars.push(index);
      }
      index++;
    }
    
    // If we have an odd number of single *, the last one is unclosed
    if (singleStars.length % 2 === 1) {
      const lastStarPos = singleStars[singleStars.length - 1];
        const textAfterLastStar = line.substring(lastStarPos + 1);
      
      // If text ends with * and no content after, complete with zero-width space
      if (textAfterLastStar.length === 0) {
          line = line + '\u200B*';
        } else if (textAfterLastStar.trim().length > 0) {
      // If there's content after the last *, complete it normally
          line = line + '*';
      }
    }
  }
  
  // Handle incomplete italic with content: *text without closing *
  // Use regex that doesn't match **
    line = line.replace(
    /(?<!\*)\*([^*]+)$/,
    (match, content) => {
      // Double-check this isn't part of ** by checking the match position
        const matchIndex = line.lastIndexOf(match);
        if (matchIndex > 0 && line[matchIndex - 1] === '*') {
        return match; // It's part of **, don't change
      }
      
      // Check if there's already a closing * in the content
      if (content.includes('*')) {
        return match; // Already closed, don't add another
      }
      
      // Insert closing * before trailing whitespace
      const trimmed = content.trimEnd();
      const trailingWhitespace = content.substring(trimmed.length);
      return '*' + trimmed + '*' + trailingWhitespace;
    }
  );
    
    processedLines.push(line);
  }
  
  return processedLines.join('\n');
}

/**
 * Fix incomplete inline code by checking for unmatched ` pairs
 * Handles streaming cases where ` appears at the end or has content without closing
 */
function fixIncompleteCode(text: string): string {
  // Check if text ends with a single ` (not part of ```)
  if (text.endsWith('`') && !text.endsWith('```')) {
    // Count all single ` that aren't part of ```
    const singleBackticks: number[] = [];
    let index = 0;
    while (index < text.length) {
      if (text[index] === '`') {
        // Check if this is part of ```
        if (index < text.length - 2 && text[index + 1] === '`' && text[index + 2] === '`') {
          index += 3; // Skip all three backticks
          continue;
        }
        singleBackticks.push(index);
      }
      index++;
    }
    
    // If we have an odd number of single `, the last one is unclosed
    if (singleBackticks.length % 2 === 1) {
      const lastBacktickPos = singleBackticks[singleBackticks.length - 1];
      const textAfterLastBacktick = text.substring(lastBacktickPos + 1);
      
      // If text ends with ` and no content after, complete with zero-width space
      if (textAfterLastBacktick.length === 0) {
        return text + '\u200B`';
      }
      
      // If there's content after the last `, complete it normally
      if (textAfterLastBacktick.trim().length > 0) {
        return text + '`';
      }
    }
  }
  
  // Handle incomplete code with content: `code without closing `
  // Use regex that doesn't match ```
  return text.replace(
    /(?<!`)`([^`]+)$/,
    (match, content) => {
      // Double-check this isn't part of ``` by checking the match position
      const matchIndex = text.lastIndexOf(match);
      if (matchIndex > 0 && text[matchIndex - 1] === '`') {
        return match; // Part of ```, don't change
      }
      
      // Check if there's already a closing ` in the content
      if (content.includes('`')) {
        return match; // Already closed, don't add another
      }
      
      // Insert closing ` before trailing whitespace
      const trimmed = content.trimEnd();
      const trailingWhitespace = content.substring(trimmed.length);
      return '`' + trimmed + '`' + trailingWhitespace;
    }
  );
}

/**
 * Fix incomplete code blocks by checking for unmatched ``` pairs
 * Handles streaming cases where ``` appears at the end or has content without closing
 */
function fixIncompleteCodeBlock(text: string): string {
  // Find all ``` occurrences
  const codeBlockMarkers: number[] = [];
  let index = 0;
  while ((index = text.indexOf('```', index)) !== -1) {
    codeBlockMarkers.push(index);
    index += 3;
  }
  
  // If we have an odd number of ```, the last one is unclosed
  if (codeBlockMarkers.length % 2 === 1) {
    const lastMarkerPos = codeBlockMarkers[codeBlockMarkers.length - 1];
    const textAfterLastMarker = text.substring(lastMarkerPos + 3);
    
    // Check if text ends with ``` (no content after)
    if (text.endsWith('```') && textAfterLastMarker.length === 0) {
      // Complete with zero-width space: ```\u200B``` (empty code block = invisible)
      return text + '\u200B```';
    }
    
    // If there's content after the last ```, complete it
    if (textAfterLastMarker.trim().length > 0) {
      const hasNewline = textAfterLastMarker.includes('\n');
      
      if (!hasNewline) {
        // Has language but no newline yet - add newline to show code block
        return text + '\n```';
      }
      
      // Has newline and content - complete normally
      return text + '\n```';
    }
  }
  
  return text;
}

/**
 * Fix incomplete links by checking for unmatched [text](url patterns
 * Handles streaming cases where link syntax is incomplete
 */
function fixIncompleteLink(text: string): string {
  // Find the last opening [ in the text
  let lastOpenBracket = -1;
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === '[' && (i === 0 || text[i - 1] !== '\\')) {
      lastOpenBracket = i;
      break;
    }
  }
  
  if (lastOpenBracket === -1) {
    return text; // No unclosed bracket found
  }
  
  const afterBracket = text.substring(lastOpenBracket);
  
  // Check if we have [text] with ( after
  const withParenMatch = afterBracket.match(/^\[([^\]]*)\]\(/);
  if (withParenMatch) {
    // Has [text]( - check for closing )
    const afterParen = text.substring(lastOpenBracket + withParenMatch[0].length);
    if (!afterParen.includes(')')) {
      // No closing ) - add it
      return text + ')';
    }
    return text;
  }
  
  // Check if we have [text] without (
  const withClosingBracketMatch = afterBracket.match(/^\[([^\]]*)\]([^(]*)$/);
  if (withClosingBracketMatch) {
    // Has [text] but no ( - complete to [text]()
    return text + '()';
  }
  
  // Check if we have [text without closing ]
  const withoutClosingBracketMatch = afterBracket.match(/^\[([^\]]*)$/);
  if (withoutClosingBracketMatch) {
    // Has [text - complete to [text]()
    return text + ']()';
  }
  
  return text;
}

/**
 * Fix incomplete list formatting
 */
function fixIncompleteList(text: string): string {
  const lines = text.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    // Check if this is a list item
    const listMatch = line.match(/^(\s*)([-*+])(\s+)(.+)$/);
    
    if (listMatch) {
      processedLines.push(line);
      
      // If next line exists and is not a list item or empty, add spacing
      if (nextLine !== undefined && 
          !nextLine.match(/^(\s*)([-*+])(\s+)/) && 
          nextLine.trim() !== '') {
        // Add an empty line after the list if the next line is not part of the list
        if (i === lines.length - 1 || !nextLine.match(/^(\s*)([-*+])(\s+)/)) {
          processedLines.push('');
        }
      }
    } else {
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

/**
 * Fix incomplete heading formatting
 */
function fixIncompleteHeadings(text: string): string {
  const lines = text.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    // Check if this is a heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      processedLines.push(line);
      
      // Ensure proper spacing after headings
      if (nextLine !== undefined && nextLine.trim() !== '') {
        processedLines.push('');
      }
    } else {
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

/**
 * Check if markdown appears to be incomplete (still streaming)
 */
export function isMarkdownIncomplete(text: string): boolean {
  if (!text || text.length === 0) {
    return false;
  }

  // Check for incomplete bold (odd number of ** markers)
  const boldMarkers = (text.match(/\*\*/g) || []).length;
  if (boldMarkers % 2 === 1) {
    return true;
  }

  // Check for incomplete italic (odd number of single * not part of **)
  let singleStars = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '*') {
      // Check if this is part of **
      if (i < text.length - 1 && text[i + 1] === '*') {
        i++; // Skip the next * too
        continue;
      }
      singleStars++;
    }
  }
  if (singleStars % 2 === 1) {
    return true;
  }

  // Check for incomplete inline code (odd number of single ` not part of ```)
  let singleBackticks = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '`') {
      // Check if this is part of ```
      if (i < text.length - 2 && text[i + 1] === '`' && text[i + 2] === '`') {
        i += 2; // Skip the next two backticks too
        continue;
      }
      singleBackticks++;
    }
  }
  if (singleBackticks % 2 === 1) {
    return true;
  }

  // Check for incomplete code blocks (odd number of ``` markers)
  const codeBlockMarkers = (text.match(/```/g) || []).length;
  if (codeBlockMarkers % 2 === 1) {
    return true;
  }

  // Check for incomplete links [text](url without closing )
  const linkPattern = /\[([^\]]+)\]\(([^)]+)$/;
  if (linkPattern.test(text)) {
    return true;
  }

  // Check for incomplete components using the same logic as hideIncompleteComponents
  const lastComponentStart = text.lastIndexOf('{{c:');
  if (lastComponentStart !== -1) {
    const textAfterComponentStart = text.substring(lastComponentStart);
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let foundClosing = false;
    
    for (let i = 0; i < textAfterComponentStart.length; i++) {
      const char = textAfterComponentStart[i];
      const nextChar = textAfterComponentStart[i + 1];
      
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
        if (braceCount === 1 && nextChar === '}') {
          foundClosing = true;
          break;
        }
      }
    }
    
    if (!foundClosing) {
      return true;
    }
  }

  return false;
}

/**
 * Sanitize markdown for safe rendering
 */
export function sanitizeMarkdown(text: string): string {
  // Remove potentially dangerous HTML tags while preserving markdown
  const dangerousTags = /<(script|iframe|object|embed|form|input)[^>]*>.*?<\/\1>/gi;
  return text.replace(dangerousTags, '');
}

/**
 * Update incomplete tag state incrementally based on new characters
 * @param state Current state
 * @param newText New complete text
 * @returns Updated state
 */
export function updateIncompleteTagState(
  state: IncompleteTagState,
  newText: string
): IncompleteTagState {
  // If text length decreased (stepping backward), reset and rebuild from scratch
  if (newText.length < state.previousTextLength) {
    console.log('🔄 Text length decreased - resetting state and rebuilding from scratch');
    // Reset to initial state and rebuild incrementally
    let resetState = INITIAL_INCOMPLETE_STATE;
    // Rebuild state character by character up to new length
    // This is safe because we're always building forward, never backward
    for (let i = 0; i < newText.length; i++) {
      const incrementalText = newText.substring(0, i + 1);
      const incrementalChars = incrementalText.slice(resetState.previousTextLength);
      if (incrementalChars.length > 0) {
        // Process the incremental characters
        resetState = processCharacterUpdates(resetState, incrementalText, incrementalChars);
      }
    }
    return resetState;
  }
  
  // Extract new characters that were added
  const newChars = newText.slice(state.previousTextLength);
  
  if (newChars.length === 0) {
    // No new characters, return state unchanged
    return state;
  }
  
  // Process the new characters
  return processCharacterUpdates(state, newText, newChars);
}

/**
 * Process character updates and update state accordingly
 * This is extracted to avoid recursion when rebuilding state
 */
function processCharacterUpdates(
  state: IncompleteTagState,
  fullText: string,
  newChars: string
): IncompleteTagState {
  // Start with current state
  let stack = [...state.stack];
  let tagCounts = { ...state.tagCounts };
  let inCodeBlock = state.inCodeBlock;
  let inInlineCode = state.inInlineCode;
  
  // CRITICAL: If we're already in a code block, clean up any invalid tags first
  if (inCodeBlock) {
    const nonCodeBlockTags = stack.filter(tag => tag.type !== 'codeBlock');
    if (nonCodeBlockTags.length > 0) {
      console.log('🧹 Pre-cleanup: Removing tags found at start of processing (inCodeBlock=true):', nonCodeBlockTags.map(t => t.type));
      stack = stack.filter(tag => tag.type === 'codeBlock');
      tagCounts = { ...tagCounts, bold: 0, italic: 0, code: 0, link: 0, component: 0 };
    }
  }
  
  // Process each new character
  for (let i = 0; i < newChars.length; i++) {
    const position = state.previousTextLength + i;
    const char = newChars[i];
    const prevChar = i > 0 ? newChars[i - 1] : (state.previousTextLength > 0 ? fullText[position - 1] : '');
    const nextChar = newChars[i + 1];
    const nextChar2 = newChars[i + 2];
    
    // Check for opening markers
    
    // Code blocks: ``` (check for 3 backticks)
    // This is the ONLY markdown processing we do inside code blocks
    if (char === '`' && nextChar === '`' && nextChar2 === '`') {
      // Check if this closes an existing code block (LIFO - find last occurrence)
      const codeBlockIndex = stack.map((tag, idx) => tag.type === 'codeBlock' ? idx : -1)
        .filter(idx => idx !== -1)
        .pop();
      if (codeBlockIndex !== undefined && codeBlockIndex !== -1) {
        // Close the most recent code block
        stack.splice(codeBlockIndex, 1);
        tagCounts.codeBlock--;
        inCodeBlock = false; // Exit code block context
      } else {
        // Open new code block - remove any incomplete tags that shouldn't be in code blocks
        // Clean up any markdown tags that were opened before entering code block
        const tagsToRemove = stack.filter(tag => tag.type !== 'codeBlock');
        if (tagsToRemove.length > 0) {
          console.log('🧹 Cleaning up tags before entering code block:', tagsToRemove.map(t => t.type));
        }
        stack = stack.filter(tag => tag.type === 'codeBlock');
        tagCounts = { ...tagCounts, bold: 0, italic: 0, code: 0, link: 0, component: 0 };
        inInlineCode = false; // Reset inline code when entering code block
        
        stack.push({
          type: 'codeBlock',
          position,
          marker: '```',
          openingText: fullText.slice(Math.max(0, position - 10), position + 13),
        });
        tagCounts.codeBlock++;
        inCodeBlock = true; // Enter code block context
        console.log('📦 Entered code block at position', position, '- inCodeBlock:', inCodeBlock);
      }
      i += 2; // Skip next 2 characters
      continue;
    }
    
    // If we're inside a code block, skip ALL other markdown processing
    if (inCodeBlock) {
      // Safety check: remove any markdown tags that shouldn't be in code blocks
      // This handles edge cases where tags might have been added before inCodeBlock was set
      const nonCodeBlockTags = stack.filter(tag => tag.type !== 'codeBlock');
      if (nonCodeBlockTags.length > 0) {
        console.log('🧹 Removing tags found inside code block:', nonCodeBlockTags.map(t => t.type));
        stack = stack.filter(tag => tag.type === 'codeBlock');
        tagCounts = { ...tagCounts, bold: 0, italic: 0, code: 0, link: 0, component: 0 };
      }
      continue;
    }
    
    // Bold: ** (check for 2 asterisks) - skip if in code block
    if (char === '*' && !inCodeBlock) {
      // Check if this is part of a ** pair
      const isBoldOpening = nextChar === '*' && prevChar !== '*';
      const isBoldClosing = prevChar === '*' && nextChar !== '*';
      
      if (isBoldOpening || isBoldClosing) {
        // If we're the second * of an opening **, we might have an italic from the first *
        // Remove it if present
        if (isBoldClosing) {
          const italicAtPrevPos = stack.findIndex(tag => tag.type === 'italic' && tag.position === position - 1);
          if (italicAtPrevPos !== -1) {
            stack.splice(italicAtPrevPos, 1);
            tagCounts.italic--;
          }
        }
        
        // Check if this closes an existing bold (LIFO - find last occurrence)
        const boldIndex = stack.map((tag, idx) => tag.type === 'bold' ? idx : -1)
          .filter(idx => idx !== -1)
          .pop();
        if (boldIndex !== undefined && boldIndex !== -1) {
          // Close the most recent bold
          stack.splice(boldIndex, 1);
          tagCounts.bold--;
        } else if (isBoldOpening) {
          // Open new bold
          stack.push({
            type: 'bold',
            position,
            marker: '**',
            openingText: fullText.slice(Math.max(0, position - 10), position + 12),
          });
          tagCounts.bold++;
        } else if (isBoldClosing) {
          // We're closing a bold that doesn't exist, but we should open one
          // This happens when streaming "**" as two separate calls
          stack.push({
            type: 'bold',
            position: position - 1,
            marker: '**',
            openingText: fullText.slice(Math.max(0, position - 11), position + 11),
          });
          tagCounts.bold++;
        }
        
        if (isBoldOpening) {
          i += 1; // Skip next character
        }
        continue;
      }
    }
    
    // Inline code: ` (single backtick, but skip if it's part of ```)
    if (char === '`') {
      // Skip if this is part of a ``` sequence
      const isPartOfCodeBlock = (nextChar === '`' && nextChar2 === '`') || 
                                (prevChar === '`' && nextChar === '`') ||
                                (prevChar === '`' && (i >= 2 ? newChars[i - 2] : fullText[position - 2]) === '`');
      
      if (!isPartOfCodeBlock) {
        // Check if this closes an existing code (LIFO - find last occurrence)
        const codeIndex = stack.map((tag, idx) => tag.type === 'code' ? idx : -1)
          .filter(idx => idx !== -1)
          .pop();
        if (codeIndex !== undefined && codeIndex !== -1) {
          // Close the most recent code
          stack.splice(codeIndex, 1);
          tagCounts.code--;
          inInlineCode = false; // Exit inline code context
        } else {
          // Open new code
          stack.push({
            type: 'code',
            position,
            marker: '`',
            openingText: fullText.slice(Math.max(0, position - 10), position + 11),
          });
          tagCounts.code++;
          inInlineCode = true; // Enter inline code context
        }
        continue;
      }
    }
    
    // Italic: * (single asterisk, not part of **) - skip if in code block
    if (char === '*' && prevChar !== '*' && nextChar !== '*' && !inCodeBlock) {
      // Check if there's an unclosed bold tag AND prev char is not whitespace
      // This means it's likely the first * of a closing **
      const hasBoldTag = stack.some(tag => tag.type === 'bold');
      const prevIsWhitespace = prevChar === ' ' || prevChar === '\n' || prevChar === '\t' || prevChar === '';
      
      if (hasBoldTag && !prevIsWhitespace) {
        // Don't add - this is likely the first * of a closing **
        // Skip processing this character
        continue;
      }
      
      // Check if this closes an existing italic (LIFO - find last occurrence)
      const italicIndex = stack.map((tag, idx) => tag.type === 'italic' ? idx : -1)
        .filter(idx => idx !== -1)
        .pop();
      if (italicIndex !== undefined && italicIndex !== -1) {
        // Close the most recent italic
        stack.splice(italicIndex, 1);
        tagCounts.italic--;
      } else {
        // Open new italic
        stack.push({
          type: 'italic',
          position,
          marker: '*',
          openingText: fullText.slice(Math.max(0, position - 10), position + 11),
        });
        tagCounts.italic++;
      }
      continue;
    }
    
    // Links: [ (but only if NOT in code context)
    if (char === '[' && !inCodeBlock && !inInlineCode) {
      // Open new link
      console.log('🔗 Opening link at position', position, '- inCodeBlock:', inCodeBlock, '- inInlineCode:', inInlineCode);
      stack.push({
        type: 'link',
        position,
        marker: '[',
        openingText: fullText.slice(Math.max(0, position - 10), position + 11),
      });
      tagCounts.link++;
      continue;
    }
    
    // Debug: log if we're trying to process a [ inside a code block
    if (char === '[' && inCodeBlock) {
      console.log('⚠️ Ignoring [ at position', position, '- inside code block');
    }
    
    // Links: closing ) after ] - skip if in code block
    if (char === ')' && !inCodeBlock) {
      // Find most recent link
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].type === 'link') {
          // Check if there's a ] before this )
          const textBetween = fullText.slice(stack[j].position, position + 1);
          if (textBetween.includes('](')) {
            // Complete link found
            stack.splice(j, 1);
            tagCounts.link--;
            break;
          }
        }
      }
      continue;
    }
    
    // Components: {{ (but only if NOT in code context)
    if (char === '{' && nextChar === '{' && !inCodeBlock && !inInlineCode) {
      // Track ANY {{ as potential component when not in code
      stack.push({
        type: 'component',
        position,
        marker: '{{',
        openingText: fullText.slice(Math.max(0, position - 10), position + 22),
      });
      tagCounts.component++;
      i += 1; // Skip next character
      continue;
    }
    
    // Components: closing }} - skip if in code block
    if (char === '}' && nextChar === '}' && !inCodeBlock) {
      // Find most recent component (LIFO - find last occurrence)
      const componentIndex = stack.map((tag, idx) => tag.type === 'component' ? idx : -1)
        .filter(idx => idx !== -1)
        .pop();
      if (componentIndex !== undefined && componentIndex !== -1) {
        // Close the most recent component
        stack.splice(componentIndex, 1);
        tagCounts.component--;
        i += 1; // Skip next character
        continue;
      }
    }
  }
  
  // FINAL SAFETY CHECK: If we're in a code block, ensure no markdown tags remain
  if (inCodeBlock) {
    const nonCodeBlockTags = stack.filter(tag => tag.type !== 'codeBlock');
    if (nonCodeBlockTags.length > 0) {
      console.log('🧹 Final cleanup: Removing tags found at end of processing (inCodeBlock=true):', nonCodeBlockTags.map(t => t.type));
      stack = stack.filter(tag => tag.type === 'codeBlock');
      tagCounts = { ...tagCounts, bold: 0, italic: 0, code: 0, link: 0, component: 0 };
    }
  }
  
  // Calculate earliest position (bottom of stack)
  const earliestPosition = stack.length > 0 ? stack[0].position : fullText.length;
  
  return {
    stack,
    earliestPosition,
    previousTextLength: fullText.length,
    tagCounts,
    inCodeBlock,
    inInlineCode,
  };
}

/**
 * Optimize markdown for performance during rapid updates
 */
export function optimizeForStreaming(
  text: string,
  state?: IncompleteTagState,
  registry?: ComponentRegistry
): string {
  // For very long texts, we might want to limit processing to recent changes
  const MAX_PROCESSING_LENGTH = 10000;
  
  if (text.length > MAX_PROCESSING_LENGTH) {
    // Process only the last portion that's likely to contain incomplete markdown
    const recentText = text.slice(-MAX_PROCESSING_LENGTH);
    const beforeText = text.slice(0, -MAX_PROCESSING_LENGTH);
    
    return beforeText + fixIncompleteMarkdown(recentText, state, registry);
  }
  
  return fixIncompleteMarkdown(text, state, registry);
}
