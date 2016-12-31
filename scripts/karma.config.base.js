const webpack = require('webpack');
const webpackConfig = require('./webpack.config.base');

webpackConfig.plugins.push(
  // ts-loader doesn't fail the build when error occurs, see
  // https://github.com/TypeStrong/ts-loader#failing-the-build-on-typescript-compilation-error
  require('./webpack-exit-on-error'),

  // fix source map, see
  // https://github.com/webpack/webpack.js.org/issues/151
  new webpack.SourceMapDevToolPlugin({
    test: /\.(js|css|jsx|ts|tsx)($|\?)/i,
  })
);

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
    {
      pattern: '**/*.map',
      included: false
    }
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
    'application/javascript': ['ts','tsx'],
  },

  // proxy server script to root path
  proxies: {
    '/server.js': '/base/test/server.ts',
  },

  // disable logs
  client: {
    captureConsole: false,
  },
}
