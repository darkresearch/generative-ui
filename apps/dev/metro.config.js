const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const packagesRoot = path.resolve(monorepoRoot, 'packages');
const designSystemRoot = path.resolve(packagesRoot, 'design-system/src');

const config = getDefaultConfig(projectRoot);

// Include monorepo root and packages in watchFolders for proper module resolution
config.watchFolders = [monorepoRoot, packagesRoot];

// Configure resolver to look in both app and monorepo node_modules
const defaultResolver = config.resolver.resolveRequest;
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
    path.resolve(packagesRoot, 'streamdown-rn/node_modules'),
  ],
    resolveRequest: (context, moduleName, platform) => {
      // Handle react-native-unistyles resolution from workspace packages
      if (moduleName === 'react-native-unistyles') {
        return {
          filePath: path.resolve(monorepoRoot, 'node_modules/react-native-unistyles/lib/commonjs/index.js'),
          type: 'sourceFile',
        };
      }
      // Handle src/ imports when resolving from design-system package
      if (moduleName.startsWith('src/')) {
        const originPath = context.originModulePath || '';
        if (originPath.includes('design-system')) {
          const resolvedPath = path.resolve(designSystemRoot, moduleName.replace('src/', ''));
          // Try .tsx first, then .ts, then directory
          if (fs.existsSync(resolvedPath + '.tsx')) {
            return { filePath: resolvedPath + '.tsx', type: 'sourceFile' };
          }
          if (fs.existsSync(resolvedPath + '.ts')) {
            return { filePath: resolvedPath + '.ts', type: 'sourceFile' };
          }
          if (fs.existsSync(resolvedPath)) {
            return { filePath: resolvedPath, type: 'sourceFile' };
          }
        }
      }
      // Fall back to default resolver
      return defaultResolver ? defaultResolver(context, moduleName, platform) : context.resolveRequest(context, moduleName, platform);
    },
  // Ensure we can resolve workspace packages and remark dependencies
  extraNodeModules: {
    '@rn-primitives/label': path.resolve(monorepoRoot, 'node_modules/@rn-primitives/label'),
    '@rn-primitives/slot': path.resolve(monorepoRoot, 'node_modules/@rn-primitives/slot'),
    'remark': path.resolve(monorepoRoot, 'node_modules/remark'),
    'remark-gfm': path.resolve(monorepoRoot, 'node_modules/remark-gfm'),
    'mdast': path.resolve(monorepoRoot, 'node_modules/mdast'),
    'react-native-screens': path.resolve(projectRoot, 'node_modules/react-native-screens'),
    'react-native-reanimated': path.resolve(projectRoot, 'node_modules/react-native-reanimated'),
    'react-native-unistyles': path.resolve(monorepoRoot, 'node_modules/react-native-unistyles'),
  },
};

module.exports = config;
