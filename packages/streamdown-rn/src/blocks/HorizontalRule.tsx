/**
 * HorizontalRule - Unified Horizontal Rule Renderer
 */

import React from 'react';
import { View } from 'react-native';
import type { StableBlock, ThemeConfig } from '../core/types';
import { getBlockStyles } from '../themes';

export interface HorizontalRuleProps {
  theme: ThemeConfig;
  /** StableBlock input (optional) */
  block?: StableBlock;
}

export const HorizontalRule: React.FC<HorizontalRuleProps> = React.memo(
  ({ theme }) => {
    const blockStyles = getBlockStyles(theme);
    
    return <View style={blockStyles.horizontalRule} />;
  },
  (prev, next) => {
    // HorizontalRule has no dynamic content, only re-render if theme changes
    return prev.theme === next.theme;
  }
);

HorizontalRule.displayName = 'HorizontalRule';

