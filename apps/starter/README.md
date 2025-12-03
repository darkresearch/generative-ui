# Starter Template

Quick-start template for new React Native apps using the generative-ui packages.

## Features

- ✅ **Expo** — Universal React Native framework
- ✅ **streamdown-rn** — Streaming markdown renderer
- ✅ **galerie-rn** — Generative UI canvas (experimental)
- ✅ **Cross-platform** — iOS, Android, Web

## Quick Start

### Forking This Template

**⚠️ Important**: Copy this template OUTSIDE the monorepo to use it.

```bash
# From monorepo root
cp -r apps/starter ../my-new-app
cd ../my-new-app

# Run the setup script to configure your app
bun run setup

# Install dependencies
bun install

# Generate native projects
npx expo prebuild

# Run on iOS
bun run ios

# Run on web
bun run web
```

The setup script will prompt you for:
- App name
- Package name
- Bundle IDs (iOS/Android)

See [FORKING.md](./FORKING.md) for detailed instructions.

### Using in Monorepo

If developing within the monorepo, you can run directly:

```bash
cd apps/starter
bun install
npx expo prebuild
bun run ios
```

## Project Structure

```
starter/
├── src/
│   ├── App.tsx          # Main app component
│   ├── components/      # App components
│   └── useFonts.ts      # Font loading
├── assets/              # Images, fonts
├── app.json             # Expo configuration
└── package.json
```

## Available Packages

After forking, you can use these packages:

```tsx
import { StreamdownRN } from 'streamdown-rn';
import { Canvas } from 'galerie-rn';  // experimental
```

## Learn More

- [streamdown-rn Documentation](../../packages/streamdown-rn/README.md)
- [AGENTS.md](../../AGENTS.md) — AI development workflow
