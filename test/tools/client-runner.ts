// mocha is already loaded by webpack/karma
import { AssertionError } from 'chai';
import 'source-map-support/browser-source-map-support';

import { sendMessageRequest, Defer } from 'service-mocker/lib/utils/';
import { createClient } from 'service-mocker/client';

(self as any).sourceMapSupport.install();

(mocha as any).delay();

mocha.setup({
  ui: 'bdd',
  slow: 200,
  timeout: 10 * 1e3,
});

const client = createClient('server.js', {
  forceLegacy: /legacy/i.test(decodeURIComponent(location.search)),
});

const serverTests: any = {};

listenResult();

/**
 * Client tests runner:
 *
 * 1. Fetch server test cases
 * 2. Register tests(if any) into mocha
 * 3. Fetch results from server
 * 4. Reflect results to mocha
 */
export async function clientRunner() {
  await client.ready;

  if (client.isLegacy) {
    return run();
  }

  const res = await sendMessageRequest(navigator.serviceWorker.controller, {
    request: 'MOCHA_TASKS',
  }, 10 * 1e3);

  registerTest(res.suites);

  // imporve layout :)
  (mocha as any).suite.suites.sort((a, b) => {
    return a.title.charCodeAt(0) < b.title.charCodeAt(0);
  });

  run();
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
  if (!serverTests[test.composedTitle]) {
    serverTests[test.composedTitle] = new Defer();
  }

  const deferred = serverTests[test.composedTitle];

  const runner = async function() {
    const skip = await deferred.promise;

    if (skip) {
      this.skip();
    }
  };

  // re-map source code
  runner.toString = () => test.body;

  // register to mocha
  if (test.pending) {
    it.skip(test.title, runner);
  } else {
    it(test.title, runner);
  }
}

function listenResult() {
  if (client.isLegacy) {
    return;
  }

  navigator.serviceWorker.addEventListener('message', ({ data }) => {
    if (!data || !data.mochaTest) {
      return;
    }

    const {
      composedTitle,
      error,
      skip,
    } = data;

    if (!serverTests[composedTitle]) {
      serverTests[composedTitle] = new Defer();
    }

    const deferred = serverTests[composedTitle];

    if (error) {
      const err = new AssertionError(error.message, error);
      err.stack = error.stack;

      deferred.reject(err);
    } else {
      deferred.resolve(skip);
    }
  });
}

// handle fetch request from server
async function sendRequest(event: MessageEvent) {
  const {
    data,
    ports,
  } = event;

  if (data && data.request === 'FETCH') {
    try {
      await client.ready;

      // convert formData
      if (data.init.body === 'FORM_DATA') {
        data.init.body = new FormData();
      }

      const res = await fetch(data.url, data.init);
      const headers: any = {};

      res.headers.forEach((value, name) => {
        if (headers[name]) {
          headers[name] += `, ${value}`;
        } else {
          headers[name] = value;
        }
      });

      ports[0].postMessage({
        headers,
        text: await res.text(),
        status: res.status,
        statusText: res.statusText,
      });
    } catch (e) {
      console.error(e);
    }
  }
}

if (!client.isLegacy) {
  navigator.serviceWorker.addEventListener('message', sendRequest);
}

window.addEventListener('message', sendRequest);

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
