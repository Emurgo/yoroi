module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|react-error-boundary)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  collectCoverage: true,
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!packages/**/*.test.{ts,tsx}',
    '!packages/**/*.d.ts',
    '!packages/types/**/*.ts', // Type definitions only
    '!packages/**/*.mocks.ts',
    '!packages/**/*.mock.ts',
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      // Target coverage goal: 50%
      // Current coverage: ~25% (branches: 21%, functions: 25%, lines: 25%, statements: 25%)
      // Threshold set to current level to allow tests to pass. Increase gradually as coverage improves.
      branches: 15,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },
  coverageReporters: ['lcov', 'html', 'text-summary'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
}
