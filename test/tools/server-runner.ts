/**
 * Mocha runtime for service worker context
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

// manually import 'mocha' for karma
import 'mocha/mocha';
import * as swSourceMap from 'source-map-support/sw-source-map-support';

type Result = {
  error?: Error;
  title: string;
};

const IS_SW = self !== self.window;

const resultCache: Array<Result> = [];

// patch mocha env to service worker context
if (IS_SW) {
  swSourceMap.install();

  mocha.setup({
    ui: 'bdd',
    slow: 200,
    timeout: 10 * 1e3,
    reporter: swReporter,
  });
}

export function serverRunner() {
  if (IS_SW) {
    mocha.run();
  }

  self.addEventListener('message', (evt: ExtendableMessageEvent) => {
    const {
      data,
      source,
      ports,
    } = evt;

    if (!data || !data.request) {
      return;
    }

    switch (data.request) {
      case 'MOCHA_TASKS':
        return ports[0].postMessage({
          // only send suites in modern mode
          suites: IS_SW && getAllSuites(),
        });

      case 'MOCHA_RESULTS':
        return IS_SW && reportResults(source.id);
    }
  });
}

function swReporter(runner) {
  runner
    .on('pass', (test) => {
      console.info(test);
      const result = {
        title: test.title,
      };

      // as long as service worker will not be reloaded when refreshing page
      // we need save results for further uses
      resultCache.push(result);

      // broadcast result to connected clients
      broadcast(result);
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
        } else if (error instanceof Error) {
          fault = {
            stack,
            message: error.message,
          };
        }
      }

      const result = {
        error: fault,
        title: test.title,
      };

      resultCache.push(result);
      broadcast(result);
    });
}

// get minimal suites
function getAllSuites(parent = (mocha as any).suite.suites) {
  return parent.map(({ suites, tests, title }) => {
    const allSuites = getAllSuites(suites);
    const allTests = tests.map(({ body, title }) => {
      return { body, title };
    });

    return {
      title,
      suites: allSuites,
      tests: allTests,
    };
  });
}

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
