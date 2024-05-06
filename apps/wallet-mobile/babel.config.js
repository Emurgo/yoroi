module.exports = (api) => {
  api.cache(true)

  const presets = ['module:@react-native/babel-preset']
  const plugins = [
    [
      // Used by @yoroi/dapp-connector to create injectable JS code
      'babel-plugin-show-source',
      {
        // directive needs to be changed from 'show source' when in use with hermes
        directive: 'babel plugin show source',
        removeFunction: true,
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
