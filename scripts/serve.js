/* eslint-disable no-console */
const ip = require('ip');
const path = require('path');
const webpack = require('webpack');
const Server = require('webpack-dev-server');
const config = require('./wepack.config.develop');

new Server(webpack(config), {
  quiet: true,
  contentBase: path.join(__dirname, '..', 'demo'),
  publicPath: config.output.publicPath,
}).listen(3000, '0.0.0.0', (err) => {
  if (err) {
    console.log(err);
  }

  console.log('Listening at http://localhost:3000');
  console.log(`Remote access: http://${ip.address()}:3000`);
});
