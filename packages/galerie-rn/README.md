# galerie-rn

> **⚠️ EXPERIMENTAL** — This package is not ready for production use.

Generative UI canvas management for React Native.

## Status

This package is in early development. Currently exports only stub components:

- `Canvas` - Basic scrollable canvas container
- `CanvasComponent` - Absolutely positioned component wrapper

## Planned Features

- 2D canvas for generative UI layouts
- CSS Grid-like positioning syntax
- Integration with streamdown-rn for streaming components
- Nested component composition

## Current Implementation

The current implementation is a placeholder:

```tsx
import { Canvas, CanvasComponent } from 'galerie-rn';

<Canvas width={2000} height={2000}>
  <CanvasComponent x={100} y={100} width={200} height={100}>
    <YourComponent />
  </CanvasComponent>
</Canvas>
```

## Roadmap

1. Canvas layout engine
2. Component positioning DSL
3. Streaming layout updates
4. Integration with streamdown-rn component registry

## License

Apache-2.0

