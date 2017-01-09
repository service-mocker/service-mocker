const IS_SW = self !== self.window;

const eventListeners = {
  fetch: [],
  error: [],
  install: [],
  activate: [],
};

// patch mocha env to service worker context
if (IS_SW) {
  // avoid polluting client env
  require('mocha/mocha');
  require('source-map-support/sw-source-map-support').install();

  patchListener();
}

export function serverRunner(register: () => void) {
  if (!IS_SW) {
    // register tests right away on legacy mode
    register();
  }

  // wait for client request on modern mode
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

// make sure test results are update-to-dated
function runTests(register: () => void) {
  const mocha: any = new Mocha();

  mocha.ui('bdd');
  mocha.slow(200);
  mocha.timeout(10 * 1e3);
  mocha.reporter(swReporter);

  mocha.suite.emit('pre-require', self, null, mocha);

  // cleanning stuff
  Object.keys(eventListeners).forEach((type) => {
    eventListeners[type].length = 0;
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

// some event listeners must be must be added
// on the initial evaluation of worker script.
function patchListener() {
  const addEventListener = self.addEventListener.bind(self);

  self.addEventListener = function eventProxy(type: string, listener: EventListenerOrEventListenerObject) {
    if (!eventListeners[type]) {
      return addEventListener(type, listener);
    }

    eventListeners[type].push(listener);
  };

  Object.keys(eventListeners).forEach((type) => {
    const listeners = eventListeners[type];

    addEventListener(type, function(event) {
      listeners.forEach((fn) => {
        fn.call(this, event);
      });
    });

    // patch for `on-event` accessors
    let listener: any;
    Object.defineProperty(self, `on${type}`, {
      set(fn) {
        listener = fn;
        self.addEventListener(type, listener);
      },
      get() {
        return listener;
      },
      enumerable: true,
      configurable: true,
    });
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
