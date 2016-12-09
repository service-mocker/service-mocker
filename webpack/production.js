const path = require('path');
const autoprefixer = require('autoprefixer');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const join = path.join.bind(path, __dirname, '..');

const sources = ['src'].map(dir => join(dir));

module.exports = {
  entry: {
    client: join('src/client/index.js'),
    server: join('src/server/index.js'),
  },
  output: {
    path: join('dist/'),
    filename: '[name].js',
    library: 'Mocker',
    libraryTarget: 'umd',
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
    noParse: [
      // remove "Critical dependency" warning
      require.resolve('localforage'),
    ],
  },
  postcss: [autoprefixer],
  plugins: [
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /node_modules/,
      // add errors to webpack instead of warnings
      failOnError: true,
    }),
  ],
};
