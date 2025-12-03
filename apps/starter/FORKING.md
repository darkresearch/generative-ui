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

4. **Install dependencies**:
   ```bash
   bun install
   ```

5. **Generate native projects and start developing**:
   ```bash
   # iOS
   npx expo prebuild --platform ios
   bun run ios
   
   # Android
   npx expo prebuild --platform android
   bun run android
   
   # Web
   bun run web
   ```

## What the Setup Script Does

The setup script (`setup.js`) automates the following:

- ✅ Updates `app.json` with your app name, slug, scheme, and bundle IDs
- ✅ Updates `package.json` with your package name
- ✅ Removes TypeScript path mappings if running standalone (keeps them for monorepo)

## Manual Setup (Without Script)

If you prefer to set up manually:

1. **Update `app.json`**:
   - Change `name`, `slug`, `scheme`
   - Update `ios.bundleIdentifier`
   - Update `android.package`

2. **Update `package.json`**:
   - Change `name` field

3. **Update `tsconfig.json`** (if standalone):
   - Remove the `paths` section if not using monorepo

## Troubleshooting

### TypeScript Errors About Path Mappings

If you're running standalone (not in monorepo), the setup script removes TypeScript path mappings. If you see errors, check that `tsconfig.json` doesn't have `paths` pointing to non-existent monorepo locations.

### Metro Bundler Errors

After forking, you may need to:
1. Clear Metro cache: `npx expo start --clear`
2. Rebuild native projects: `npx expo prebuild --clean`

## Next Steps

- Read the main [README.md](./README.md) for usage examples
- Review [AGENTS.md](../../AGENTS.md) for AI development workflow

