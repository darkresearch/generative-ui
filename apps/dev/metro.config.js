const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
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
    path.resolve(packagesRoot, 'streamdown-rn/node_modules'),
  ],
  // Ensure we can resolve workspace packages and remark dependencies
  extraNodeModules: {
    '@rn-primitives/label': path.resolve(monorepoRoot, 'node_modules/@rn-primitives/label'),
    '@rn-primitives/slot': path.resolve(monorepoRoot, 'node_modules/@rn-primitives/slot'),
    'remark': path.resolve(monorepoRoot, 'node_modules/remark'),
    'remark-gfm': path.resolve(monorepoRoot, 'node_modules/remark-gfm'),
    'mdast': path.resolve(monorepoRoot, 'node_modules/mdast'),
  },
};

module.exports = withNativeWind(config, { 
  input: '../../global.css',
  configPath: '../../tailwind.config.js',
});
