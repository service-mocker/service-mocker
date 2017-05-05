import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

export default function () {
  const { router } = createServer();

  describe('router.baseURL', () => {
    it('should have a `.baseURL` property', () => {
      expect(router).to.have.property('baseURL')
        .and.that.is.a('string');
    });

    it('should not include trailing slash', () => {
      expect(router.baseURL).not.to.match(/\/$/);
    });

    it('should be set via `createServer()`', () => {
      const baseURL = 'http://a.com/api/v1';
      const { router } = createServer(baseURL);

      expect(router.baseURL).to.equal(baseURL);
    });
  });
}
