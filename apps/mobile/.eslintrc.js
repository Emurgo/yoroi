module.exports = {
  extends: ['@yoroi/eslint-config'],
  rules: {
    // Disable Babel config requirement for metro.config.js
    '@babel/no-invalid-this': 'off',
  },
  overrides: [
    {
      files: ['metro.config.js'],
      parserOptions: {
        requireConfigFile: false,
      },
    },
  ],
} 