---
"streamdown-rn": patch
---

Fix FlashList v2 cell recycling bug where messages rendered with wrong content after scrolling

- Fixed `useRef` state persisting across recycled cells by detecting content changes and resetting registry
- Added `AutoSizedImage` component that fetches actual image dimensions for correct aspect ratios
- Fixed TypeScript error where `node.alt` could be `null`
