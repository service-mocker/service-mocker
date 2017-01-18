const webpack = require('webpack');
const baseConfig = require('./webpack.config.base');

module.exports = Object.assign(baseConfig, {
  plugins: baseConfig.plugins.concat([
    // fix source map, see
    // https://github.com/webpack/webpack.js.org/issues/151
    new webpack.SourceMapDevToolPlugin({
      test: /\.(js|css|jsx|ts|tsx)($|\?)/i,
    }),

    // ts-loader doesn't fail the build when error occurs, see
    // https://github.com/TypeStrong/ts-loader#failing-the-build-on-typescript-compilation-error
    function exitOnError() {
      this.plugin('done', stats => {
        if (stats.compilation.errors && stats.compilation.errors.length) {
          setImmediate(() => {
            process.exit(1);
          });
        }
      });
    },
  ]),
});
