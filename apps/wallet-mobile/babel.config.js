module.exports = (api) => {
  api.cache(true)

  const presets = ['module:metro-react-native-babel-preset']
  const plugins = [
    [
      'babel-plugin-show-source',
      {
        directive: 'show source please',
        removeFunction: true,
        // change the directive when in use with hermes
      },
    ],
    [
      'react-intl',
      {
        messagesDir: './translations/messages/',
        extractSourceLocation: true,
      },
    ],
    '@babel/plugin-proposal-export-namespace-from',
    [
      'react-native-reanimated/plugin',
      {
        relativeSourceLocation: true,
      },
    ],
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.md'],
      },
    ],
  ]
  return {
    presets,
    plugins,
  }
}
