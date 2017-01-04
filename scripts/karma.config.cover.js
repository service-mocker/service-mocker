const path = require('path');
const baseConfig = require('./karma.config.base');
const isLegacy = !!process.env.FORCE_LEGACY;

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

  config.set(Object.assign(baseConfig, {
    logLevel: config.LOG_WARN,
    browsers: ['Chrome'],
    reporters: ['karma-remap-istanbul'],
    preprocessors: {
      '**/*.ts': ['webpack', 'sourcemap'],
    },

    remapIstanbulReporter: {
      reports: {
        json: `./coverage/coverage-${isLegacy ? 'legacy' : 'modern'}.json`,
      },
    },
  }));
};
