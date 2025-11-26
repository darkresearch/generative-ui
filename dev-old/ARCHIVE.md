# Dev App Archive

This directory contains the full-featured development playground app that was used to test and develop streamdown-rn and the design system.

## Purpose

When rebuilding the dev app on the minimal-app boilerplate, use this archive as a reference for all features and components.

## Components

### ContentArea (`components/ContentArea/`)
- **ContentArea.tsx**: Main content area component that displays streaming markdown
- **InputArea.tsx**: Input area for editing markdown
- **OutputArea.tsx**: Output area that renders streamdown-rn with component registry

### ControlCenter (`components/ControlCenter/`)
- **ControlCenter.tsx**: Main control center component (platform-aware)
- **MobileControlCenter.tsx**: Mobile-specific control center UI
- **WebControlCenter.tsx**: Web-specific control center UI with resizable panel
- **tabs/ComponentsTab.tsx**: Tab showing available components
- **tabs/ControlsTab.tsx**: Tab with playback controls
- **tabs/DebugTab.tsx**: Tab showing debug state and component extraction
- **controls/PlaybackControls.tsx**: Play/pause/reset/step controls
- **controls/PresetChips.tsx**: Preset selection chips
- **controls/SpeedSlider.tsx**: Streaming speed control
- **controls/ThemeToggle.tsx**: Theme switcher (dark/light)

### Other Components
- **Header.tsx**: App header component
- **TestComponents.tsx**: Test component registry and source code

## Hooks

### useStreaming (`hooks/useStreaming.ts`)
- Streaming simulation with typewriter effect
- Controls: start, pause, resume, stop, reset, step backward/forward
- Manages streaming state and current position

### useFonts (`hooks/useFonts.ts`)
- Loads custom fonts (Satoshi font family)
- Platform-specific font handling

### useKeyboardNavigation (`hooks/useKeyboardNavigation.ts`)
- Keyboard shortcuts for streaming controls
- Arrow keys for stepping through content

## Contexts

### DebugContext (`contexts/DebugContext.tsx`)
- Provides debug state to components
- Includes: incomplete tag state, current text, component extraction state, component registry
- Used by DebugTab to display internal parsing state

## Constants

### presets.ts
- Markdown presets for testing different scenarios
- Includes: Basic, Progressive, Complex, etc.

### colors.ts
- Color constants used throughout the app
- Background, foreground, accent colors

### paperTheme.ts
- **NOTE**: Uses `react-native-paper` theme system
- **When rebuilding**: Replace with React Native Reusables theme system
- Defines light and dark themes for Material Design 3

## Features

### Streaming Simulation
- Character-by-character streaming effect
- Adjustable speed (ms per character)
- Pause/resume functionality
- Step backward/forward through content

### Preset System
- Pre-defined markdown examples
- Quick switching between test cases
- Resets streaming state on change

### Theme Toggle
- Dark/light theme switching
- Currently uses react-native-paper themes
- **When rebuilding**: Use NativeWind/Tailwind theme system

### Debug Panel
- Real-time debug state display
- Component extraction state visualization
- Incomplete tag state monitoring
- Component registry browser

### Component Registry
- Dynamic component injection for streamdown-rn
- Test components: TokenCard, Button, Badge
- Source code display for each component

## Dependencies Used

- `react-native-paper`: **REMOVE** - Replace with React Native Reusables components
- `@darkresearch/design-system`: UI components
- `streamdown-rn`: Streaming markdown renderer
- `react-native-tab-view`: Tab navigation
- `@hugeicons/react-native`: Icons
- Custom fonts: Satoshi (Bold, Medium, Regular)

## Migration Notes

When rebuilding on minimal-app boilerplate:

1. **Replace react-native-paper**: All Paper components should use Reusables equivalents:
   - `Paper` → Reusables `Button`
   - `Card` → Reusables `Card`
   - `Chip` → Reusables `Badge` or `Chip`
   - `SegmentedButtons` → Reusables `ToggleGroup`
   - `Modal`, `Portal` → Reusables `Dialog` or `Sheet`
   - `TextInput` → Reusables `Input`
   - Remove `PaperProvider` wrapper

2. **Theme System**: Replace `paperTheme.ts` with NativeWind/Tailwind theme classes

3. **Fonts**: Keep `useFonts` hook but verify font loading works with new setup

4. **Structure**: Keep component organization (ContentArea, ControlCenter, etc.)

5. **Hooks**: All hooks should work as-is, just verify imports

6. **Constants**: Presets and colors can be reused directly

## File Structure

```
dev/
├── App.tsx                    # Main app entry point
├── components/
│   ├── ContentArea/           # Content display components
│   ├── ControlCenter/         # Control panel components
│   ├── Header.tsx
│   └── TestComponents.tsx    # Component registry
├── constants/
│   ├── colors.ts
│   ├── paperTheme.ts         # Replace with Tailwind theme
│   └── presets.ts
├── contexts/
│   └── DebugContext.tsx
├── hooks/
│   ├── useFonts.ts
│   ├── useKeyboardNavigation.ts
│   └── useStreaming.ts
└── assets/
    └── fonts/                # Satoshi font files
```

## Key Implementation Details

- Streaming uses `setTimeout` for character-by-character rendering
- Debug state updates are scheduled with `setTimeout` to avoid render conflicts
- Control panel width is adjustable on web (resizable)
- Platform detection for mobile vs web UI
- Keyboard navigation only active when paused
- Component registry passed to streamdown-rn for dynamic rendering

