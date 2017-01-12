import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import { RESPONSE } from '../mock-response';
import { uniquePath } from './helpers/unique-path';
import { sendRequest } from './helpers/send-request';

export function routerRunner() {
  const { router } = createServer();
  const methods = ['get', 'post', 'put', 'head', 'delete', 'options'];

  describe('Router', () => {
    describe('.baseURL', () => {
      it('should have a `.baseURL` property', () => {
        expect(router).to.have.property('baseURL')
          .and.that.is.a('string');
      });

      it('should not include trailing slash', () => {
        expect(router.baseURL).not.to.match(/\/$/);
      });
    });

    describe('.base()', () => {
      it('should return a new Router', () => {
        expect(router.base('/')).not.to.equal(router);
      });

      it('should strip the trailing slash', () => {
        const baseURL = 'http://a.com/api/v1';
        const rr = router.base(baseURL + '/');

        expect(rr.baseURL).to.equal(baseURL);
      });

      it('should set to current baseURL when not given', () => {
        const rr = router.base('http://a.com/api');

        expect(rr.base().baseURL).to.equal(rr.baseURL);
      });

      it('should resolve with current origin when giving a relative path', () => {
        const origin = 'http://a.com';
        const rr = router.base(origin);

        expect(rr.base('/whatever').baseURL).to.equal(origin + '/whatever');
      });

      it('should resolve to the given absolute path', () => {
        const baseURL = 'http://a.com/api';
        const rr = router.base(baseURL);

        expect(rr.baseURL).to.equal(baseURL);
      });
    });

    describe('route', () => {
      it('should have bacic HTTP request methods defined in fetch standard', () => {
        for (let method of methods) {
          expect(router).to.have.property(method)
            .and.that.is.a('function');
        }
      });

      it('should intercept client request', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.send(RESPONSE);
        });

        const { text } = await sendRequest(path);

        expect(text).to.equal(RESPONSE);
      });

      it('should support shorthand method', async () => {
        const path = uniquePath();

        router.get(path, RESPONSE);

        const { text } = await sendRequest(path);

        expect(text).to.equal(RESPONSE);
      });
    });

    describe('.all()', () => {
      it('should have a `router.all` method', () => {
        expect(router).to.have.property('all')
          .and.that.is.an.instanceof(Function);
      });

      it('should intercept all kinds of request', async () => {
        let count = 0;
        const path = uniquePath();

        router.all(path, (_req, res) => {
          count++;
          res.send(RESPONSE);
        });

        for (let method of methods) {
          await sendRequest(path, { method: method.toUpperCase() });
        }

        expect(count).to.equal(methods.length);
      });
    });
  });
}
