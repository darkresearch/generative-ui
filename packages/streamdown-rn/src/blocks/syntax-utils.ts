/**
 * Shared Syntax Highlighting Utilities
 */

import type { ThemeConfig } from '../core/types';

/**
 * Map common language aliases to Prism language names
 */
export function normalizeLanguage(lang: string): string {
  const aliases: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'tsx': 'tsx',
    'jsx': 'jsx',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'shell': 'bash',
    'zsh': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'json5': 'json',
    'dockerfile': 'docker',
  };
  return aliases[lang.toLowerCase()] || lang.toLowerCase();
}

/**
 * Create Prism syntax style from theme colors
 */
export function createSyntaxStyle(theme: ThemeConfig) {
  return {
    'pre[class*="language-"]': {
      color: theme.colors.syntaxDefault,
      background: 'transparent',
    },
    'token': { color: theme.colors.syntaxDefault },
    'keyword': { color: theme.colors.syntaxKeyword },
    'builtin': { color: theme.colors.syntaxOperator },
    'class-name': { color: theme.colors.syntaxClass },
    'function': { color: theme.colors.syntaxFunction },
    'string': { color: theme.colors.syntaxString },
    'number': { color: theme.colors.syntaxNumber },
    'operator': { color: theme.colors.syntaxOperator },
    'comment': { color: theme.colors.syntaxComment },
    'punctuation': { color: theme.colors.syntaxDefault },
    'property': { color: theme.colors.syntaxClass },
    'constant': { color: theme.colors.syntaxNumber },
    'boolean': { color: theme.colors.syntaxNumber },
    'tag': { color: theme.colors.syntaxKeyword },
    'attr-name': { color: theme.colors.syntaxString },
    'attr-value': { color: theme.colors.syntaxString },
    'selector': { color: theme.colors.syntaxClass },
    'regex': { color: theme.colors.syntaxString },
  };
}

