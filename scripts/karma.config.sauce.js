const baseConfig = require('./karma.config.base');

const customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 7',
    version: 'latest',
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest',
  },

  // another IE family
  sl_mac_safari_9: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9',
  },
  sl_mac_safari_10: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'macOS 10.12',
  },

  // IE family
  sl_ie_10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '10',
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11',
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10',
  },
};

const buildNum = process.env.CIRCLE_BUILD_NUM ? `#${process.env.CIRCLE_BUILD_NUM}` : `@${Date.now()}`;

module.exports = function(config) {
  config.set(Object.assign(baseConfig, {
    browsers: Object.keys(customLaunchers),
    customLaunchers: customLaunchers,
    reporters: ['dots', 'saucelabs'],
    sauceLabs: {
      testName: 'Service Mocker tests',
      recordScreenshots: false,
      build: `service-worker ${buildNum}`,
    },
  }));
}
