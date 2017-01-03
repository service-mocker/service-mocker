import 'service-mocker-polyfills';

import * as tests from './spec/client/';
import { client } from './spec/client-instance';
import { clientRunner } from './tools/client-runner';

const mode = client.isLegacy ? 'Legacy' : 'Modern';

describe(`[${mode}] Client Tests`, () => {
  Object.keys(tests).forEach(name => {
    if (typeof tests[name] === 'function') {
      tests[name]();
    }
  });
});

clientRunner(client);
