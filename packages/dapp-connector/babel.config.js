module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'babel-plugin-show-source',
      {
        directive: 'show source please',
        removeFunction: true,
        // change the directive when in use with hermes
      },
    ],
  ],
}
