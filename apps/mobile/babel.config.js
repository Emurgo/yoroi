module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-export-namespace-from',
      [
        // Used by @yoroi/dapp-connector to create injectable JS code
        'babel-plugin-show-source',
        {
          // directive needs to be changed from 'show source' when in use with hermes
          directive: 'babel plugin show source',
          removeFunction: true,
        },
      ],
      [
        "formatjs",
        {
          "idInterpolationPattern": "[sha512:contenthash:base64:6]",
          "ast": true
        }
      ]
    ],
  }
}
