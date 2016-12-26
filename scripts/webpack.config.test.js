const path = require('path');

const joinRoot = path.join.bind(path, __dirname, '..');
const config = require('./webpack.config.base');

// mocha env
config.module.loaders.unshift({
  test: /\.ts$/,
  loader: 'mocha',
  include: [
    joinRoot('test/legacy/index.ts'),
    joinRoot('test/modern/index.ts'),
  ],
});

module.exports = config;
