import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function () {
  const { router } = createServer();
  const methods = ['get', 'post', 'put', 'head', 'delete', 'options', 'patch'];

  describe('router.METHOD()', () => {
    it('should have basic HTTP request methods defined in fetch standard', () => {
      for (let method of methods) {
        expect(router).to.have.property(method)
          .and.that.is.a('function');
      }
    });
  });

  describe('router.METHOD(path, callback)', () => {
    it('should intercept client request', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.send('whatever');
      });

      const { body } = await sendRequest(path);

      expect(body).to.equal('whatever');
    });
  });

  describe('router.METHOD(path, responseBody)', () => {
    it('should support shorthand method', async () => {
      const path = uniquePath();

      router.get(path, 'whatever');

      const { body } = await sendRequest(path);

      expect(body).to.equal('whatever');
    });
  });

  describe('router.all()', () => {
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

  describe('when matching multiple rules', () => {
    it('should only invoke the first matched route', async () => {
      const path = uniquePath();

      let id = 0;

      router.get(path, (_req, res) => {
        id = 1;
        res.end();
      });

      router.get(path, (_req, res) => {
        id = 2;
        res.end();
      });

      const rr = router.scope();
      rr.get(path, (_req, res) => {
        id = 3;
        res.end();
      });

      await sendRequest(path);

      expect(id).to.equal(1);
    });

    it('should support setting a catch all route', async () => {
      const scopePath = uniquePath();
      const scopeRouter = router.scope(scopePath);

      scopeRouter.get('/greet', 'Hello world');
      scopeRouter.get('/*', 'Not found');

      const { body } = await sendRequest(scopePath + '/lol');

      expect(body).to.equal('Not found');
    });
  });
}
