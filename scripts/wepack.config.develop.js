const ip = require('ip');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');

const config = require('./webpack.config.base');

const dashboard = new Dashboard();
const joinRoot = path.join.bind(path, __dirname, '..');

// add auto-reload & source map
config.entry.client.unshift(
  `webpack-dev-server/client?http://${ip.address()}:3000`,
  require.resolve('./sourcemap')
);

// mocha env
config.module.loaders.unshift({
  test: /\.ts$/,
  loader: 'mocha',
  include: joinRoot('test/client.ts'),
});

// html plugin & webpack dashboard
config.plugins.push(
  new HtmlWebpackPlugin({
    title: 'Service Mocker',
    chunks: ['client'],
  }),
  new DashboardPlugin(dashboard.setData)
);

module.exports = config;
