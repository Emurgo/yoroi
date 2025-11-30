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
    {
      files: ['**/*.d.ts'],
      rules: {
        // Type definition files often need 'any' and classes for third-party library compatibility
        '@typescript-eslint/no-explicit-any': 'off',
        'no-restricted-syntax': 'off',
      },
    },
    {
      files: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.mock.ts',
        '**/*.mock.tsx',
        '**/mocks.ts',
        '**/mocks.tsx',
        '**/mocks/**/*.ts',
        '**/mocks/**/*.tsx',
        '**/__mocks__/**/*.ts',
        '**/__mocks__/**/*.tsx',
      ],
      rules: {
        // Test and mock files can use 'any' for flexibility in testing scenarios
        '@typescript-eslint/no-explicit-any': 'off',
        // Test files can use classes for mocking and test utilities
        'no-restricted-syntax': 'off',
        // Test files can use require for dynamic test data loading
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['packages/types/index.ts'],
      rules: {
        // Error classes in namespace exports are allowed (they extend from centralized error classes)
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ClassDeclaration:not([superClass])',
            message:
              'Classes are forbidden. Use factory functions or functional patterns instead. Add eslint-disable comment with explanation if exception needed.',
          },
          {
            selector: 'ClassExpression:not([superClass])',
            message:
              'Classes are forbidden. Use factory functions or functional patterns instead. Add eslint-disable comment with explanation if exception needed.',
          },
          {
            selector: 'CallExpression[callee.type="Import"]',
            message:
              'Dynamic imports are forbidden. Use static imports instead. Add eslint-disable comment with explanation if exception needed.',
          },
        ],
      },
    },
    {
      files: [
        'packages/staking/governance/api.ts',
        'packages/staking/governance/manager.ts',
      ],
      rules: {
        // Implementation classes wrapped by factory functions - TODO: refactor to closures
        'no-restricted-syntax': 'off',
      },
    },
  ],
}
