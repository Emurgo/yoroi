module.exports = {
  extends: ['@react-native-community', 'prettier'],
  rules: {
    // Disable Babel config requirement for metro.config.js
    '@babel/no-invalid-this': 'off',
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
  overrides: [
    {
      files: ['metro.config.js', '.eslintrc.js'],
      parserOptions: {
        requireConfigFile: false,
      },
    },
  ],
} 