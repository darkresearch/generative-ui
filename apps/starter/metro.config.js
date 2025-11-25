const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const packagesRoot = path.resolve(monorepoRoot, 'packages');

const config = getDefaultConfig(projectRoot);

// Include monorepo root and packages in watchFolders for proper module resolution
config.watchFolders = [monorepoRoot, packagesRoot];

// Configure resolver to look in both app and monorepo node_modules
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ],
  // // Ensure we can resolve workspace packages
  // extraNodeModules: {
  //   'react-native-unistyles': path.resolve(monorepoRoot, 'node_modules/react-native-unistyles'),
  // },
};

module.exports = config;
