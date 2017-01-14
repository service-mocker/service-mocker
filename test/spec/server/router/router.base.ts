import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

export default function() {
  const { router } = createServer();

  describe('router.base(undefined)', () => {
    it('should set to current baseURL when not given', () => {
      const rr = router.base('http://a.com/api');

      expect(rr.base().baseURL).to.equal(rr.baseURL);
    });
  });

  describe('router.base(String)', () => {
    it('should return a new Router', () => {
      expect(router.base('/')).not.to.equal(router);
    });

    it('should strip the trailing slash', () => {
      const baseURL = 'http://a.com/api/v1';
      const rr = router.base(baseURL + '/');

      expect(rr.baseURL).to.equal(baseURL);
    });

    describe('with a relative path', () => {
      it('should resolve to current origin', () => {
        const origin = 'http://a.com';
        const rr = router.base(origin);

        expect(rr.base('/whatever').baseURL).to.equal(origin + '/whatever');
      });
    });

    describe('with an absolute path', () => {
      it('should resolve to the given path', () => {
        const baseURL = 'http://a.com/api';
        const rr = router.base(baseURL);

        expect(rr.baseURL).to.equal(baseURL);
      });
    });
  });
}
