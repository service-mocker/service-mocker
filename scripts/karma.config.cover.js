const baseConfig = require('./karma.config.base');

module.exports = function (config) {
  const reporters = [{
    type: 'text-summary',
  }];

  if (process.env.CI) {
    reporters.push({
      type: 'lcovonly',
      subdir: '.',
      file: 'lcov.info',
    });
  } else {
    reporters.push({
      type: 'html',
      subdir: 'html',
    });
  }

  config.set(Object.assign(baseConfig, {
    browsers: ['Chrome'],
    reporters: ['mocha', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: reporters,
    },
    preprocessors: {
      '**/*.js': ['webpack', 'sourcemap'],
    },
  }));
};
