const baseConfig = require('./karma.config.base');

module.exports = function (config) {
  config.set(Object.assign(baseConfig, {
    logLevel: config.LOG_WARN,
    reporters: ['nyan'],
    browsers: ['Chrome', 'Firefox', 'Safari'],
    nyanReporter: {
      suppressErrorHighlighting: true,
    },
  }));
};
