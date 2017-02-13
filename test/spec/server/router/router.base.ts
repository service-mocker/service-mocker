import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function() {
  const { router } = createServer();

  describe('router.base(undefined)', () => {
    it('should set to current baseURL when not given', () => {
      const rr = router.base();

      expect(rr.baseURL).to.equal(router.baseURL);
    });
  });

  describe('router.base(String)', () => {
    it('should return a new Router', () => {
      expect(router.base('/')).not.to.equal(router);
    });

    it('should strip the trailing slash', () => {
      const rr = router.base('/api/');

      expect(rr.baseURL).to.equal(router.baseURL + '/api');
    });

    it('should match baseURL from begining', async () => {
      const path = uniquePath();

      router.base('/api').get('/greet' + path, 'Something is wrong');
      router.base('/greet').get('/api' + path, 'Hello world');

      const { body } = await sendRequest('/greet/api' + path);

      expect(body).to.equal('Hello world');
    });

    describe('with a relative path', () => {
      it('should resolve to current origin', () => {
        const rr = router.base('/whatever');

        expect(rr.baseURL).to.equal(new URL('/whatever', location.href).href);
      });

      it('should resolve against current baseURL', () => {
        const rr = router.base('/what').base('/ever');

        expect(new URL(rr.baseURL).pathname).to.equal('/what/ever');
      });
    });

    describe('with an absolute path', () => {
      it('should abort processing', () => {
        let err: any;

        try {
          router.base('http://a.com');
        } catch (e) {
          err = e;
        }

        expect(err).to.exist;
      });
    });
  });
}
