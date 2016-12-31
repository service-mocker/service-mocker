import { AssertionError } from 'chai';
import { TestCase, Suite } from './mocha-suite';
import { sendMessageRequest } from '../../src/utils/';
import 'source-map-support/browser-source-map-support';

(self as any).sourceMapSupport.install();

const start = mocha.run.bind(mocha);
(mocha as any).run = () => null;

/**
 * Client tests runner:
 *
 * 1. Fetch server test cases
 * 2. Register tests(if any) into mocha
 * 3. Fetch results from server
 * 4. Reflect results to mocha
 */
export async function clientRunner(client) {
  await client.ready;

  const target = client.controller || window;

  const res = await sendMessageRequest(target, {
    request: 'MOCHA_TASKS',
  }, 0);

  (mocha as any).run = start;

  registerTest(res.suites);
  start();

  return sendMessageRequest(target, {
    request: 'MOCHA_RESULTS',
  }, 0);
}

function registerTest(suites?: Array<Suite>) {
  // suites should be empty when running in legacy mode
  if (!suites || !suites.length) {
    return;
  }

  suites.forEach(({ title, tests, nestSuites }) => {
    describe(title, () => {
      tests.forEach(addCase);

      registerTest(nestSuites);
    });
  });
}

function addCase(test: TestCase) {
  const promise = new Promise((resolve, reject) => {
    navigator.serviceWorker.addEventListener('message', function handler({ data }) {
      if (!data || data.testTitle !== test.expect) {
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
  runner.toString = () => test.code;

  // register to mocha
  it(test.expect, runner);
}
