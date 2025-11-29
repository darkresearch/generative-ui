/**
 * CSS Grid Parser Utilities
 * 
 * Pure logic for parsing CSS Grid-like properties.
 * No React Native dependencies - safe for testing.
 */

// ============================================================================
// Types
// ============================================================================

export interface ColumnDef {
  type: 'fr' | 'px' | 'auto';
  value: number;
}

// ============================================================================
// Parsers
// ============================================================================

/**
 * Parse gridTemplateColumns string into column definitions.
 * Supports: "1fr 1fr", "repeat(3, 1fr)", "200 1fr 2fr", "auto 1fr"
 */
export function parseGridTemplateColumns(template: string | undefined): ColumnDef[] {
  if (!template) return [{ type: 'fr', value: 1 }]; // Default: single column
  
  const columns: ColumnDef[] = [];
  
  // Handle repeat() syntax: repeat(3, 1fr) -> 1fr 1fr 1fr
  const expanded = template.replace(
    /repeat\(\s*(\d+)\s*,\s*([^)]+)\s*\)/g,
    (_, count, value) => Array(parseInt(count, 10)).fill(value.trim()).join(' ')
  );
  
  // Split by whitespace and parse each column
  const parts = expanded.trim().split(/\s+/);
  
  for (const part of parts) {
    if (part.endsWith('fr')) {
      columns.push({ type: 'fr', value: parseFloat(part) || 1 });
    } else if (part.endsWith('px')) {
      columns.push({ type: 'px', value: parseFloat(part) || 0 });
    } else if (part === 'auto') {
      columns.push({ type: 'auto', value: 0 });
    } else {
      // Assume pixels if just a number
      const num = parseFloat(part);
      if (!isNaN(num)) {
        columns.push({ type: 'px', value: num });
      } else {
        columns.push({ type: 'fr', value: 1 }); // Fallback
      }
    }
  }
  
  return columns.length > 0 ? columns : [{ type: 'fr', value: 1 }];
}

/**
 * Parse gridColumn/gridRow span value.
 * Supports: "span 2", "1 / 3", "1 / -1", or just a number
 */
export function parseSpan(value: string | undefined, totalColumns: number): number {
  if (!value) return 1;
  
  const trimmed = value.trim();
  
  // "span N" syntax
  const spanMatch = trimmed.match(/^span\s+(\d+)$/i);
  if (spanMatch) {
    return Math.min(parseInt(spanMatch[1], 10), totalColumns);
  }
  
  // "start / end" syntax
  const rangeMatch = trimmed.match(/^(\d+)\s*\/\s*(-?\d+)$/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    let end = parseInt(rangeMatch[2], 10);
    // Handle negative indices (e.g., -1 means last column)
    if (end < 0) end = totalColumns + end + 2;
    return Math.max(1, end - start);
  }
  
  // Just a number
  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) return Math.min(num, totalColumns);
  
  return 1;
}

/**
 * Calculate column widths as percentages based on fr units and fixed widths.
 */
export function calculateColumnWidths(columns: ColumnDef[]): string[] {
  const totalFr = columns.reduce((sum, col) => sum + (col.type === 'fr' ? col.value : 0), 0);
  
  return columns.map(col => {
    if (col.type === 'fr') {
      const frPercent = totalFr > 0 ? (col.value / totalFr) * 100 : 100;
      return `${frPercent}%`;
    } else if (col.type === 'px') {
      return `${col.value}`;
    } else {
      return 'auto';
    }
  });
}

