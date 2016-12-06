const ip = require('ip');
const path = require('path');
const autoprefixer = require('autoprefixer');
const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const dashboard = new Dashboard();

const join = path.join.bind(path, __dirname, '..');

const sources = ['src', 'demo'].map(dir => join(dir));

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    app: [
      // `webpack-dev-server/client?http://${ip.address()}:3000`,
      join('demo/app/index.js'),
    ],
    sw: [
      join('demo/sw/index.js'),
    ],
  },
  output: {
    path: join('build/'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['', '.js', '.styl'],
  },
  module: {
    preLoaders: [{
      test: /\.js$/,
      loaders: ['eslint'],
      include: sources,
      formatter: eslintFriendlyFormatter,
    }],
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: sources,
    }, {
      test: /\.scss/,
      loader: [
        'style',
        'css',
        'postcss',
        'sass?sourceMap',
      ],
    }],
  },
  postcss: [autoprefixer],
  plugins: [
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      // add errors to webpack instead of warnings
      failOnError: true,
    }),
    new DashboardPlugin(dashboard.setData),
  ],
};
