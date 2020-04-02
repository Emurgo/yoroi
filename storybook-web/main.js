const path = require('path')

const rootDirectory = path.resolve(__dirname, '../')
// This is needed for webpack to compile JavaScript.
// Many OSS React Native packages are not compiled to ES5 before being
// published. If you depend on uncompiled packages they may cause webpack build
// errors. To fix this webpack can be configured to compile to the necessary
// `node_module`.
const babelLoaderConfiguration = {
  test: /\.js$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    // path.resolve(rootDirectory, 'app'),
    // path.resolve(rootDirectory, 'node_modules/react-native-uncompiled'),
    // path.resolve(rootDirectory, 'node_modules/react-native-vector-icons'),
    // path.resolve(rootDirectory, 'node_modules/react-navigation'),
    // path.resolve(rootDirectory, 'node_modules/react-native-drawer-layout'),
    // path.resolve(rootDirectory, 'node_modules/react-native-dismiss-keyboard'),
    // path.resolve(rootDirectory, 'node_modules/react-native-safe-area-view'),
    // path.resolve(rootDirectory, 'node_modules/react-native-tab-view'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      // Babel configuration (or use .babelrc)
      // This aliases 'react-native' to 'react-native-web' and includes only
      // the modules needed by the app.
      plugins: [
        // This is needed to polyfill ES6 async code in some of the above modules
        'babel-polyfill',
        // This aliases 'react-native' to 'react-native-web' to fool modules that only know
        // about the former into some kind of compatibility.
        'react-native-web',
      ],
      // The 'react-native' preset is recommended to match React Native's packager
      presets: ['react-native'],
    },
  },
}

//
// // This is needed for webpack to import static images in JavaScript files.
// const imageLoaderConfiguration = {
//   test: /\.(gif|jpe?g|png|svg)$/,
//   use: {
//     loader: 'url-loader',
//     options: {
//       name: '[name].[ext]',
//     },
//   },
// }

// taken from
// https://stackoverflow.com/questions/60696774/how-can-i-build-my-react-native-storybook-to-web
module.exports = {
  // stories: ['../storybook/index.js'],
  stories: ['../src/**/*.stories.[tj]s'],
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      'react-native$': 'react-native-web',
      // make sure we're rendering output using **web** Storybook not react-native
      '@storybook/react-native': '@storybook/react',
    }
    // mutate babel-loader
    config.module.rules[0].use[0].options.plugins.push(['react-native-web', {commonjs: true}])
    config.module.rules.push(babelLoaderConfiguration)
    console.dir(config, {depth: null})
    return config
  },
}
