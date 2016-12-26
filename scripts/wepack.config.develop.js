const ip = require('ip');
const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');

const config = require('./webpack.config.test');

const dashboard = new Dashboard();

const webpackServerScript = `webpack-dev-server/client?http://${ip.address()}:3000`;
const sourceMapSupport = require.resolve('./sourcemap');

const entry = config.entry;

// add auto-reload & source map
Object.keys(entry).forEach((name) => {
  if (name === 'sw') return;

  entry[name].unshift(webpackServerScript, sourceMapSupport);
});

// webpack dashboard
config.plugins.push(new DashboardPlugin(dashboard.setData));

module.exports = config;
