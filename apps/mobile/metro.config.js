const path = require('path')

const {getDefaultConfig} = require('expo/metro-config')
const {createMarkdownResolver} = require('./markdown-transformer')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot, {
  unstable_enableNewArchitecture: true,
  unstable_enablePackageExports: true,
  experimentalImportBundleSupport: true,
})

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'packages/api/node_modules'),
  path.resolve(workspaceRoot, 'packages/blockchains/node_modules'),
  path.resolve(workspaceRoot, 'packages/claim/node_modules'),
  path.resolve(workspaceRoot, 'packages/common/node_modules'),
  path.resolve(workspaceRoot, 'packages/dapp-connector/node_modules'),
  path.resolve(workspaceRoot, 'packages/exchange/node_modules'),
  path.resolve(workspaceRoot, 'packages/explorers/node_modules'),
  path.resolve(workspaceRoot, 'packages/identicon/node_modules'),
  path.resolve(workspaceRoot, 'packages/links/node_modules'),
  path.resolve(workspaceRoot, 'packages/notifications/node_modules'),
  path.resolve(workspaceRoot, 'packages/portfolio/node_modules'),
  path.resolve(workspaceRoot, 'packages/resolver/node_modules'),
  path.resolve(workspaceRoot, 'packages/setup-wallet/node_modules'),
  path.resolve(workspaceRoot, 'packages/swap/node_modules'),
  path.resolve(workspaceRoot, 'packages/theme/node_modules'),
  path.resolve(workspaceRoot, 'packages/transfer/node_modules'),
  path.resolve(workspaceRoot, 'packages/types/node_modules'),
]

// NOTE: workaround for the structure now
config.resolver.disableHierarchicalLookup = true
config.resolver.enablePackageExports = true

config.resolver.extraNodeModules = {
  '@yoroi/api': path.resolve(workspaceRoot, 'packages/api'),
  '@yoroi/blockchains': path.resolve(workspaceRoot, 'packages/blockchains'),
  '@yoroi/claim': path.resolve(workspaceRoot, 'packages/claim'),
  '@yoroi/common': path.resolve(workspaceRoot, 'packages/common'),
  '@yoroi/dapp-connector': path.resolve(workspaceRoot, 'packages/dapp-connector'),
  '@yoroi/exchange': path.resolve(workspaceRoot, 'packages/exchange'),
  '@yoroi/explorers': path.resolve(workspaceRoot, 'packages/explorers'),
  '@yoroi/identicon': path.resolve(workspaceRoot, 'packages/identicon'),
  '@yoroi/links': path.resolve(workspaceRoot, 'packages/links'),
  '@yoroi/notifications': path.resolve(workspaceRoot, 'packages/notifications'),
  '@yoroi/portfolio': path.resolve(workspaceRoot, 'packages/portfolio'),
  '@yoroi/resolver': path.resolve(workspaceRoot, 'packages/resolver'),
  '@yoroi/setup-wallet': path.resolve(workspaceRoot, 'packages/setup-wallet'),
  '@yoroi/swap': path.resolve(workspaceRoot, 'packages/swap'),
  '@yoroi/theme': path.resolve(workspaceRoot, 'packages/theme'),
  '@yoroi/transfer': path.resolve(workspaceRoot, 'packages/transfer'),
  '@yoroi/types': path.resolve(workspaceRoot, 'packages/types'),
  // Add absolute path aliases
  '~/ui': path.resolve(projectRoot, 'src/ui'),
  '~/features': path.resolve(projectRoot, 'src/features'),
  '~/hooks': path.resolve(projectRoot, 'src/hooks'),
  '~/kernel': path.resolve(projectRoot, 'src/kernel'),
  '~/wallets': path.resolve(projectRoot, 'src/wallets'),
  '~/components': path.resolve(projectRoot, 'src/ui'),
  '~/assets': path.resolve(projectRoot, 'assets'),
}

config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
  },
}

const shims = {
  'crypto': 'react-native-quick-crypto',
  'buffer': '@craftzdog/react-native-buffer',
  'react-native-get-random-values': 'react-native-quick-crypto',
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  return context.resolveRequest(
    context,
    shims[moduleName] ?? moduleName,
    platform,
  )
}

// Fix axios
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native']

// Add WASM support - treat as asset only
config.resolver.assetExts.push('wasm')

// Markdown support
config.resolver.sourceExts.push('md')

const originalResolveRequest = config.resolver.resolveRequest
const markdownResolver = createMarkdownResolver(__dirname)

// Set up the custom resolver for markdown
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const markdownResult = markdownResolver(context, moduleName, platform)
  if (markdownResult) {
    return markdownResult
  }

  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform)
}

module.exports = config
