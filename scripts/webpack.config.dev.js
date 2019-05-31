const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./webpack.config.base');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = Object.assign(baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    client: [
      joinRoot('test/client.js'),
    ],
    server: [
      joinRoot('test/server.js'),
    ],
  },
  output: {
    path: joinRoot('dist'),
    filename: '[name].js',
  },

  devServer: {
    contentBase: false,
    host: '0.0.0.0',
    port: 3000,
  },
  stats: {
    colors: true,
    assets: false,
    version: false,
    hash: false,
    timings: false,
    chunks: false,
    chunkModules: false,
  },

  module: {
    rules: baseConfig.module.rules.concat([{
      test: /\.js$/,
      enforce: 'pre',
      include: [
        joinRoot('src'),
        joinRoot('test'),
      ],
      use: [{
        loader: 'eslint-loader',
      }],
    }, {
      test: /\.js$/,
      enforce: 'post',
      use: [ 'mocha-loader' ],
      include: joinRoot('test/client.js'),
    }]),
  },

  plugins: baseConfig.plugins.concat([
    new HtmlWebpackPlugin({
      title: 'Service Mocker',
      chunks: ['client'],
      favicon: joinRoot('/docs/assets/favicon.png'),
    }),
  ]),
});
