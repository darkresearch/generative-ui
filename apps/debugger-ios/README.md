# Dark App Template

Quick-start template for new React Native apps with Dark design system.

## Features

- ✅ **Design System**: `@darkresearch/design-system` pre-configured
- ✅ **Generative UI Ready**: `galerie-rn` + `streamdown-rn` available
- ✅ **Squircles**: Modern iOS-style rounded corners
- ✅ **Dark Branding**: #EEEDED + #262626 color system
- ✅ **NativeWind**: Tailwind CSS for React Native
- ✅ **Cross-platform**: iOS, Android, Web

## Quick Start

### Forking This Template

**⚠️ Important**: This template must be copied OUTSIDE the monorepo to work properly.

```bash
# From monorepo root
cp -r apps/starter ../my-new-app
cd ../my-new-app

# Run the setup script to configure your app
bun run setup

# Install dependencies
bun install

# Run on iOS
npx expo prebuild
bun run ios

# Run on web
bun run web
```

The setup script will prompt you for:
- App name
- Package name
- Bundle IDs (iOS/Android)
- Design system dependency path

See [FORKING.md](./FORKING.md) for detailed forking instructions and troubleshooting.

### Using in Monorepo

If you're developing within the monorepo, you can use the template as-is. The setup script will detect the monorepo context and preserve workspace dependencies.

## Testing

This template includes Storybook stories (`App.stories.tsx`) as reference examples following our `.cursor/rules/testing.mdc` guidelines.

**Visual testing**:
```bash
npm run storybook # Visual component gallery
```

**Note**: Automated testing infrastructure will be added in a future update.

## Project Structure

```
my-new-app/
├── App.tsx              # Main app entry
├── components/          # Your app components
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Available Packages

- `@darkresearch/design-system` - UI components
- `streamdown-rn` - Streaming markdown renderer
- `galerie-rn` - Generative UI canvas

## Learn More

- [Design System Documentation](../../design-system/README.md)
- [Cursor AI Rules](.cursor/rules/)
- [AGENTS.md](../../AGENTS.md) - AI development workflow

