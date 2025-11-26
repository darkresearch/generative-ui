#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionWithDefault(prompt, defaultValue) {
  return new Promise((resolve) => {
    rl.question(`${prompt} [${defaultValue}]: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function detectMonorepo() {
  const currentDir = process.cwd();
  const designSystemPath = path.resolve(currentDir, '../../packages/design-system');
  const rootPackageJson = path.resolve(currentDir, '../../package.json');
  
  // Check if design-system exists at monorepo path
  if (fs.existsSync(designSystemPath)) {
    // Check if root package.json has workspaces
    if (fs.existsSync(rootPackageJson)) {
      try {
        const rootPkg = JSON.parse(fs.readFileSync(rootPackageJson, 'utf8'));
        if (rootPkg.workspaces) {
          return { isMonorepo: true, designSystemPath };
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
  
  return { isMonorepo: false, designSystemPath: null };
}

function validatePackageName(name) {
  // npm package name rules: lowercase, no spaces, can have hyphens
  return /^[a-z0-9][a-z0-9-]*$/.test(name);
}

function validateBundleId(bundleId) {
  // Bundle ID format: com.example.appname
  return /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(bundleId);
}

function updateAppJson(appName, slug, scheme, bundleId, androidPackage) {
  const appJsonPath = path.join(process.cwd(), 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  appJson.expo.name = appName;
  appJson.expo.slug = slug;
  appJson.expo.scheme = scheme;
  appJson.expo.ios.bundleIdentifier = bundleId;
  appJson.expo.android.package = androidPackage;
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log('✓ Updated app.json');
}

function updatePackageJson(packageName, designSystemDep) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.name = packageName;
  if (designSystemDep) {
    packageJson.dependencies['@darkresearch/design-system'] = designSystemDep;
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✓ Updated package.json');
}

function updateTsConfig(isStandalone) {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  if (isStandalone) {
    // Remove path mappings for standalone
    delete tsConfig.compilerOptions.paths;
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2) + '\n');
    console.log('✓ Updated tsconfig.json (removed monorepo path mappings)');
  } else {
    console.log('✓ Kept tsconfig.json path mappings (monorepo mode)');
  }
}

function detectDesignSystemPath() {
  const currentDir = process.cwd();
  const possiblePaths = [
    path.resolve(currentDir, '../../packages/design-system'),
    path.resolve(currentDir, '../generative-ui/packages/design-system'),
    path.resolve(currentDir, '../../generative-ui/packages/design-system'),
  ];
  
  for (const pkgPath of possiblePaths) {
    const packageJsonPath = path.join(pkgPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      // Calculate relative path
      const relativePath = path.relative(currentDir, pkgPath);
      return `file:${relativePath}`;
    }
  }
  
  return null;
}

async function main() {
  console.log('\n🚀 Dark App Template Setup\n');
  
  const { isMonorepo, designSystemPath } = detectMonorepo();
  
  if (isMonorepo) {
    console.log('ℹ️  Detected monorepo context.');
    console.log('   This script will configure the app for monorepo development.');
    console.log('   Workspace dependencies will be preserved.\n');
    
    // Check if we're in apps/starter itself (should copy first)
    const currentDirName = path.basename(process.cwd());
    if (currentDirName === 'starter') {
      console.log('⚠️  Warning: You appear to be running setup in apps/starter itself.');
      console.log('   For a new app, copy this template to apps/your-app-name first.\n');
      
      const proceed = await question('Continue anyway? (yes/no): ');
      if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
      console.log('');
    }
  }
  
  // Prompt for app details
  console.log('Please provide the following information:\n');
  
  let appName = await question('App name (e.g., "My App"): ');
  while (!appName.trim()) {
    appName = await question('App name cannot be empty. Please enter app name: ');
  }
  
  let packageName = await questionWithDefault('Package name (e.g., "my-app")', 'my-app');
  while (!validatePackageName(packageName)) {
    console.log('Invalid package name. Must be lowercase, alphanumeric, and can contain hyphens.');
    packageName = await question('Package name: ');
  }
  
  const slug = await questionWithDefault('Slug (for Expo)', packageName);
  const scheme = await questionWithDefault('URL scheme', packageName);
  
  let bundleId = await questionWithDefault('iOS Bundle ID (e.g., "com.example.myapp")', `com.example.${packageName}`);
  while (!validateBundleId(bundleId)) {
    console.log('Invalid bundle ID. Must be in format: com.example.appname');
    bundleId = await question('iOS Bundle ID: ');
  }
  
  let androidPackage = await questionWithDefault('Android package name', bundleId);
  while (!validateBundleId(androidPackage)) {
    console.log('Invalid Android package. Must be in format: com.example.appname');
    androidPackage = await question('Android package name: ');
  }
  
  // Handle design-system dependency
  let designSystemDep = null;
  const detectedPath = detectDesignSystemPath();
  
  if (detectedPath) {
    console.log(`\n✓ Detected design-system at: ${detectedPath}`);
    designSystemDep = detectedPath;
  } else {
    console.log('\n⚠️  Could not auto-detect @darkresearch/design-system path.');
    console.log('   Options:');
    console.log('   1. Use file: path to local monorepo');
    console.log('   2. Use npm package (when published)');
    console.log('   3. Leave as workspace:* (for monorepo development)');
    
    const depChoice = await questionWithDefault('Design system dependency [file path/npm/workspace]', 'workspace');
    
    if (depChoice === 'file' || depChoice.startsWith('file:')) {
      const filePath = depChoice.startsWith('file:') 
        ? depChoice 
        : await question('Enter file: path (e.g., "file:../../packages/design-system"): ');
      designSystemDep = filePath.startsWith('file:') ? filePath : `file:${filePath}`;
    } else if (depChoice === 'npm') {
      const npmVersion = await questionWithDefault('npm version (e.g., "^1.0.0")', 'latest');
      designSystemDep = npmVersion;
    } else {
      // Keep workspace:*
      designSystemDep = 'workspace:*';
    }
  }
  
  // Determine if standalone (no monorepo detected)
  const isStandalone = !isMonorepo && !detectedPath;
  
  console.log('\n📝 Updating files...\n');
  
  // Update files
  updateAppJson(appName, slug, scheme, bundleId, androidPackage);
  updatePackageJson(packageName, designSystemDep);
  updateTsConfig(isStandalone);
  
  console.log('\n✅ Setup complete!\n');
  console.log('Next steps:');
  console.log('  1. Run: bun install');
  console.log('  2. Run: npx expo prebuild (for iOS/Android)');
  console.log('  3. Run: bun run ios (or android/web)');
  console.log('\n');
  
  rl.close();
}

main().catch((error) => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});

