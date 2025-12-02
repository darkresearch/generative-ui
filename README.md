# Generative UI

React Native components and tools for building generative UI applications.

## Packages

### [streamdown-rn](./packages/streamdown-rn)

High-performance streaming markdown renderer with dynamic component injection.

- Streaming-first rendering
- Format-as-you-type UX
- Progressive component streaming with skeletons
- Full GFM support (tables, strikethrough, task lists)

### [galerie-rn](./packages/galerie-rn) (Experimental)

Generative UI canvas management. Currently a stub for future development.

## Apps

- **[apps/debugger](./apps/debugger)** — Streamdown debugger with streaming controls
- **[apps/starter](./apps/starter)** — Starter template app

## Quick Start

### Using Streamdown

```bash
bun install streamdown-rn
```

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

### Running the Debugger

```bash
cd apps/debugger
bun install
bun run web
```

## Development

### Install Dependencies
```bash
bun install
```

### Build Packages
```bash
cd packages/streamdown-rn
bun run build
```

### Run Tests
```bash
cd packages/streamdown-rn
bun test
```

## Architecture

```
generative-ui/
├── apps/                   # Expo applications
│   ├── debugger/           # Streamdown debugger
│   ├── debugger-ios/       # iOS-only debugger
│   └── starter/            # Starter template
├── packages/               # Publishable packages
│   ├── streamdown-rn/      # Streaming markdown renderer
│   └── galerie-rn/         # Canvas management (experimental)
├── .cursor/rules/          # AI coding rules
└── AGENTS.md               # AI workflow docs
```

## AI-Assisted Development

This monorepo is optimized for AI-assisted development. See:
- **[AGENTS.md](./AGENTS.md)** — AI development workflow
- **[.cursor/rules/](./.cursor/rules/)** — Cursor-specific guidelines

---

Built with ❤️ by [Dark](https://darkresearch.ai)
