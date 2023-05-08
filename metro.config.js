const path = require('path');

module.exports = {
  projectRoot: path.resolve(__dirname, 'apps/wallet-mobile'),
  watchFolders: [
    path.resolve(__dirname, 'apps/wallet-mobile'),
    path.resolve(__dirname, 'node_modules'),
  ],
  resolver: {
    resolverMainFields: ['sbmodern', 'react-native', 'browser', 'main'],
    sourceExts: ['js', 'jsx', 'ts', 'tsx'],
    assetExts: ['png', 'md', 'json'],
    extraNodeModules: {
      buffer: require.resolve('safe-buffer'),
      crypto: require.resolve('react-native-crypto'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      vm: require.resolve('vm-browserify'),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
