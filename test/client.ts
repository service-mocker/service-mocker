import 'service-mocker-polyfills';

import { clientRunner } from './tools/client-runner';
import { createClient } from 'service-mocker/client';

import * as modernTests from './spec/client/modern/';
import * as legacyTests from './spec/client/legacy/';

if (supportSW()) {
  describe('Modern Client Tests', function() {
    before(() => {
      const client = createClient('server.js');
      return client.ready;
    });

    Object.keys(modernTests).forEach((name) => {
      modernTests[name].call(this);
    });
  });
} else {
  console.warn('modern client tests are ignored because of the browser compatibility');
}

describe('Legacy Client Tests', function() {
  before(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg.unregister();
    } catch (e) {}

    const client = createClient('server.js', true);
    return client.ready;
  });

  Object.keys(legacyTests).forEach((name) => {
    legacyTests[name].call(this);
  });
});

clientRunner();

function supportSW() {
  return navigator.serviceWorker &&
    (location.protocol === 'https' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
}
