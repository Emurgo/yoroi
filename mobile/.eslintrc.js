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
    // Forbid 'any' type - requires explicit exception comment
    '@typescript-eslint/no-explicit-any': [
      'error',
      {
        fixToUnknown: false,
        ignoreRestArgs: false,
      },
    ],
    // Forbid 'class' keyword - requires explicit exception comment
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ClassDeclaration',
        message:
          'Classes are forbidden. Use factory functions or functional patterns instead. Add eslint-disable comment with explanation if exception needed.',
      },
      {
        selector: 'ClassExpression',
        message:
          'Classes are forbidden. Use factory functions or functional patterns instead. Add eslint-disable comment with explanation if exception needed.',
      },
      {
        selector: 'CallExpression[callee.type="Import"]',
        message:
          'Dynamic imports are forbidden. Use static imports instead. Add eslint-disable comment with explanation if exception needed.',
      },
    ],
    // Forbid 'require' statements - requires explicit exception comment
    '@typescript-eslint/no-require-imports': 'error',
    '@typescript-eslint/no-var-requires': 'error',
  },
  overrides: [
    {
      files: ['metro.config.js', '.eslintrc.js'],
      parserOptions: {
        requireConfigFile: false,
      },
      rules: {
        // Allow require in config files
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
}
