import './spec/server-instance';
import * as tests from './spec/server/';
import { serverRunner } from './tools/server-runner';

const mode = self === self.window ? 'Legacy' : 'Modern';

describe(`[${mode}] Server Tests`, () => {
  Object.keys(tests).forEach(name => {
    tests[name]();
  });
});

serverRunner();
