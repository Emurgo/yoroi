// @flow

module.exports = {
  extends: [
    'vacuumlabs',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:flowtype/recommended',
    'prettier',
  ],
  plugins: ['react', 'react-native', 'flowtype'],
  env: {
    'react-native/react-native': true,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.android.js', '.ios.js', '.json'],
      },
    },
  },
  rules: {
    'array-callback-return': 2,
    'lines-between-class-members': [1, 'always', {exceptAfterSingleLine: true}],
    'spaced-comment': 1,
    'react/no-access-state-in-setstate': 2,
    'react/no-multi-comp': 0,
    'react/display-name': 0,
    'no-multi-str': 0,
    'no-lone-blocks': 0,
    'react/no-typos': 2,
    'no-duplicate-imports': 0,
    'import/no-duplicates': 1,
    'react-native/no-unused-styles': 2,
    'no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
    'react-native/split-platform-components': 0,
    'react-native/no-inline-styles': 2,
    'react/sort-comp': [
      2,
      {
        order: ['instance-variables', 'lifecycle', 'everything-else', 'render'],
      },
    ],
    'flowtype/require-valid-file-annotation': [2, 'always'],
    'flowtype/newline-after-flow-annotation': [2, 'always'],
  },
  globals: {
    Buffer: false,
    Symbol: false,
    Uint8Array: false,
    TextEncoder: false,
    $Call: false,
    $Values: false,
    test: false,
    expect: false,
    describe: false,
    it: false,
    beforeEach: false,
    React$Node: false,
  },
}
