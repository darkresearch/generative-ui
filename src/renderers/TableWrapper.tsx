/**
 * TableWrapper - Horizontal scroll container for tables
 * 
 * Wraps tables in a ScrollView to enable horizontal scrolling
 * while preventing text wrapping within cells
 */

import React from 'react';
import { ScrollView, View, Platform } from 'react-native';

interface TableWrapperProps {
  children: React.ReactNode;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({ children }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={Platform.OS === 'web'}
      contentContainerStyle={{
        minWidth: '100%',
      }}
      style={{
        maxWidth: '100%',
        marginVertical: 12,
      }}
    >
      <View
        style={
          Platform.OS === 'web'
            ? ({ whiteSpace: 'nowrap' } as any)
            : {}
        }
      >
        {children}
      </View>
    </ScrollView>
  );
};

export default TableWrapper;

