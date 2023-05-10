const path = require("path");

module.exports = {
  projectRoot: path.resolve(__dirname, "apps/wallet-mobile"),
  watchFolders: [
    path.resolve(__dirname, "apps/wallet-mobile"),
    path.resolve(__dirname, "packages/metrics/src"),
    path.resolve(__dirname, "node_modules"),
  ],
  resolver: {
    resolverMainFields: ["sbmodern", "react-native", "browser", "main"],
    sourceExts: ["js", "jsx", "ts", "tsx", "json", "md"],
    assetExts: ["png", "jpg", "jpeg", "ttf", "otf", "woff", "woff2"],
    extraNodeModules: {
      buffer: require.resolve('@craftzdog/react-native-buffer'),
      crypto: require.resolve("react-native-crypto"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url"),
      util: require.resolve("util"),
      vm: require.resolve("vm-browserify"),
      '@yoroi/metrics': path.resolve(__dirname, 'packages/metrics/src'),
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
