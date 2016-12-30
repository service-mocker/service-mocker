const ip = require('ip');
const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const joinRoot = path.join.bind(path, __dirname, '..');

const sources = ['src', 'test'].map(dir => joinRoot(dir));

module.exports = {
  devtool: 'source-map',
  entry: {
    client: [
      joinRoot('test/client.ts'),
    ],
    server: [
      joinRoot('test/server.ts'),
    ],
  },
  output: {
    path: joinRoot('build/'),
    filename: '[name].js',
    // service workers requires top scope
    // publicPath: '/build/',
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.css'],
  },
  module: {
    preLoaders: [{
      test: /\.ts$/,
      loader: 'tslint',
      include: sources,
    }],
    loaders: [{
      test: /\.ts$/,
      loader: 'ts',
      include: sources,
    }],
    noParse: [
      // remove "Critical dependency" warning
      require.resolve('localforage/dist/localforage.nopromises.js'),
      require.resolve('source-map-support/browser-source-map-support.js'),
    ],
  },
  tslint: {
    formatter: 'stylish',
  },
  ts: {
    silent: true,
    // with `transpileOnly` enabled, we can cache result and speed up compilation
    // but modules are marked as isolated thus some typing checks will be bypassed
    // transpileOnly: true,
    compilerOptions: {
      declaration: false,
    },
  },
  plugins: [
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      failOnError: true,
    }),
  ],
};
