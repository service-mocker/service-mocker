const webpackConfig = require('./webpack.config.test');

module.exports = {
  singleRun: true,

  frameworks: ['mocha'],
  reporters: ['mocha'],

  basePath: '..',
  files: [
    'test/client.js',
    {
      pattern: 'test/server.js',
      included: false,
    },
  ],

  preprocessors: {
    'test/{client,server}.js': ['webpack', 'sourcemap'],
  },

  webpack: webpackConfig,
  webpackMiddleware: {
    // make Webpack bundle generation quiet
    noInfo: true,
    stats: 'errors-only',
  },

  // proxy server script to root path
  proxies: {
    '/server.js': '/base/test/server.js',
  },

  // disable logs
  client: {
    captureConsole: false,
  },

  mochaReporter: {
    printFirstSuccess: true,
  },
};
