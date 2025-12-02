# StreamdownRN v0.2.0 Architecture

## Overview

High-performance streaming markdown renderer for React Native with:
- **Format-as-you-type UX** — Formatting appears immediately
- **AST-based rendering** — Robust via remark + remark-gfm
- **Block-level memoization** — Stable blocks never re-render
- **Inline component support** — `[{c:"Name",p:{...}}]` syntax
- **Full GFM support** — Tables, strikethrough, task lists, footnotes
- **Syntax highlighting** — Prism-based, lightweight (~30KB)

---

## Architecture: Hybrid Streaming + AST

```
Incoming stream: "# Hello\n\nSome **bold** text"
                          ↓
┌────────────────────────────────────────────────────────────┐
│  PHASE 1: Regex Block Splitter (every token, O(1))         │
│  - Detects block boundaries (double newline, fences, etc.) │
│  - Maintains tag state for active block                    │
│  - Determines when blocks are complete                     │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│  PHASE 2: Active Block (streaming, re-renders)            │
│  - Fix incomplete markdown (auto-close open tags)          │
│  - Parse with remark → MDAST                               │
│  - Render AST → React components                           │
└────────────────────────────────────────────────────────────┘
                          ↓
          Block becomes complete (double newline)
                          ↓
┌────────────────────────────────────────────────────────────┐
│  PHASE 3: Stable Block (memoized, never re-renders)       │
│  - Parse with remark → MDAST (cached in block.ast)         │
│  - React.memo prevents re-renders                          │
│  - Render cached AST → React components                    │
└────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── __tests__/                        # Unit tests (151 tests)
│   ├── splitter.test.ts              # Block boundary detection
│   ├── incomplete.test.ts            # Tag state tracking
│   ├── parser.test.ts                # Remark/GFM parsing
│   ├── component-extraction.test.ts  # Component syntax
│   └── README.md                     # Test documentation
│
├── components/                       # Reusable components
│   ├── index.ts                      # Exports
│   └── Skeleton.tsx                  # Skeleton primitives
│
├── core/                             # Core engine
│   ├── types.ts                      # Type definitions
│   ├── splitter/                     # Block boundary detection
│   │   ├── index.ts                  # Main splitter
│   │   ├── blockPatterns.ts          # Block type detection
│   │   ├── blockClosers.ts           # Boundary detection
│   │   ├── finalizeBlock.ts          # Block completion
│   │   ├── processLines.ts           # Line processing
│   │   └── logger.ts                 # Debug logging
│   ├── parser.ts                     # Remark wrapper (cached)
│   ├── incomplete.ts                 # Tag state + auto-close
│   └── componentParser.ts            # Component extraction
│
├── renderers/                        # Rendering layer
│   ├── ActiveBlock.tsx               # Streaming block renderer
│   ├── StableBlock.tsx               # Memoized block renderer
│   └── ASTRenderer.tsx               # MDAST → React components
│
├── themes/                           # Theming
│   └── index.ts                      # Dark/light themes
│
├── types/                            # Type declarations
│   └── react-native-syntax-highlighter.d.ts
│
├── StreamdownRN.tsx                  # Main component
└── index.ts                          # Public API
```

---

## Key Features

### 1. Format-as-You-Type

**User types:** `**bo`  
**Renders:** **bo** (bold formatting already applied)

**How it works:**
- Tag state tracks open `**`
- Auto-closes to `**bo**` before remark parsing
- Remark sees complete syntax → applies formatting
- User sees formatted text immediately

### 2. Block-Level Memoization

```typescript
interface StableBlock {
  id: string;
  content: string;
  contentHash: number;
  ast: Content;  // ← Cached MDAST, never re-parsed
}

const StableBlock = React.memo(
  ({ block }) => <ASTRenderer node={block.ast} />,
  (prev, next) => prev.block.contentHash === next.block.contentHash
);
```

Once a block is finalized:
- Parsed once with remark
- AST cached in the block
- Never re-renders (contentHash comparison)

### 3. Inline Component Support

```markdown
Check out this [{c:"Badge",p:{"label":"new"}}] feature!
```

Components can appear:
- **Block-level:** On their own line
- **Inline:** Within paragraphs, headings, lists, etc.

Both are detected and rendered correctly.

### 4. Full GitHub Flavored Markdown

Via `remark-gfm`:
- Tables with alignment
- Strikethrough (`~~deleted~~`)
- Task lists (`- [x] done`)
- Autolinks (`www.example.com`)
- Footnotes (`[^1]`)

---

## Performance Characteristics

| Operation | Frequency | Cost |
|-----------|-----------|------|
| Regex boundary detection | Every token | O(1) |
| Tag state update | Every token | O(new_chars) ≈ O(1) |
| Fix incomplete markdown | Every token (active only) | O(n_active) ≈ O(100) |
| Parse active with remark | Every token (active only) | O(n_active) |
| Parse stable with remark | Once per block | O(n_block) |
| Render stable block | Never (memoized) | O(0) |

**For a 10-block, 1000-token response:**
- Total remark parses: ~1,010 (1000 for active + 10 for stable)
- But each parse is small: ~100 chars avg
- Stable blocks: Parsed once, never again

**Estimated total cost:** ~100ms for 10KB response (imperceptible)

---

## Testing Strategy

### Unit Tests (All Pure Functions)

```bash
bun test
# ✓ 151 tests passing
```

**Test Coverage:**
- Block splitter (boundary detection, edge cases)
- Incomplete handler (tag state tracking, auto-close)
- Parser (remark/GFM parsing)
- Component extraction (syntax parsing, streaming)

---

## Component Syntax: `[{c:"Name",p:{...}}]`

**Block-level:**
```markdown
[{c:"Card",p:{"title":"Hello","price":99.99}}]
```

**Inline:**
```markdown
Check out this [{c:"Badge",p:{"label":"New"}}] feature!
```

**Props passed to components:**
- `_isInline={true}` — When rendered inline
- `_isStreaming={true}` — When in active block

---

## Dependencies

| Package | Size | Purpose |
|---------|------|---------|
| `remark` | ~50KB | Markdown parser |
| `remark-gfm` | ~15KB | GFM extensions |
| `prismjs` | ~30KB | Syntax highlighting |
| `react-native-syntax-highlighter` | ~5KB | RN wrapper for Prism |

**Total bundle impact:** ~100KB (well worth it for robustness)
