const baseConfig = require('./karma.config.base');

module.exports = function (config) {
  config.set(Object.assign(baseConfig, {
    reporters: ['nyan'],
    browsers: ['Chrome'],
  }));
};
