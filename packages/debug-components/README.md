# @darkresearch/debug-components

Shared debug components for `streamdown-rn` testing and development.

## Usage

```tsx
import { StreamdownRN } from 'streamdown-rn';
import { debugComponentRegistry } from '@darkresearch/debug-components';

function App() {
  return (
    <StreamdownRN componentRegistry={debugComponentRegistry}>
      {markdownContent}
    </StreamdownRN>
  );
}
```

## Available Components

### StatusCard

A status card with title, description, priority badge, and ticket count.

```markdown
[{c:"StatusCard",p:{"title":"Sprint 42","description":"Feature development","priority":2,"tickets":12}}]
```

**Props:**
- `title` (string, required) - Card title
- `description` (string) - Card description
- `priority` (number) - Priority level (displays as P1, P2, etc.)
- `tickets` (number) - Ticket count

### Stack (experimental)

Flex layout component for arranging children.

### Card (experimental)

Simple container with title and padding.

## Extending the Registry

You can import individual components to build your own registry:

```tsx
import { 
  StatusCard, 
  StatusCardSkeleton, 
  StatusCardSchema 
} from '@darkresearch/debug-components';

const myRegistry = {
  get: (name) => /* your logic */,
  has: (name) => /* your logic */,
  validate: (name, props) => /* your logic */,
};
```

## Development

This package is used by:
- `apps/debugger` - Web debugger
- `apps/debugger-ios` - iOS debugger companion

Add new components in `src/components/` and register them in `src/registry.ts`.

