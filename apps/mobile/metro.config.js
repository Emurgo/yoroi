const path = require('path')

const {getDefaultConfig} = require('expo/metro-config')

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
  path.resolve(workspaceRoot, 'packages/common/node_modules'),
  path.resolve(workspaceRoot, 'packages/theme/node_modules'),
  path.resolve(workspaceRoot, 'packages/identicon/node_modules'),
  path.resolve(workspaceRoot, 'packages/types/node_modules'),
]

// NOTE: workaround for the structure now
config.resolver.disableHierarchicalLookup = true
// config.resolver.enablePackageExports = true

config.resolver.extraNodeModules = {
  '@yoroi/common': path.resolve(workspaceRoot, 'packages/common'),
  '@yoroi/theme': path.resolve(workspaceRoot, 'packages/theme'),
  '@yoroi/identicon': path.resolve(workspaceRoot, 'packages/identicon'),
  '@yoroi/types': path.resolve(workspaceRoot, 'packages/types'),
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

module.exports = config
