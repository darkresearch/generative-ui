/**
 * Canvas Layout Component
 * 
 * A CSS Grid-inspired layout container for 2D component arrangements.
 * Accepts familiar CSS Grid properties and translates them to React Native flexbox.
 * 
 * @example
 * ```json
 * {c:"Canvas",p:{
 *   "style":{
 *     "gridTemplateColumns":"1fr 1fr",
 *     "gap":12
 *   }
 * },children:[
 *   {c:"Card",style:{"gridColumn":"span 2"}},
 *   {c:"Card"},
 *   {c:"Card"}
 * ]}
 * ```
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Skeleton } from '../Skeleton';
import { 
  parseGridTemplateColumns, 
  parseSpan,
  type ColumnDef,
} from '../../core/gridParser';

// Re-export parser utilities for convenience
export { parseGridTemplateColumns, parseSpan, calculateColumnWidths } from '../../core/gridParser';
export type { ColumnDef };

// ============================================================================
// Helpers (DRY)
// ============================================================================

/**
 * Calculate width for a column based on fr units.
 */
function calculateColumnWidth(
  columns: ColumnDef[],
  columnIndex: number,
  colSpan: number,
  totalFr: number
): string | number {
  const columnCount = columns.length;
  
  if (colSpan === columnCount) {
    return '100%';
  }
  
  // Sum the fr values for spanned columns
  const spannedFr = columns
    .slice(columnIndex, columnIndex + colSpan)
    .reduce((sum, col) => sum + (col.type === 'fr' ? col.value : 0), 0);
  
  return totalFr > 0 
    ? `${(spannedFr / totalFr) * 100}%` 
    : `${100 / columnCount * colSpan}%`;
}

// ============================================================================
// Types
// ============================================================================

export interface CanvasStyle {
  /** Grid template columns: "1fr 1fr", "repeat(3, 1fr)", "200 1fr", etc. */
  gridTemplateColumns?: string;
  /** Gap between items (number for pixels) */
  gap?: number;
  /** Row gap (overrides gap for rows) */
  rowGap?: number;
  /** Column gap (overrides gap for columns) */
  columnGap?: number;
  /** Padding inside canvas */
  padding?: number;
  /** Fixed height */
  height?: number;
  /** Min height */
  minHeight?: number;
  /** Background color */
  backgroundColor?: string;
  /** Border radius */
  borderRadius?: number;
}

export interface CanvasProps {
  /** CSS Grid-like style properties */
  style?: CanvasStyle;
  /** Children components */
  children?: React.ReactNode;
  /** Streaming flag */
  _isStreaming?: boolean;
}

export interface CanvasChildStyle {
  /** Column span: "span 2", "1 / 3", "1 / -1" */
  gridColumn?: string;
  /** Row span: "span 2" */
  gridRow?: string;
  /** Self alignment */
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  /** Justify self */
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
}

// ============================================================================
// Shared Grid Layout Logic (DRY)
// ============================================================================

interface GridConfig {
  columns: ColumnDef[];
  columnCount: number;
  totalFr: number;
  columnGap: number;
  rowGap: number;
}

/**
 * Arrange children into grid rows based on column definitions.
 * Shared between Canvas and CanvasSkeleton.
 */
function arrangeChildrenInGrid(
  children: React.ReactNode,
  config: GridConfig
): React.ReactNode[][] {
  const { columns, columnCount, totalFr, columnGap } = config;
  const rows: React.ReactNode[][] = [];
  let currentRow: React.ReactNode[] = [];
  let currentColIndex = 0;
  
  React.Children.forEach(children, (child, index) => {
    if (!React.isValidElement(child)) return;
    
    // Extract style prop from child for gridColumn
    const childStyle = (child.props as { style?: CanvasChildStyle }).style;
    const colSpan = parseSpan(childStyle?.gridColumn, columnCount);
    
    // Check if child fits in current row
    if (currentColIndex + colSpan > columnCount) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentColIndex = 0;
    }
    
    // Calculate width for this child
    const childWidth = calculateColumnWidth(columns, currentColIndex, colSpan, totalFr);
    
    // Wrap child with width container
    currentRow.push(
      <View
        key={index}
        style={{
          width: childWidth as any,
          paddingRight: currentColIndex + colSpan < columnCount ? columnGap : 0,
        }}
      >
        {child}
      </View>
    );
    
    currentColIndex += colSpan;
    
    if (currentColIndex >= columnCount) {
      rows.push(currentRow);
      currentRow = [];
      currentColIndex = 0;
    }
  });
  
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * Render rows with proper spacing.
 */
