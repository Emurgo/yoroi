const { resolve } = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const projectRoot = resolve(__dirname, "apps/wallet-mobile");
/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot,
  watchFolders: [
    resolve(__dirname, "apps/wallet-mobile"),
    resolve(__dirname, "node_modules"),
    resolve(__dirname, "packages/api"),
    resolve(__dirname, "packages/common"),
    resolve(__dirname, "packages/dapp-connector"),
    resolve(__dirname, "packages/exchange"),
    resolve(__dirname, "packages/explorers"),
    resolve(__dirname, "packages/identicon"),
    resolve(__dirname, "packages/links"),
    resolve(__dirname, "packages/portfolio"),
    resolve(__dirname, "packages/resolver"),
    resolve(__dirname, "packages/setup-wallet"),
    resolve(__dirname, "packages/staking"),
    resolve(__dirname, "packages/swap"),
    resolve(__dirname, "packages/theme"),
    resolve(__dirname, "packages/transfer"),
    resolve(__dirname, "packages/types"),
  ],
  resolver: {
    resolverMainFields: ["sbmodern", "react-native", "browser", "main"],
    sourceExts: ["js", "jsx", "ts", "tsx", "json", "md", "svg", "mjs"],
    assetExts: ["png", "jpg", "jpeg", "ttf", "otf", "woff", "woff2"],
    extraNodeModules: {
      crypto: require.resolve("react-native-crypto"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url"),
      util: require.resolve("util"),
      vm: require.resolve("vm-browserify"),
    },
    unstable_enableSymlinks: true,
    /*
      transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  */
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
