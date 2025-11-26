/**
 * Table - Unified Table Renderer
 * 
 * Handles both StableBlock and raw data input.
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { StableBlock, ThemeConfig, ComponentRegistry } from '../core/types';
import { getTextStyles, getBlockStyles } from '../themes';
import { renderInlineContent } from '../renderers/InlineRenderer';

export interface TableProps {
  theme: ThemeConfig;
  /** Component registry for inline components */
  componentRegistry?: ComponentRegistry;
  /** StableBlock input */
  block?: StableBlock;
  /** Direct headers */
  headers?: string[];
  /** Direct rows */
  rows?: string[][];
}

/**
 * Extract table data from raw markdown
 */
function extractTableData(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split('\n').filter(l => l.trim());
  
  if (lines.length < 2) {
    return { headers: [], rows: [] };
  }
  
  // First line is headers
  const headers = lines[0]
    .split('|')
    .map(h => h.trim())
    .filter(Boolean);
  
  // Skip separator line (index 1), rest are data rows
  const rows = lines.slice(2).map(line =>
    line.split('|').map(cell => cell.trim()).filter(Boolean)
  );
  
  return { headers, rows };
}

export const Table: React.FC<TableProps> = React.memo(
  ({ theme, componentRegistry, block, headers: directHeaders, rows: directRows }) => {
    const textStyles = getTextStyles(theme);
    const blockStyles = getBlockStyles(theme);
    
    // Determine table data from either source
    let headers: string[];
    let rows: string[][];
    
    if (block) {
      const meta = block.meta as { type: 'table'; headers: string[]; rows: string[][] };
      if (meta.headers && meta.headers.length > 0) {
        headers = meta.headers;
        rows = meta.rows || [];
      } else {
        const extracted = extractTableData(block.content);
        headers = extracted.headers;
        rows = extracted.rows;
      }
    } else {
      headers = directHeaders ?? [];
      rows = directRows ?? [];
    }
    
    if (headers.length === 0) {
      return null;
    }
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={blockStyles.table}>
          {/* Header row */}
          <View style={[blockStyles.tableHeader, { flexDirection: 'row' }]}>
            {headers.map((header, index) => (
              <View key={index} style={{ minWidth: 100, padding: 8 }}>
                <Text style={[textStyles.body, { fontWeight: 'bold' }]}>
                  {renderInlineContent(header, theme, componentRegistry)}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Data rows */}
          {rows.map((row, rowIndex) => (
            <View 
              key={rowIndex} 
              style={[blockStyles.tableCell, { flexDirection: 'row' }]}
            >
              {row.map((cell, cellIndex) => (
                <View key={cellIndex} style={{ minWidth: 100, padding: 8 }}>
                  <Text style={textStyles.body}>
                    {renderInlineContent(cell, theme, componentRegistry)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  },
  (prev, next) => {
    if (prev.block && next.block) {
      return prev.block.contentHash === next.block.contentHash;
    }
    return (
      JSON.stringify(prev.headers) === JSON.stringify(next.headers) &&
      JSON.stringify(prev.rows) === JSON.stringify(next.rows)
    );
  }
);

Table.displayName = 'Table';

