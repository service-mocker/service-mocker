import { createServer } from 'service-mocker/server';

export function serverRunner(register: () => void) {
  const server = createServer();

  // register tests right away on legacy mode
  if (server.isLegacy) {
    return register();
  }

  // remove annoying warning message caused by mocha
  let errorHandler: any;
  Object.defineProperty(self, 'onerror', {
    get() {
      return errorHandler;
    },
    set(fn) {
      if (!fn) {
        server.off('error', errorHandler);
      } else {
        server.on('error', fn);
      }

      errorHandler = fn;
    },
    enumerable: true,
    configurable: true,
  });

  // avoid polluting client env
  require('mocha/mocha');
  require('source-map-support/sw-source-map-support').install();

  // wait for client request on modern mode
  // DON'T use `server.on()`, this listener should be permanently added
  self.addEventListener('message', (evt: ExtendableMessageEvent) => {
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

//////// THE FOLLOWING WILL ONLY BE EXECUTED IN MODERN MODE ////////

// make sure test results are update-to-dated
function runTests(register: () => void) {
  const server = createServer();
  const mocha: any = new Mocha();

  mocha.ui('bdd');
  mocha.slow(200);
  mocha.timeout(10 * 1e3);
  mocha.reporter(swReporter);

  mocha.suite.emit('pre-require', self, null, mocha);

  // remove previous event listeners
  Object.keys(self)
    .filter(prop => /^on/.test(prop))
    .forEach(prop => {
      const type = prop.replace(/^on/, '');
      server.off(type);
    });

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
      let fault: any;

      if (error) {
        // async error remap
        const stack = await error.stack;

        if (typeof error.toJSON === 'function') {
          // `AssertionError`
          fault = error.toJSON();
          fault.stack = stack;

          // err.actual is a function
          delete fault.actual;
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
        body, title, pending,
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

function composeTestTitle(test): string {
  const titles: Array<string> = [];

  let t = test;

  while (t.parent) {
    titles.unshift(t.title);
    t = t.parent;
  }

  return titles.join('-');
}

async function broadcast(message: any) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
  });

  clients.forEach(cli => {
    cli.postMessage(message);
  });
}
