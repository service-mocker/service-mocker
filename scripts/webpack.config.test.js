const baseConfig = require('./webpack.config.base');

module.exports = Object.assign(baseConfig, {
  devtool: 'inline-source-map',
});
