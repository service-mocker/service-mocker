const baseConfig = require('./webpack.config.base');

module.exports = Object.assign(baseConfig, {
  mode: 'none',
  devtool: 'inline-source-map',
});
