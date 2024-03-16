module.exports = {
  presets: ["@babel/preset-env", "module:metro-react-native-babel-preset"],
  plugins: [["@babel/plugin-transform-private-methods", { "loose": true }]]
};
