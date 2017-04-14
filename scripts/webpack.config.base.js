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
      use: [{
        loader: 'ts-loader',
        options: {
          configFileName: joinRoot('test/server/tsconfig.json'),
          instance: 'server-instance',
        },
      }],
      include: [
        joinRoot('src/server'),
        joinRoot('test/server'),
      ],
    }, {
      test: /\.ts$/,
      use: [{
        loader: 'ts-loader',
        options: {
          configFileName: joinRoot('test/client/tsconfig.json'),
          instance: 'client-instance',
        },
      }],
      include: [
        joinRoot('src'),
        joinRoot('test'),
      ],
      exclude: [
        joinRoot('src/server'),
        joinRoot('test/server'),
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
