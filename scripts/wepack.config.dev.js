const ip = require('ip');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');

const baseConfig = require('./webpack.config.base');

const dashboard = new Dashboard();
const joinRoot = path.join.bind(path, __dirname, '..');

Object.assign(baseConfig.module, {
  preLoaders: [{
    test: /\.ts$/,
    loader: 'tslint',
    include: [
      joinRoot('src'),
      joinRoot('test'),
    ],
  }],
  postLoaders: [{
    test: /\.ts$/,
    loader: 'mocha',
    include: joinRoot('test/client.ts'),
  }],
});

// html plugin & webpack dashboard
baseConfig.plugins.push(
  new HtmlWebpackPlugin({
    title: 'Service Mocker',
    chunks: ['client'],
  }),
  new DashboardPlugin(dashboard.setData)
);

module.exports = Object.assign(baseConfig, {
  entry: {
    client: [
      `webpack-dev-server/client?http://${ip.address()}:3000`,
      require.resolve('./sourcemap'),
      joinRoot('test/client.ts'),
    ],
    server: [
      joinRoot('test/server.ts'),
    ],
  },
  output: {
    path: joinRoot('build/'),
    filename: '[name].js',
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
});
