import 'service-mocker-polyfills';

import { clientRunner } from './runner/client-runner';
import { createClient } from 'service-mocker/client';

const modernTests = require.context('./spec/client/modern/', true, /\.js$/);
const legacyTests = require.context('./spec/client/legacy/', true, /\.js$/);
const miscTests = require.context('./spec/misc/', true, /\.js$/);

if (supportSW()) {
  describe('Modern Client Tests', function () {
    before(() => {
      const client = createClient('server.js');
      return client.ready;
    });

    modernTests.keys().forEach((module) => {
      modernTests(module).default.call(this);
    });
  });
} else {
  console.warn('modern client tests are ignored because of the browser compatibility');
}

describe('Legacy Client Tests', function () {
  before(() => {
    const client = createClient('server.js', {
      forceLegacy: true,
    });

    return client.ready;
  });

  legacyTests.keys().forEach((module) => {
    legacyTests(module).default.call(this);
  });
});

describe('Utils & Misc', function () {
  miscTests.keys().forEach((module) => {
    miscTests(module).default.call(this);
  });
});

clientRunner();

function supportSW() {
  return navigator.serviceWorker &&
    (location.protocol === 'https' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
}
