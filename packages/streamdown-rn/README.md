# streamdown-rn

High-performance streaming markdown renderer for React Native, optimized for AI responses.

## Features

- **Streaming-first** — Renders markdown as it arrives, character by character
- **Format-as-you-type** — Formatting appears immediately (e.g., `**bo` shows as **bo**)
- **Progressive components** — Custom components stream with skeleton placeholders
- **Block-level memoization** — Stable blocks never re-render
- **Full GFM support** — Tables, strikethrough, task lists via remark-gfm
- **Syntax highlighting** — Prism-based code highlighting

## Installation

```bash
npm install streamdown-rn
# or
bun add streamdown-rn
```

### Peer Dependencies

```json
{
  "react": "^19.0.0",
  "react-native": "^0.81.0"
}
```

## Basic Usage

```tsx
import { StreamdownRN } from 'streamdown-rn';

function ChatMessage({ content }: { content: string }) {
  return (
    <StreamdownRN theme="dark">
      {content}
    </StreamdownRN>
  );
}
```

## Custom Components

Inject custom React Native components using the `[{c:"Name",p:{...}}]` syntax:

```tsx
import { StreamdownRN, type ComponentRegistry, type ComponentDefinition } from 'streamdown-rn';

// Define your component
const StatusCard = ({ title, status }) => (
  <View style={styles.card}>
    <Text>{title}</Text>
    <Text>{status}</Text>
  </View>
);

// Create a registry
const registry: ComponentRegistry = {
  get: (name) => definitions[name],
  has: (name) => !!definitions[name],
  validate: () => ({ valid: true, errors: [] }),
};

const definitions: Record<string, ComponentDefinition> = {
  StatusCard: {
    component: StatusCard,
    skeletonComponent: StatusCardSkeleton, // Optional: shown while streaming
  },
};

// Use it
<StreamdownRN componentRegistry={registry}>
  {`Here's a status card:
  
[{c:"StatusCard",p:{"title":"Build Status","status":"passing"}}]

More text below.`}
</StreamdownRN>
```

### Component Syntax

Components use a compact JSON syntax:

```
[{c:"ComponentName",p:{"prop1":"value","prop2":123}}]
```

- `c` — Component name (must exist in registry)
- `p` — Props object (JSON)

### Progressive Prop Streaming

Components render progressively as props stream in. Define a `skeletonComponent` to show placeholders for missing props:

```tsx
const StatusCardSkeleton = ({ title, status }) => (
  <View style={styles.card}>
    {title ? <Text>{title}</Text> : <SkeletonText width={100} />}
    {status ? <Text>{status}</Text> : <SkeletonText width={60} />}
  </View>
);
```

## Skeleton Primitives

Build skeleton components using provided primitives:

```tsx
import { Skeleton, SkeletonText, SkeletonCircle, SkeletonNumber } from 'streamdown-rn';

// Basic rectangle
<Skeleton width={100} height={20} />

// Text placeholder (single or multi-line)
<SkeletonText width={200} lines={3} gap={6} />

// Circle (for avatars)
<SkeletonCircle size={40} />

// Number placeholder
<SkeletonNumber width={50} />
```

## Theming

```tsx
<StreamdownRN theme="dark">  {/* or "light" */}
  {content}
</StreamdownRN>
```

## Debugging

Enable debug callbacks to inspect the streaming state:

```tsx
<StreamdownRN
  onDebug={(snapshot) => {
    console.log('Blocks:', snapshot.registry.stableBlockCount);
    console.log('Active:', snapshot.registry.activeBlock?.type);
  }}
  isComplete={streamingDone}
>
  {content}
</StreamdownRN>
```

## API Reference

### StreamdownRN Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `string` | Markdown content to render |
| `componentRegistry` | `ComponentRegistry` | Custom component definitions |
| `theme` | `'dark' \| 'light'` | Color theme (default: `'dark'`) |
| `onDebug` | `(snapshot: DebugSnapshot) => void` | Debug callback |
| `onError` | `(error: Error) => void` | Error handler |
| `isComplete` | `boolean` | Set `true` when streaming finishes |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed implementation notes.

## License

Apache-2.0

