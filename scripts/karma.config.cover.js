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

  const istanbulReports = {
    'text-summary': null,
  };

  if (process.env.CI) {
    istanbulReports.lcovonly = 'coverage/lcov.info';
  } else {
    istanbulReports.html = 'coverage/html';
  }

  config.set(Object.assign(baseConfig, {
    browsers: ['Chrome'],
    reporters: ['mocha', 'karma-remap-istanbul'],
    preprocessors: {
      '**/*.ts': ['webpack', 'sourcemap'],
    },
    remapIstanbulReporter: {
      reports: istanbulReports,
    },
  }));
};
