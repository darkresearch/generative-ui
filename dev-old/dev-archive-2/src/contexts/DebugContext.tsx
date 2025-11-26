import React, { createContext, useContext } from 'react';
import type { IncompleteTagState } from '../../../../packages/streamdown-rn/src/core/types';
import type { ComponentExtractionState } from '@darkresearch/streamdown-rn';

interface DebugContextValue {
  debugState: IncompleteTagState | null;
  currentText: string;
  componentExtractionState: ComponentExtractionState | null;
  components: Array<{ name: string; code: string; description?: string }>;
}

const DebugContext = createContext<DebugContextValue | null>(null);

export function DebugProvider({ 
  children, 
  value 
}: { 
  children: React.ReactNode; 
  value: DebugContextValue 
}) {
  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebugData() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebugData must be used within DebugProvider');
  }
  return context;
}

