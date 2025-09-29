const path = require('path')
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const projectRoot = __dirname
/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(projectRoot, {
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

// Add alias resolution for @yoroi/ and ~/ paths
config.resolver.alias = {
  // @yoroi aliases
  '@yoroi/api': path.resolve(projectRoot, './packages/api'),
  '@yoroi/blockchains': path.resolve(projectRoot, './packages/blockchains'),
  '@yoroi/claim': path.resolve(projectRoot, './packages/claim'),
  '@yoroi/common': path.resolve(projectRoot, './packages/common'),
  '@yoroi/dapp-connector': path.resolve(
    projectRoot,
    './packages/dapp-connector',
  ),
  '@yoroi/exchange': path.resolve(projectRoot, './packages/exchange'),
  '@yoroi/explorers': path.resolve(projectRoot, './packages/explorers'),
  '@yoroi/identicon': path.resolve(projectRoot, './packages/identicon'),
  '@yoroi/links': path.resolve(projectRoot, './packages/links'),
  '@yoroi/notifications': path.resolve(projectRoot, './packages/notifications'),
  '@yoroi/portfolio': path.resolve(projectRoot, './packages/portfolio'),
  '@yoroi/resolver': path.resolve(projectRoot, './packages/resolver'),
  '@yoroi/setup-wallet': path.resolve(projectRoot, './packages/setup-wallet'),
  '@yoroi/staking': path.resolve(projectRoot, './packages/staking'),
  '@yoroi/swap': path.resolve(projectRoot, './packages/swap'),
  '@yoroi/theme': path.resolve(projectRoot, './packages/theme'),
  '@yoroi/transfer': path.resolve(projectRoot, './packages/transfer'),
  '@yoroi/types': path.resolve(projectRoot, './packages/types'),

  // ~ aliases
  '~/ui': path.resolve(projectRoot, './src/ui'),
  '~/features': path.resolve(projectRoot, './src/features'),
  '~/hooks': path.resolve(projectRoot, './src/hooks'),
  '~/kernel': path.resolve(projectRoot, './src/kernel'),
  '~/wallets': path.resolve(projectRoot, './src/wallets'),
  '~/components': path.resolve(projectRoot, './src/ui'),
  '~/assets': path.resolve(projectRoot, './assets'),
}

config.resolver.unstable_enableSymlinks = true
config.resolver.unstable_enablePackageExports = true
config.resolver.unstable_enableHierarchicalSearch = false
config.resolver.assetExts.push('wasm')
config.resolver.assetExts.push('md')

// -- transformer --
config.transformer.unstable_allowRequireContext = true
config.transformer.minifierConfig = {compress: {drop_console: true}}

module.exports = config