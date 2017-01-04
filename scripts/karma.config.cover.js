const path = require('path');
const baseConfig = require('./karma.config.base');

module.exports = function (config) {
  // instrument only testing sources with Istanbul
  baseConfig.webpack.module.postLoaders = [{
    test: /\.ts$/,
    loader: 'sourcemap-istanbul-instrumenter',
    include: path.join(__dirname, '..', 'src'),
    query: {
      'force-sourcemap': true,
    },
  }];

  const istanbulOptions = {};

  if (process.env.CI) {
    baseConfig.reporters = ['mocha', 'karma-remap-istanbul'];
    istanbulOptions.reports = {
      lcovonly: 'coverage/lcov.info',
    };
  } else {
    baseConfig.reporters = ['nyan', 'karma-remap-istanbul'];
    istanbulOptions.reports = {
      'text-summary': null,
      html: 'coverage/html',
    };
  }

  config.set(Object.assign(baseConfig, {
    logLevel: config.LOG_WARN,
    browsers: ['Chrome'],
    preprocessors: {
      '**/*.ts': ['webpack', 'sourcemap'],
    },

    remapIstanbulReporter: istanbulOptions,
  }));
};
