// mocha is already loaded by webpack/karma
import { AssertionError } from 'chai';
import 'source-map-support/browser-source-map-support';

import { sendMessageRequest } from 'service-mocker/utils/';
import { createClient } from 'service-mocker/client';

(self as any).sourceMapSupport.install();

(mocha as any).delay();

mocha.setup({
  ui: 'bdd',
  slow: 200,
  timeout: 10 * 1e3,
});

/**
 * Client tests runner:
 *
 * 1. Fetch server test cases
 * 2. Register tests(if any) into mocha
 * 3. Fetch results from server
 * 4. Reflect results to mocha
 */
export async function clientRunner() {
  const client = createClient('server.js', /legacy/i.test(decodeURIComponent(location.search)));

  await client.ready;

  const target = client.controller || window;

  const res = await sendMessageRequest(target, {
    request: 'MOCHA_TASKS',
  }, 10 * 1e3);

  registerTest(res.suites);

  run();

  return sendMessageRequest(target, {
    request: 'MOCHA_RESULTS',
  }, Infinity);
}

function registerTest(suites?) {
  // suites should be empty when running in legacy mode
  if (!suites || !suites.length) {
    return;
  }

  suites.forEach(({ title, tests, suites: nestSuites }) => {
    describe(title, () => {
      tests.forEach(addCase);

      registerTest(nestSuites);
    });
  });
}

function addCase(test) {
  const promise = new Promise((resolve, reject) => {
    navigator.serviceWorker.addEventListener('message', function handler({ data }) {
      if (!data || data.title !== test.title) {
        return;
      }

      // one-off listener
      navigator.serviceWorker.removeEventListener('message', handler);

      if (data.error) {
        // reflect error to `AssertionError`
        const err = new AssertionError(data.error.message, data.error);
        err.stack = data.error.stack;

        reject(err);
      } else {
        resolve();
      }
    });
  });

  const runner = () => promise;

  // re-map source code
  runner.toString = () => test.body;

  // register to mocha
  it(test.title, runner);
}

// synchronous XHR for source-map-support
if ((XMLHttpRequest as any).mockerPatched) {
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function send(data) {
    if (this._url.match(/(client|server)\.js/)) {
      return this._nativeXHR.send(data);
    }

    originalSend.call(this, data);
  };
}
