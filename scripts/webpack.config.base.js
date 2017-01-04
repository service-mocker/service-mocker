const path = require('path');
const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = {
  devtool: 'cheap-module-source-map',
  resolve: {
    extensions: ['', '.js', '.ts', '.css'],
  },
  module: {
    loaders: [{
      test: /\.ts$/,
      loader: 'ts',
      include: [
        joinRoot('src'),
        joinRoot('test'),
      ],
    }],
    noParse: [
      // remove "Critical dependency" warning
      require.resolve('mocha/mocha'),
      path.dirname(require.resolve('localforage')),
      path.dirname(require.resolve('source-map-support')),
    ],
  },
  plugins: [
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      failOnError: true,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        FORCE_LEGACY: !!process.env.FORCE_LEGACY,
      },
    }),
  ],
};
