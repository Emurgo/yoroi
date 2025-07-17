const upstreamTransformer = require('@react-native/metro-babel-transformer');

module.exports.transform = function ({src, filename, options}) {
  if (filename.endsWith('.md')) {
    const code = 'module.exports = ' + JSON.stringify(src) + ';';
    return upstreamTransformer.transform({
      src: code,
      filename,
      options,
    });
  }
  return upstreamTransformer.transform({src, filename, options});
};
