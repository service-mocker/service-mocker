import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

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

      it('should be set via `createServer()`', () => {
        const baseURL = 'http://a.com/api/v1';
        const { router } = createServer(baseURL);

        expect(router.baseURL).to.equal(baseURL);
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
          res.send('whatever');
        });

        const { body } = await sendRequest(path);

        expect(body).to.equal('whatever');
      });

      it('should support shorthand method', async () => {
        const path = uniquePath();

        router.get(path, 'whatever');

        const { body } = await sendRequest(path);

        expect(body).to.equal('whatever');
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
          res.end();
        });

        for (let method of methods) {
          await sendRequest(path, { method: method.toUpperCase() });
        }

        expect(count).to.equal(methods.length);
      });
    });

    describe('.route()', () => {
      it('should capture requests within given scope', async () => {
        const path = uniquePath();

        router.route(path).get((_req, res) => {
          res.send('whatever');
        });

        const { body } = await sendRequest(path);

        expect(body).to.equal('whatever');
      });

      it('should have all supported routing methods', async () => {
        let count = 0;
        const path = uniquePath();
        const scoped = router.route(path);

        for (let method of methods) {
          scoped[method]((_req, res) => {
            count++;
            res.end();
          });

          await sendRequest(path, { method: method.toUpperCase() });
        }

        expect(count).to.equal(methods.length);
      });

      it('should have a `.all()` method', async () => {
        let count = 0;
        const path = uniquePath();

        router.route(path).all((_req, res) => {
          count++;
          res.end();
        });

        for (let method of methods) {
          await sendRequest(path, { method: method.toUpperCase() });
        }

        expect(count).to.equal(methods.length);
      });
    });
  });
}
