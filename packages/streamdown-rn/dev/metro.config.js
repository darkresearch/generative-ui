const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Monorepo root directory
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../');

// Watch the workspace root so changes in packages are detected
config.watchFolders = [workspaceRoot];

// Resolve packages from workspace root node_modules as well
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force resolution of shared dependencies to the root node_modules to avoid duplicates
config.resolver.disableHierarchicalLookup = true;

// Add woff2 to asset extensions for font loading
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'woff2',
];

module.exports = config;
