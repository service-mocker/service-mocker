const webpackConfig = require('./webpack.config.test');

module.exports = {
  singleRun: true,

  frameworks: ['mocha'],
  reporters: ['mocha'],

  basePath: '..',
  files: [
    'test/client/index.ts',
    {
      pattern: 'test/server/index.ts',
      included: false,
    },
  ],

  preprocessors: {
    'test/{client,server}/index.ts': ['webpack', 'sourcemap'],
  },

  webpack: webpackConfig,
  webpackMiddleware: {
    // make Webpack bundle generation quiet
    noInfo: true,
    stats: 'errors-only',
  },

  // override MIME for ts
  mime: {
    'application/javascript': ['ts', 'tsx'],
  },

  // proxy server script to root path
  proxies: {
    '/server.js': '/base/test/server/index.ts',
  },

  // disable logs
  client: {
    captureConsole: false,
  },

  mochaReporter: {
    printFirstSuccess: true,
  },
};
