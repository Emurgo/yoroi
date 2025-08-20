// metro.config.js
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.unstable_enableSymlinks = true

// ✅ Guarantee singletons - prioritize main app's node_modules
config.resolver.extraNodeModules = {
  buffer: require.resolve('@craftzdog/react-native-buffer'), // keep your buffer fix
  react: path.join(projectRoot, 'node_modules/react'),
  'react/jsx-runtime': path.join(projectRoot, 'node_modules/react/jsx-runtime.js'),
  'react-native': path.join(projectRoot, 'node_modules/react-native'),
  'react-dom': path.join(projectRoot, 'node_modules/react-dom'),
  '@react-native-async-storage/async-storage': path.join(projectRoot, 'node_modules/@react-native-async-storage/async-storage'),
  '@tanstack/react-query': path.join(projectRoot, 'node_modules/@tanstack/react-query'),
  'axios': path.join(projectRoot, 'node_modules/axios'),
  'bignumber.js': path.join(projectRoot, 'node_modules/bignumber.js'),
  'immer': path.join(projectRoot, 'node_modules/immer'),
  'rxjs': path.join(projectRoot, 'node_modules/rxjs'),
  'zod': path.join(projectRoot, 'node_modules/zod'),
  'react-native-mmkv': path.join(projectRoot, 'node_modules/react-native-mmkv'),
}

// Explicitly set nodeModulesPaths to prioritize main app
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
]

// keep your other settings (assetExts, etc.)
config.resolver.assetExts.push('wasm')
config.transformer.unstable_allowRequireContext = true
config.transformer.minifierConfig = { compress: { drop_console: true } }

// Enhanced blocklist to prevent duplicate packages from local packages
const exclusionList = require('metro-config/src/defaults/exclusionList')
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const pkgsRoot = path.join(workspaceRoot, 'packages') // adjust if different
const patterns = [
  new RegExp(`${esc(pkgsRoot)}.*?/node_modules/react(?:/.*)?$`),
  new RegExp(`${esc(pkgsRoot)}.*?/node_modules/react-dom(?:/.*)?$`),
  new RegExp(`${esc(pkgsRoot)}.*?/node_modules/react-native(?:/.*)?$`),
]
config.resolver.blockList = exclusionList(patterns)

module.exports = config