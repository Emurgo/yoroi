module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        quoteProps: 'consistent',
        bracketSpacing: false,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'all',
        useTabs: false,
        semi: false,
      },
    ],
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', 'coverage/'],
}
