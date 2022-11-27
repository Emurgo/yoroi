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
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
  },
}

// module.exports = {
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     ecmaVersion: 'latest',
//     sourceType: 'module',
//     project: ['tsconfig.json'],
//   },
//   overrides: [
//     {
//       files: ['*.tsx'],
//       rules: {
//         '@typescript-eslint/strict-boolean-expressions': [
//           'error',
//           {allowString: false, allowNumber: false, allowNullableBoolean: true},
//         ],
//       },
//     },
//   ],
//   extends: [
//     'eslint:recommended',
//     'plugin:react/recommended',
//     'plugin:react-hooks/recommended',
//     'plugin:@typescript-eslint/recommended',
//     'plugin:react-prefer-function-component/recommended',
//     'prettier', // keep this last
//   ],
//   plugins: [
//     'react',
//     'react-native',
//     '@typescript-eslint',
//     'react-prefer-function-component',
//   ],
//   env: {'react-native/react-native': true},
//   settings: {
//     'import/resolver': {node: {extensions: ['.js', '.android.js', '.ios.js', '.json']}},
//     react: {version: 'detect'},
//   },
//   rules: {
//     'array-callback-return': 2,
//     'lines-between-class-members': [1, 'always', {exceptAfterSingleLine: true}],
//     'no-multiple-empty-lines': ['warn', {max: 2, maxEOF: 0}],
//     'react-native/no-raw-text': ['error', {skip: ['Markdown']}],
//     'react-native/no-unused-styles': 2,
//     'react-native/split-platform-components': 0,
//     'react/display-name': 0,
//     'react/no-access-state-in-setstate': 2,
//     'react/no-typos': 2,
//     'react/sort-comp': [2, {order: ['instance-variables', 'lifecycle', 'everything-else', 'render']}],
//     '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}],
//     'simple-import-sort/exports': 'error',
//     'simple-import-sort/imports': 'error',
//     'spaced-comment': 1,
//     'no-unused-vars': 'off',
//     'react/jsx-curly-brace-presence': ['warn', {props: 'never', children: 'never'}],
//     'no-return-await': 'error',
//     'no-template-curly-in-string': 'error',
//   },
//   globals: {
//     Buffer: false,
//     Symbol: false,
//     Uint8Array: false,
//     TextEncoder: false,
//     $Call: false,
//     $Values: false,
//     test: false,
//     expect: false,
//     describe: false,
//     it: false,
//     beforeEach: false,
//     React$Node: false,
//   },
// }
