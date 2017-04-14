import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
} from '../../../helpers/';

export default function() {
  const { router } = createServer();
  const methods = ['get', 'post', 'put', 'head', 'delete', 'options'];

  describe('router.route()', () => {
    it('should capture requests within given scope', async () => {
      const path = uniquePath();

      router.route(path).get((_req, res) => {
        res.send('whatever');
      });

      const { body } = await sendRequest(path);

      expect(body).to.equal('whatever');
    });
  });

  describe('router.route().METHOD()', () => {
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
}
