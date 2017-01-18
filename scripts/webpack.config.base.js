const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = {
  devtool: 'cheap-module-source-map',
  resolve: {
    extensions: ['.js', '.ts', '.css'],
    alias: {
      'service-mocker': joinRoot('src'),
    },
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [ 'ts-loader' ],
      include: [
        joinRoot('src'),
        joinRoot('test'),
      ],
    }],
  },
  plugins: [
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      failOnError: true,
    }),
  ],
};
