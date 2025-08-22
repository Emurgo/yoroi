module.exports = {
  extends: ['@react-native', 'prettier'],
  plugins: ['prettier'],
  rules: {
    '@babel/no-invalid-this': 'off',
    'react-native/no-inline-styles': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'react/no-unstable-nested-components': ['error', {allowAsProps: true}],
    'eqeqeq': 'off',
    'prettier/prettier': 'error',
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
