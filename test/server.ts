import * as tests from './spec/server/';
import { RESPONSE } from './spec/mock-response';
import { createServer } from 'service-mocker/server';
import { serverRunner } from './tools/server-runner';

const server = createServer();

const mode = server.isLegacy ? 'Legacy' : 'Modern';

// mocks
server.router.get('/api', RESPONSE);
server.router.get('/blob', new Blob());
server.router.get('/json', { res: RESPONSE });
server.router.get('/document', `<p>${RESPONSE}</p>`);
server.router.get('/arraybuffer', new ArrayBuffer(100));
server.router.get('/custom-header', (req, res) => {
  res.send(req.headers.get('X-Custom'));
});

serverRunner(() => {
  describe(`${mode} Server Tests`, function() {
    Object.keys(tests).forEach(name => {
      tests[name].call(this);
    });
  });
});
