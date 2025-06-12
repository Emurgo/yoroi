const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add WASM support
  config.resolve.extensions.push('.wasm');
  
  // Configure WASM loader
  config.module.rules.push({
    test: /\.wasm$/,
    type: 'webassembly/sync',
  });

  // Enable WASM experiments
  config.experiments = {
    ...config.experiments,
    syncWebAssembly: true,
  };

  return config;
}; 