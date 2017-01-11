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
      it('should equal to local machine', () => {
        expect(router).to.have.property('baseURL')
          .and.that.equals(location.origin);
      });

      it('should equal to remote origin', () => {
        const remote = 'https://api.github.com';
        expect(router.base(remote).baseURL).to.equal(remote);
      });
    });

    describe('.base()', () => {
      it('should return a new Router', () => {
        expect(router.base('https://api.github.com')).not.to.equal(router);
      });

      it('should set to current baseURL when not given', () => {
        const rr = router.base('https://api.github.com');

        expect(rr.base().baseURL).to.equal(rr.baseURL);
      });

      it('should throw an error when baseURL is illegal', () => {
        let error = null;

        try {
          router.base('illegal');
        } catch (e) {
          error = e;
        }

        expect(error).not.to.be.null;
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
