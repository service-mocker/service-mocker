import * as tests from './spec/server/';
import { createServer } from 'service-mocker/server';
import { serverRunner } from './tools/server-runner';

const responseText = 'Hello new world!';

serverRunner(() => {
  const server = createServer();

  const mode = server.isLegacy ? 'Legacy' : 'Modern';

  // mocks
  server.router.get('/api', responseText);
  server.router.get('/blob', new Blob());
  server.router.get('/json', { res: responseText });
  server.router.get('/document', `<p>${responseText}</p>`);
  server.router.get('/arraybuffer', new ArrayBuffer(100));
  server.router.get('/custom-header', (req, res) => {
    res.send(req.headers.get('X-Custom'));
  });

  describe(`${mode} Server Tests`, function() {
    Object.keys(tests).forEach(name => {
      tests[name].call(this);
    });
  });
});
