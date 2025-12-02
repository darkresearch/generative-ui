# AI-Assisted Development Workflow

This monorepo uses AI-first development. All AI coding tools (Cursor, Claude, GitHub Copilot, Windsurf, etc.) should follow these workflows.

## Repository Structure

```
generative-ui/
├── packages/
│   ├── streamdown-rn/      # Streaming markdown parser/renderer
│   ├── galerie-rn/         # Generative UI canvas (built on streamdown)
│   ├── design-system/      # UI component library
│   └── app-template/       # Quick-start for new apps
├── dev/                    # Development playground
```

**How they relate**:
- Apps use `@darkresearch/design-system` for UI
- Apps use `galerie-rn` for generative canvas
- Galerie uses `streamdown-rn` for parsing

## Development Flow

### 1. Component Creation
When adding a UI component to design-system:

**Step 1**: Use React Native Reusables (don't build from scratch)
```bash
cd packages/design-system
npx @react-native-reusables/cli add button
```

**Step 2**: AI generates tests + story for the component
```bash
# AI creates these files:
src/components/ui/button.test.tsx
src/components/ui/button.stories.tsx
```

**Step 3**: Export from index
```tsx
// src/index.ts
export { Button } from './components/ui/button';
```

**Requirements**:
- Use Reusables components (auto Dark-branded via tailwind.config)
- Add tests (snapshot, interaction, accessibility)
- Add Storybook story with variants
- Only create custom components for things NOT in Reusables
- Use Squircle wrapper if smooth corners needed

### 2. Testing Commands
```bash
bun test                    # Run all tests
bun run test:watch          # Watch mode
bun run storybook           # Visual component gallery
bun run lint                # Code quality
```

### 3. Verification Checklist
Before completing any UI work:
- ✅ All tests pass (`bun test`)
- ✅ Storybook renders all variants
- ✅ No console warnings about re-renders
- ✅ Performance budgets met (1000 renders < 100ms)
- ✅ Touch targets ≥44px on mobile
- ✅ Accessibility labels present

## Design System

### Color Philosophy
Two base colors + opacity:
- **Background**: `#EEEDED`
- **Foreground**: `#262626`
- **Everything else**: Opacity variants (10%, 40%, 60%)

### Shapes
- Squircles everywhere (cornerSmoothing: 0.6)
- Native performance (react-native-fast-squircle)

### Component Standards
- React.memo for components receiving props
- useCallback for all handlers
- Accessibility props (accessibilityLabel, accessibilityRole)
- Minimum 44x44 touch targets

## Cursor-Specific Rules

Cursor automatically reads `.cursor/rules/*.mdc` files:
- `design-system.mdc` - Component creation guidelines
- `testing.mdc` - Test requirements
- `performance.mdc` - Performance budgets
- `react-native.mdc` - Platform-specific best practices

## Adding New Components

See [packages/design-system/ADDING_COMPONENTS.md](./packages/design-system/ADDING_COMPONENTS.md) for detailed guide on adding React Native Reusables components to the design system.

## Quick Start (New App)

```bash
# Clone the template
cp -r packages/app-template ../my-new-app
cd ../my-new-app

# Install dependencies
bun install

# Run on iOS
npx expo prebuild
npx expo run:ios

# Run on web
bun run web
```

Your new app now has:
- ✅ Design system components
- ✅ Squircle aesthetic
- ✅ Dark branding
- ✅ Generative UI ready (galerie + streamdown available)

## Performance Philosophy

### Streaming Apps
Our apps stream content character-by-character. Performance is critical:
- Control panels must remain responsive during streaming
- Use React Context for debug/streaming data
- Never pass changing strings as props (use lengths/counts)
- Test with 50ms streaming intervals

### Common Pitfalls
```tsx
// ❌ BAD - Re-renders every character
<Controls streamingText={text} />

// ✅ GOOD - Stable prop
<Controls streamingLength={text.length} />
```

## Icon Selection

We use **Lucide React Native** for all icons in the Dark Design System.

### Finding Icons

1. **Browse icons**: https://lucide.dev/icons/
2. **Search**: Use the search bar on the Lucide website
3. **Import**: Use the exact icon name from the website (e.g., `Plus`, `Home`, `Settings`)

### Usage

**Always import from design-system** (never import directly from `lucide-react-native`):

```tsx
import { FAB, Plus } from '@darkresearch/design-system';

<FAB
  icon={
    <Plus
      size={20}
      color="#EEEDED"
      strokeWidth={1.5}
    />
  }
  onPress={() => {}}
/>
```

### Icon Props

- `size`: Number (default: 24) - Size in pixels
- `color`: String (default: "currentColor") - Icon color
- `strokeWidth`: Number (default: 2) - Stroke width

See `.cursor/rules/icons.mdc` for complete icon selection guide.

## AI Development Best Practices

1. **Start with tests** - Write test cases first, implementation second
2. **Visual feedback** - Run Storybook while developing
3. **Iterate fast** - AI can regenerate components quickly
4. **Trust but verify** - Always run test suite before committing

## Questions?
See detailed rules in `.cursor/rules/` or ask in #engineering.

