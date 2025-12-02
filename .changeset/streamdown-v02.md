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

### Improvements

- **Compact component syntax**: `[{c:...,p:...}]` reduces token count by ~50%
- **Robust JSON parsing**: Auto-repairs incomplete JSON during streaming
- **Better streaming edge cases**: Handles incomplete markdown gracefully

