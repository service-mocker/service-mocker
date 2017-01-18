const webpackConfig = require('./webpack.config.test');

module.exports = {
  singleRun: true,

  frameworks: ['mocha'],
  reporters: ['mocha'],

  basePath: '..',
  files: [
    'test/client.ts',
    {
      pattern: 'test/server.ts',
      included: false,
    },
  ],

  preprocessors: {
    'test/{client,server}.ts': ['webpack', 'sourcemap'],
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
    '/server.js': '/base/test/server.ts',
  },

  // disable logs
  client: {
    captureConsole: false,
  },
};
