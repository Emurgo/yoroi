module.exports = (api) => {
  api.cache(true)

  const presets = ['module:@react-native/babel-preset']
  const plugins = [
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
