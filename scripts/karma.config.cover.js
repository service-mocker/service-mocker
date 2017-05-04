const baseConfig = require('./karma.config.base');

module.exports = function (config) {
  const reporterType = process.env.CI ? 'lcov' : 'html';

  config.set(Object.assign(baseConfig, {
    browsers: ['Chrome'],
    reporters: ['mocha', 'coverage'],
    coverageReporter: {
      type: reporterType,
      dir: 'coverage',
      subdir: '.',
    },
    preprocessors: {
      '**/*.js': ['webpack', 'sourcemap'],
    },
  }));
};
