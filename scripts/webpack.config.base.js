const path = require('path');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = {
  resolve: {
    alias: {
      'service-mocker': joinRoot('src'),
    },
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [ 'babel-loader' ],
      include: [
        joinRoot('src'),
        joinRoot('test'),
      ],
    }],
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
  ],
};
