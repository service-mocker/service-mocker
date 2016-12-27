import 'es6-promise/auto';
import 'whatwg-fetch';

import * as tests from './spec/client/';
import { client } from './spec/client-instance';
import { clientRunner } from './tools/client-runner';

describe('Client Tests', () => {
  Object.keys(tests).forEach(name => {
    tests[name]();
  });
});

clientRunner(client);
