import { createServer } from 'service-mocker/server';
import { serverRunner } from './runner/server-runner';

const serverTests = (require as any).context('./spec/server/', true, /\.ts$/);

serverRunner(() => {
  const server = createServer();

  const mode = server.isLegacy ? 'Legacy' : 'Modern';

  describe(`${mode} Server Tests`, function() {
    serverTests.keys().forEach((module) => {
      serverTests(module).default.call(this);
    });
  });
});
