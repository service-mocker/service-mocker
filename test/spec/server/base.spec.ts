import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

const api = require('../api.json');

export function baseRunner() {
  const server = createServer();

  server.router.get('/api', api['/api']);

  describe('noop', () => {
    it('1+1=2', () => {
      expect(1 + 1).to.equal(2);
    });
  });
}
