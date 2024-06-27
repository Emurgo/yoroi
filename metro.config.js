const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot: path.resolve(__dirname, "apps/wallet-mobile"),
  watchFolders: [
    path.resolve(__dirname, "apps/wallet-mobile"),
    path.resolve(__dirname, "node_modules"),
    path.resolve(__dirname, "packages/api"),
    path.resolve(__dirname, "packages/common"),
    path.resolve(__dirname, "packages/dapp-connector"),
    path.resolve(__dirname, "packages/exchange"),
    path.resolve(__dirname, "packages/explorers"),
    path.resolve(__dirname, "packages/identicon"),
    path.resolve(__dirname, "packages/links"),
    path.resolve(__dirname, "packages/portfolio"),
    path.resolve(__dirname, "packages/resolver"),
    path.resolve(__dirname, "packages/setup-wallet"),
    path.resolve(__dirname, "packages/staking"),
    path.resolve(__dirname, "packages/swap"),
    path.resolve(__dirname, "packages/theme"),
    path.resolve(__dirname, "packages/transfer"),
    path.resolve(__dirname, "packages/types"),
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
  /*
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  */
};
module.exports = mergeConfig(getDefaultConfig(__dirname), config);
