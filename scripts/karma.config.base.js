// TODO: generate coverage from service worker context

const path = require('path');
const webpackConfig = require('./webpack.config.base');

delete webpackConfig.entry;
delete webpackConfig.output;
delete webpackConfig.module.preLoaders;

module.exports = function(config) {
  config.set({
    basePath: '..',
    frameworks: ['mocha'],
    files: [
      'test/client.ts',
      {
        pattern: 'test/server.ts',
        included: false,
      },
    ],
    exclude: [],
    preprocessors: {
      'test/{client,server}.ts': ['webpack', 'sourcemap'],
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      // make Webpack bundle generation quiet
      noInfo: true,
      stats: 'errors-only',
    },
    reporters: ['mocha'],

    // override MIME for ts
    mime: {
      'application/javascript': ['ts','tsx'],
    },

    // proxy server script to root path
    proxies: {
      '/server.js': '/base/test/server.ts',
    },

    client: {
      captureConsole: false
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true,
    concurrency: Infinity,
  });
}
