# StreamdownRN Tests

## Running Tests

```bash
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test splitter.test.ts   # Run specific test file
```

## Test Structure

### Unit Tests (Pure Logic)

- **`splitter.test.ts`** — Block boundary detection and finalization
- **`incomplete.test.ts`** — Tag state tracking and incomplete markdown fixing
- **`parser.test.ts`** — Remark/GFM parsing
- **`component-extraction.test.ts`** — Component syntax parsing

### Integration Tests (Coming Soon)

- **`integration.test.ts`** — Full streaming scenarios
- **`ast-rendering.test.ts`** — AST to React component rendering

### Visual Tests (Storybook)

Run Storybook for visual regression testing:

```bash
bun run storybook
```

## Testing Philosophy

1. **Unit test pure functions** — splitter, parser, extractors
2. **Integration test streaming flows** — multi-block scenarios
3. **Visual test in Storybook** — actual rendering and UX
4. **Manual test in app** — Real AI streaming

## Coverage Goals

- Core logic: >90%
- Edge cases: All documented scenarios
- Streaming: Various token speeds and patterns

