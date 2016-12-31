const path = require('path');
const baseConfig = require('./karma.config.base');

module.exports = function(config) {
  baseConfig.webpack.module.postLoaders = [
      // instrument only testing sources with Istanbul
      {
          test: /\.ts$/,
          loader: 'sourcemap-istanbul-instrumenter?force-sourcemap=true',
          include: path.join(__dirname, '..', 'src'),
      }
  ];

  config.set(Object.assign(baseConfig, {
    browsers: ['Chrome'],
    reporters: ['mocha', 'karma-remap-istanbul'],
    preprocessors: {
      '**/*.ts': ['webpack', 'sourcemap'],
    },

    remapIstanbulReporter: {
      reports: {
        'text-summary': null,
        html: './coverage/html',
        lcovonly: './coverage/lcov.info',
      },
    },
  }));
}
