module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['@react-native-community', 'prettier'],
  plugins: ['@typescript-eslint', 'eslint-plugin-simple-import-sort'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
  rules: {
    'react/sort-comp': [2, {order: ['instance-variables', 'lifecycle', 'everything-else', 'render']}],
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
    'react-native/no-inline-styles': 0,
    'react-native/no-unused-styles': 2,
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
    '@typescript-eslint/no-explicit-any': 'error',
    'dot-notation': 0,
    'no-console': 'error',
  },
}
