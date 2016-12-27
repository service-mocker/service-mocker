/*!
 * Mocha runtime for service worker context
 * @author Dolphin Wood
 *
 * Notes:
 * - How to register test cases:
 *   1. Create a suite tree to store all suites and tests
 *   2. When clients request 'MOCHA_TASKS', send the suite tree to them
 *
 * - How to report results:
 *   1. Create a result array to store all test results
 *   2. When clients connect-in, send all results in the array to them
 *   3. The remain results will be broadcasted as per test is done
 *
 * Unlike browser context, scripts in service worker context will not be
 * updated as page reloaded. So we should cache all the test results for
 * the next connection of client.
 */

import { Suite } from './mocha-suite';

type Result = {
  error?: Error;
  testTitle: string;
};

const IS_SW = self !== self.window;

const rootSuite = new Suite('Root Group');
const resultCache: Array<Result> = [];

// mark current depth
let currentSuite = rootSuite;

// patch mocha env to service worker context
if (IS_SW) {
  (self as any).describe = describe;
  (self as any).it = it;
}

export function serverRunner(server) {
  server.onmessage((evt, respondWith) => {
    const {
      data,
      source,
    } = evt;

    if (!data || !data.request) {
      return;
    }

    switch (data.request) {
      case 'MOCHA_TASKS':
        return respondWith({
          // only send suites in modern mode
          suites: IS_SW && rootSuite.getAll(),
        });

      case 'MOCHA_RESULTS':
        return IS_SW && reportResults(source.id);
    }
  });
}

function describe(title: string, runner: () => void) {
  const upperSuite = currentSuite;

  // change current to new suite
  currentSuite = new Suite(title);

  // attach child node
  upperSuite.addSuite(currentSuite);

  // all the `describe` calls with `runner` will be attached to this suite
  runner();

  // restore previous depth
  currentSuite = upperSuite;
}

function it(expect: string, runner: (done: MochaDone) => any) {
  currentSuite.addTest({
    expect,
    code: runner.toString(),
  });

  let isFinished = false;

  function done(error?: any) {
    if (isFinished) {
      return;
    }

    isFinished = true;

    let fault: any;

    if (error) {
      if (typeof error.toJSON === 'function') {
        // `AssertionError`
        fault = error.toJSON();
      } else if (error instanceof Error) {
        fault = {
          message: error.message,
          stack: error.stack,
        };
      }
    }

    const res: Result = {
      error: fault,
      testTitle: expect,
    };

    // as long as service worker will not be reloaded when refreshing page
    // we need save results for further uses
    resultCache.push(res);

    // broadcast result to connected clients
    broadcast(res);
  }

  try {
    Promise.resolve(runner(done)).then(done, done);
  } catch (e) {
    done(e);
  }
}

// send results of tests that are already executed to current connected-in client
// the unexecuted tests will be reported via `broadcast`
async function reportResults(currentClientId: string) {
  if (!resultCache.length) {
    return;
  }

  const client = await self.clients.get(currentClientId);

  if (!client) {
    return;
  }

  resultCache.forEach(res => {
    client.postMessage(res);
  });
}

async function broadcast(message: any) {
  const clients = await self.clients.matchAll();

  clients.forEach(cli => {
    cli.postMessage(message);
  });
}
