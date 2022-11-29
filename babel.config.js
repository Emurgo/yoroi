module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
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
