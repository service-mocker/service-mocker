import * as tests from './spec/server/';
import { createServer } from 'service-mocker/server';
import { serverRunner } from './tools/server-runner';

const server = createServer();

const mode = server.isLegacy ? 'Legacy' : 'Modern';

describe(`${mode} Server Tests`, () => {
  Object.keys(tests).forEach(name => {
    tests[name](server);
  });
});

serverRunner();
