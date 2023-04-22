module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'react-intl',
      {
        messagesDir: './translations/messages/',
        extractSourceLocation: true,
      },
    ],
    '@babel/plugin-proposal-export-namespace-from',
  ],
}
