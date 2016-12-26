const ip = require('ip');
const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');

const config = require('./webpack.config.test');

const dashboard = new Dashboard();

const webpackServerScript = `webpack-dev-server/client?http://${ip.address()}:3000`;

const entry = config.entry;

// add auto-reload
Object.keys(entry).forEach((name) => {
  if (name === 'sw') return;

  entry[name].unshift(webpackServerScript);
});

// webpack dashboard
config.plugins.push(new DashboardPlugin(dashboard.setData));

module.exports = config;
