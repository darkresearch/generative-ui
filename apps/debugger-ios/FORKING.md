# Forking This Template

This guide will help you fork the Dark App Template and set it up for your own project.

## Quick Start

1. **Copy the template** outside the monorepo:
   ```bash
   cp -r apps/starter ../my-new-app
   cd ../my-new-app
   ```

2. **Run the setup script**:
   ```bash
   bun run setup
   # or
   node setup.js
   ```

3. **Follow the prompts** to configure:
   - App name
   - Package name
   - Bundle IDs
   - Design system dependency

4. **Install dependencies**:
   ```bash
   bun install
   ```

5. **Start developing**:
   ```bash
   # iOS
   npx expo prebuild
   bun run ios
   
   # Web
   bun run web
   ```

## What the Setup Script Does

The setup script (`setup.js`) automates the following:

- ✅ Updates `app.json` with your app name, slug, scheme, and bundle IDs
- ✅ Updates `package.json` with your package name
- ✅ Configures `@darkresearch/design-system` dependency (auto-detects monorepo or prompts)
- ✅ Removes TypeScript path mappings if running standalone (keeps them for monorepo)

## Design System Dependency

The template uses `@darkresearch/design-system`. The setup script will try to auto-detect the monorepo location. If it can't find it, you'll be prompted to choose:

### Option 1: Local Monorepo (Recommended for Development)
If you have the `generative-ui` monorepo nearby:
```json
"@darkresearch/design-system": "file:../../packages/design-system"
```

### Option 2: NPM Package (When Published)
When the design system is published to npm:
```json
"@darkresearch/design-system": "^1.0.0"
```

### Option 3: Workspace (Monorepo Development)
If you're developing within the monorepo:
```json
"@darkresearch/design-system": "workspace:*"
```

## Manual Setup (Without Script)

If you prefer to set up manually:

1. **Update `app.json`**:
   - Change `name`, `slug`, `scheme`
   - Update `ios.bundleIdentifier`
   - Update `android.package`

2. **Update `package.json`**:
   - Change `name` field
   - Update `@darkresearch/design-system` dependency

3. **Update `tsconfig.json`** (if standalone):
   - Remove the `paths` section if not using monorepo

## Troubleshooting

### "Cannot find module @darkresearch/design-system"

Make sure the design system dependency in `package.json` points to a valid location:
- If using `file:`, ensure the path is correct relative to your app
- If using npm, ensure the package is installed
- Run `bun install` after updating `package.json`

### TypeScript Errors About Path Mappings

If you're running standalone (not in monorepo), the setup script removes TypeScript path mappings. If you see errors, check that `tsconfig.json` doesn't have `paths` pointing to non-existent monorepo locations.

### Metro Bundler Errors

After forking, you may need to:
1. Clear Metro cache: `npx expo start --clear`
2. Rebuild native projects: `npx expo prebuild --clean`

## Next Steps

- Read the main [README.md](./README.md) for usage examples
- Check out the [Design System Documentation](../../packages/design-system/README.md)
- Review [AGENTS.md](../../AGENTS.md) for AI development workflow

