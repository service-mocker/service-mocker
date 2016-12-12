const ip = require('ip');
const path = require('path');
const autoprefixer = require('autoprefixer');
const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const dashboard = new Dashboard();

const joinRoot = path.join.bind(path, __dirname, '..');

const sources = ['src', 'demo'].map(dir => joinRoot(dir));

module.exports = {
  devtool: 'source-map',
  entry: {
    app: [
      `webpack-dev-server/client?http://${ip.address()}:3000`,
      joinRoot('demo/app/index.ts'),
    ],
    sw: [
      joinRoot('demo/sw/index.ts'),
    ],
  },
  output: {
    path: joinRoot('build/'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.scss'],
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
    }, {
      test: /\.scss/,
      loader: [
        'style',
        'css',
        'postcss',
        'sass?sourceMap',
      ],
    }],
    noParse: [
      // remove "Critical dependency" warning
      require.resolve('localforage/dist/localforage.nopromises.js'),
    ],
  },
  postcss: [autoprefixer],
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
    new DashboardPlugin(dashboard.setData),
  ],
};
