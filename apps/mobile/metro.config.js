const path = require('path')
const {getDefaultConfig} = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

config.resolver.disableHierarchicalLookup = true
config.resolver.extraNodeModules = {
  '@yoroi/common': path.resolve(workspaceRoot, 'packages/common'),
  '@yoroi/theme': path.resolve(workspaceRoot, 'packages/theme'),
  '@yoroi/identicon': path.resolve(workspaceRoot, 'packages/identicon'),
  '@yoroi/types': path.resolve(workspaceRoot, 'packages/types'),
}

module.exports = config
