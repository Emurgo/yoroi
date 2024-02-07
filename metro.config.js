const path = require("path");

module.exports = {
  projectRoot: path.resolve(__dirname, "apps/wallet-mobile"),
  watchFolders: [
    path.resolve(__dirname, "node_modules"),
    path.resolve(__dirname, "packages/types"),
    path.resolve(__dirname, "packages/common"),
    path.resolve(__dirname, "packages/api"),
    path.resolve(__dirname, "packages/banxa"),
    path.resolve(__dirname, "packages/links"),
    path.resolve(__dirname, "packages/resolver"),
    path.resolve(__dirname, "packages/openswap"),
    path.resolve(__dirname, "packages/swap"),
    path.resolve(__dirname, "packages/theme"),
    path.resolve(__dirname, "packages/staking"),
    path.resolve(__dirname, "apps/wallet-mobile"),
  ],
  resolver: {
    resolverMainFields: ["sbmodern", "react-native", "browser", "main"],
    sourceExts: ["js", "jsx", "ts", "tsx", "json", "md"],
    assetExts: ["png", "jpg", "jpeg", "ttf", "otf", "woff", "woff2"],
    extraNodeModules: {
      crypto: require.resolve("react-native-crypto"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url"),
      util: require.resolve("util"),
      vm: require.resolve("vm-browserify"),
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
