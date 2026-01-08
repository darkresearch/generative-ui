# streamdown-rn

## 0.2.2

### Patch Changes

- db4ce4c: feat: add patches

## 0.2.1

### Patch Changes

- 3c24a0c: Fix FlashList v2 cell recycling bug where messages rendered with wrong content after scrolling

  - Fixed `useRef` state persisting across recycled cells by detecting content changes and resetting registry
  - Added `AutoSizedImage` component that fetches actual image dimensions for correct aspect ratios
  - Fixed TypeScript error where `node.alt` could be `null`

## 0.2.0

### Minor Changes

- 17a251a: ### Breaking Changes

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

## 0.1.6

### Patch Changes

- Enhanced fuzz testing, fixed component injection bugs, and improved CI configuration.

## 0.1.5

### Patch Changes

- Fixed component parsing to gracefully handle extra closing braces. AI models sometimes generate malformed component syntax (like `}}}` instead of `}}`), which previously caused rendering errors. The parser now automatically corrects these cases.

## 0.1.4

### Patch Changes

- Added component buffering during streaming. When markdown streams include dynamic components, partial component syntax (like `{{component:` without closing `}}`) is now hidden until the component is complete. This prevents users from seeing raw component code while streaming.
- Moved from beta to stable release.

## 0.1.3

### Patch Changes

- Improved table rendering with horizontal scrolling. Tables now scroll horizontally instead of awkwardly wrapping text, providing a cleaner viewing experience.
- Enhanced text wrapping for better readability. Long strings (like Solana addresses) in inline code now break properly.
- Added responsive design improvements. Tables and text scale appropriately on mobile devices with optimized font sizes.
- Redesigned table styling to match modern chat interfaces with minimal borders and clean appearance.

## 0.1.2

### Patch Changes

- Code cleanup and maintenance. Removed outdated references, fixed TypeScript warnings, and improved documentation for better developer experience.

## 0.1.1

### Patch Changes

- Set up automated publishing pipeline with GitHub Actions and Changesets for streamlined version management and releases.

## 0.1.0

### Patch Changes

- Initial release: React Native streaming markdown renderer with dynamic component injection. Stream markdown content in real-time while injecting custom React Native components seamlessly.
