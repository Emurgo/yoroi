module.exports = {
  resolver: {
    assetExts: ['png', 'md'],
    extraNodeModules: {
      buffer: require.resolve('safe-buffer'),
      crypto: require.resolve('react-native-crypto'),
      event: require.resolve('events'),
      fs: require.resolve('react-native-fs'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      url: require.resolve('url'),
      util: require.resolve('util'),
      vm: require.resolve('vm-browserify'),
    },
  },
}
