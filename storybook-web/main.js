// @flow
const path = require('path')

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
    // console.dir(config, {depth: null})
    return config
  },
}
