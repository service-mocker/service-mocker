const path = require('path');
const baseConfig = require('./karma.config.base');

module.exports = function (config) {
  // instrument only testing sources with Istanbul
  baseConfig.webpack.module.rules.push({
    test: /\.js$/,
    enforce: 'post',
    use: [ 'istanbul-instrumenter-loader' ],
    include: path.join(__dirname, '..', 'src'),
  });

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
      '**/*.js': ['webpack', 'sourcemap'],
    },
    remapIstanbulReporter: {
      reports: istanbulReports,
    },
  }));
};
