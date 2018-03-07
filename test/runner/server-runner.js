import { createServer } from 'service-mocker/server';

const server = createServer();

export function serverRunner(register) {
  // register tests right away on legacy mode
  if (server.isLegacy) {
    return register();
  }

  // wrap `self.onerror`,
  // remove the annoying warning caused by mocha
  wrapErrorEvent();

  // avoid polluting client env
  require('mocha/mocha');
  require('source-map-support/sw-source-map-support').install();

  // wait for client request on modern mode
  // DON'T use `server.on()`, this listener should be permanently added
  self.addEventListener('message', (evt) => {
    const {
      data,
      ports,
    } = evt;

    if (data && data.request === 'MOCHA_TASKS') {
      ports[0].postMessage({
        suites: runTests(register),
      });
    }
  });
}

// eslint-disable-next-line spaced-comment
//////// THE FOLLOWING WILL ONLY BE EXECUTED IN MODERN MODE ////////

// make sure test results are update-to-dated
function runTests(register) {
  const mocha = new Mocha();

  mocha.ui('bdd');
  mocha.slow(500);
  mocha.timeout(10 * 1e3);
  mocha.reporter(swReporter);

  mocha.suite.emit('pre-require', self, null, mocha);

  // remove previous routers
  server.constructor.routers.length = 0;

  register();

  mocha.run();

  return getAllSuites(mocha.suite.suites);
}

function swReporter(runner) {
  runner
    .on('pass', (test) => {
      // broadcast result to connected clients
      broadcast({
        mochaTest: true,
        composedTitle: composeTestTitle(test),
      });
    })
    .on('pending', (test) => {
      broadcast({
        skip: true,
        mochaTest: true,
        composedTitle: composeTestTitle(test),
      });
    })
    .on('fail', async (test, error) => {
      let fault;

      if (error) {
        // async error remap
        const stack = await error.stack;

        if (typeof error.toJSON === 'function') {
          // `AssertionError`
          fault = error.toJSON();
          fault.stack = stack;

          // strip the un-cloneable
          Object.keys(fault).forEach((prop) => {
            if (typeof fault[prop] === 'function') {
              delete fault[prop];
            }
          });
        } else if (error instanceof Error) {
          fault = {
            stack,
            message: error.message,
          };
        }
      }

      const result = {
        error: fault,
        mochaTest: true,
        composedTitle: composeTestTitle(test),
      };

      broadcast(result);
    });
}

// get minimal suites
function getAllSuites(parent) {
  return parent.map(({ suites, tests, title }) => {
    const allSuites = getAllSuites(suites);
    const allTests = tests.map((t) => {
      const { body, title, pending } = t;

      return {
        body,
        title,
        pending,
        composedTitle: composeTestTitle(t),
      };
    });

    return {
      title,
      suites: allSuites,
      tests: allTests,
    };
  });
}

function composeTestTitle(test) {
  const titles = [];

  let t = test;

  while (t.parent) {
    titles.unshift(t.title);
    t = t.parent;
  }

  return titles.join('-');
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
  });

  clients.forEach((cli) => {
    cli.postMessage(message);
  });
}

function wrapErrorEvent() {
  let errorHandler;

  self.addEventListener('error', (...args) => {
    if (errorHandler) {
      errorHandler(...args);
    }
  });

  Object.defineProperty(self, 'onerror', {
    get() {
      return errorHandler;
    },
    set(fn) {
      errorHandler = fn;
    },
    enumerable: true,
    configurable: true,
  });
}
