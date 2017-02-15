import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function() {
  const { router } = createServer();

  describe('router.scope(undefined)', () => {
    it('should set to current baseURL', () => {
      const rr = router.scope();

      expect(rr.baseURL).to.equal(router.baseURL);
    });
  });

  describe('router.scope(String)', () => {
    it('should return a new Router', () => {
      expect(router.scope('/')).not.to.equal(router);
    });

    it('should strip the trailing slash', () => {
      const rr = router.scope('/api/');

      expect(rr.baseURL).to.equal(router.baseURL + '/api');
    });

    it('should match baseURL from begining', async () => {
      const path = uniquePath();

      router.scope('/api').get('/greet' + path, 'Something is wrong');
      router.scope('/greet').get('/api' + path, 'Hello world');

      const { body } = await sendRequest('/greet/api' + path);

      expect(body).to.equal('Hello world');
    });

    describe('with a correct scope path', () => {
      it('should resolve to current origin', () => {
        const rr = router.scope('/whatever');

        expect(rr.baseURL).to.equal(new URL('/whatever', location.href).href);
      });

      it('should resolve against current baseURL', () => {
        const rr = router.scope('/what').scope('/ever');

        expect(new URL(rr.baseURL).pathname).to.equal('/what/ever');
      });
    });

    describe('with an illegal path', () => {
      it('should throw a TypeError', () => {
        let err: any;

        try {
          router.scope('http://a.com');
        } catch (e) {
          err = e;
        }

        expect(err).to.be.an.instanceof(TypeError);
      });
    });
  });
}
