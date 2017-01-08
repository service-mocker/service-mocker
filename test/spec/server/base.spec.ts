import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

export function baseRunner(server) {
  describe('base infrastructure', () => {
    it('should be singleton', () => {
      const newServer = createServer();

      expect(newServer).to.equal(server);
    });
  });
}
