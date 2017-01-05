const baseConfig = require('./karma.config.base');

module.exports = function (config) {
  config.set(Object.assign(baseConfig, {
    browsers: ['Chrome'],
  }));
};
