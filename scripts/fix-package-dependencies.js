#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Dependencies that should be in peerDependencies, not devDependencies
const RUNTIME_DEPS = [
  'react',
  'react-dom',
  'react-native',
  'bignumber.js',
  'axios',
  'immer',
  'rxjs',
  'zod',
  '@react-native-async-storage/async-storage',
  '@tanstack/react-query',
  'react-native-mmkv'
];

// Dependencies that should stay in devDependencies (build/test tools)
const DEV_DEPS = [
  '@babel/core',
  '@babel/preset-env',
  '@babel/runtime',
  '@commitlint/config-conventional',
  '@react-native-community/cli',
  '@react-native-community/cli-platform-android',
  '@react-native-community/cli-platform-ios',
  '@react-native/babel-preset',
  '@react-native/eslint-config',
  '@react-native/metro-config',
  '@react-native/typescript-config',
  '@release-it/conventional-changelog',
  '@testing-library/jest-dom',
  '@testing-library/react',
  '@testing-library/react-native',
  '@tsconfig/react-native',
  '@types/jest',
  '@types/react',
  '@types/react-test-renderer',
  'axios-mock-adapter',
  'babel-jest',
  'commitlint',
  'del-cli',
  'dependency-cruiser',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-ft-flow',
  'eslint-plugin-prettier',
  'flowgen',
  'jest',
  'jest-expo',
  'pod-install',
  'prettier',
  'react-native-builder-bob',
  'react-test-renderer',
  'release-it',
  'typescript'
];

function fixPackageJson(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  console.log(`Processing ${packagePath}...`);
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  let modified = false;

  // Initialize peerDependencies if it doesn't exist
  if (!packageJson.peerDependencies) {
    packageJson.peerDependencies = {};
  }

  // Move runtime dependencies from devDependencies to peerDependencies
  if (packageJson.devDependencies) {
    for (const dep of RUNTIME_DEPS) {
      if (packageJson.devDependencies[dep]) {
        console.log(`  Moving ${dep} from devDependencies to peerDependencies`);
        packageJson.peerDependencies[dep] = packageJson.devDependencies[dep];
        delete packageJson.devDependencies[dep];
        modified = true;
      }
    }
  }

  // Remove empty devDependencies object
  if (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length === 0) {
    delete packageJson.devDependencies;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`  ✅ Fixed ${packagePath}`);
  } else {
    console.log(`  ⏭️  No changes needed for ${packagePath}`);
  }
}

function main() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  
  if (!fs.existsSync(packagesDir)) {
    console.error('Packages directory not found');
    process.exit(1);
  }

  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(packagesDir, dirent.name));

  console.log('Fixing package dependencies...\n');

  for (const packagePath of packages) {
    fixPackageJson(packagePath);
  }

  console.log('\n✅ All packages processed!');
  console.log('\nNext steps:');
  console.log('1. Run "npm ci --omit-dev" in the mobile app directory');
  console.log('2. Clear Metro cache: "npx expo start --clear"');
}

if (require.main === module) {
  main();
}

module.exports = { fixPackageJson, RUNTIME_DEPS, DEV_DEPS };