function renderGridRows(rows: React.ReactNode[][], rowGap: number): React.ReactNode {
  return rows.map((row, rowIndex) => (
    <View
      key={rowIndex}
      style={[
        styles.row,
        { marginBottom: rowIndex < rows.length - 1 ? rowGap : 0 },
      ]}
    >
      {row}
    </View>
  ));
}

// ============================================================================
// Canvas Component
// ============================================================================

/**
 * Canvas - CSS Grid-inspired layout container.
 * 
 * Translates CSS Grid properties to React Native flexbox for 2D layouts.
 */
export const Canvas: React.FC<CanvasProps> = ({
  style = {},
  children,
}) => {
  const {
    gridTemplateColumns,
    gap = 0,
    rowGap = gap,
    columnGap = gap,
    padding,
    height,
    minHeight,
    backgroundColor,
    borderRadius,
  } = style;
  
  // Parse column definitions
  const columns = parseGridTemplateColumns(gridTemplateColumns);
  const columnCount = columns.length;
  const totalFr = columns.reduce((sum, col) => sum + (col.type === 'fr' ? col.value : 0), 0);
  
  // Arrange children into grid
  const rows = arrangeChildrenInGrid(children, { columns, columnCount, totalFr, columnGap, rowGap });
  
  const containerStyle: ViewStyle = {
    padding,
    height,
    minHeight,
    backgroundColor,
    borderRadius,
  };
  
  return (
    <View style={[styles.canvas, containerStyle]}>
      {renderGridRows(rows, rowGap)}
    </View>
  );
};

/**
 * CanvasSkeleton - Skeleton version for streaming.
 * Shows grid structure once gridTemplateColumns is known, otherwise a simple placeholder.
 * When children are provided, arranges them in the grid layout.
 */
export const CanvasSkeleton: React.FC<Partial<CanvasProps>> = ({
  style = {},
  children,
}) => {
  const { 
    gridTemplateColumns,
    padding, 
    height, 
    minHeight, 
    backgroundColor, 
    borderRadius,
    gap = 12,
    rowGap = gap,
    columnGap = gap,
  } = style;
  
  const containerStyle: ViewStyle = {
    padding: padding ?? 12,
    height,
    minHeight: minHeight ?? 100,
    backgroundColor: backgroundColor ?? 'rgba(255, 255, 255, 0.04)',
    borderRadius: borderRadius ?? 8,
  };
  
  // Parse grid structure
  const columns = parseGridTemplateColumns(gridTemplateColumns);
  const columnCount = columns.length;
  const totalFr = columns.reduce((sum, col) => sum + (col.type === 'fr' ? col.value : 0), 0);
  const gridConfig: GridConfig = { columns, columnCount, totalFr, columnGap, rowGap };
  
  // If we have children, arrange them in the grid layout (reuse shared logic)
  if (children) {
    const rows = arrangeChildrenInGrid(children, gridConfig);
    return (
      <View style={[styles.canvas, containerStyle]}>
        {renderGridRows(rows, rowGap)}
      </View>
    );
  }
  
  // If we know the grid structure but no children yet, show skeleton placeholders
  if (gridTemplateColumns) {
    const skeletonCells = columns.map((_, index) => {
      const width = calculateColumnWidth(columns, index, 1, totalFr);
      return (
        <View
          key={index}
          style={{
            width: width as any,
            paddingRight: index < columnCount - 1 ? columnGap : 0,
          }}
        >
          <Skeleton height={80} />
        </View>
      );
    });
    
    return (
      <View style={[styles.canvas, containerStyle]}>
        <View style={styles.row}>
          {skeletonCells}
        </View>
      </View>
    );
  }
  
  // Fallback: simple single skeleton until we know the layout
  return (
    <View style={[styles.canvas, containerStyle]}>
      <Skeleton height={100} />
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  canvas: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
});

export default Canvas;
