const ip = require('ip');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseConfig = require('./webpack.config.base');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = Object.assign(baseConfig, {
  entry: {
    client: [
      `webpack-dev-server/client?http://${ip.address()}:3000`,
      joinRoot('test/client.js'),
    ],
    server: [
      joinRoot('test/server.js'),
    ],
  },
  output: {
    path: joinRoot('build/'),
    filename: '[name].js',
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
