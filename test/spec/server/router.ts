import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import { RESPONSE } from '../mock-response';
import { uniquePath } from './helpers/unique-path';
import { sendRequest } from './helpers/send-request';

export function routerRunner() {
  const { router } = createServer();
  const methods = ['get', 'post', 'put', 'head', 'delete', 'options'];

  describe('Router', () => {
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

    describe('.all', () => {
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
