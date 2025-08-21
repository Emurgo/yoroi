// metro.config.js
const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot, {
  unstable_enableNewArchitecture: true,
  experimentalImportBundleSupport: true,
})

// -- resolver --
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const shims = {
    'crypto': 'react-native-quick-crypto',
    'buffer': '@craftzdog/react-native-buffer',
    'react-native-get-random-values': 'react-native-quick-crypto',
  }
  return context.resolveRequest(
    context,
    shims[moduleName] ?? moduleName,
    platform,
  ) 
}
config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_enableHierarchicalSearch = false
config.resolver.assetExts.push('wasm')

// -- transformer --
config.transformer.unstable_allowRequireContext = true
config.transformer.minifierConfig = { compress: { drop_console: true } }

module.exports = config