---
"streamdown-rn": minor
---

### Breaking Changes

- **Component syntax changed**: `[{c:"Name",p:{...}}]` replaces the old `{{component:"Name",props:{...}}}` syntax
- **Layout components removed**: Canvas, Grid, Stack, Card are no longer exported (planned for future galerie-rn package)
- **Simplified public API**: Only exports StreamdownRN, Skeleton primitives, and types

### New Features

- **Progressive prop streaming**: Components render field-by-field as data streams, with skeleton placeholders for missing props
- **Format-as-you-type UX**: Bold, italic, code formatting appears immediately while typing
- **Block-level memoization**: Stable blocks are parsed once and never re-render
- **Full GFM support**: Tables, strikethrough, task lists, autolinks via remark-gfm

### Security

- **URL sanitization**: All URLs in links, images, and component props are validated against an allowlist (`http:`, `https:`, `mailto:`, `tel:`, `sms:`, relative URLs)
- **XSS protection**: Blocks `javascript:`, `data:`, `vbscript:`, `file:` and other dangerous protocols
- **Recursive prop sanitization**: Component props are sanitized at all nesting levels
- **HTML rendered as text**: Raw HTML in markdown is displayed as escaped text, never executed
- **Exported utilities**: `sanitizeURL()` and `sanitizeProps()` available for custom use

### Improvements

- **Compact component syntax**: `[{c:...,p:...}]` reduces token count by ~50%
- **Robust JSON parsing**: Auto-repairs incomplete JSON during streaming
- **Better streaming edge cases**: Handles incomplete markdown gracefully
- **Character-level parsing**: Consistent block boundary detection regardless of chunk size

