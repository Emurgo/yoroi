/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
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
}
