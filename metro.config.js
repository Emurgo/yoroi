const path = require("path");

module.exports = {
  projectRoot: path.resolve(__dirname, "apps/wallet-mobile"),
  watchFolders: [
    path.resolve(__dirname, "apps/wallet-mobile"),
    path.resolve(__dirname, "packages/metrics-react-native/src"),
    path.resolve(__dirname, "packages/types/src"),
    path.resolve(__dirname, "node_modules"),
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
      "@yoroi/metrics-react-native": path.resolve(
        __dirname,
        "packages/metrics-react-native/src"
      ),
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
