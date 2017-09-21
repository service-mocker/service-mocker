import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function () {
  describe('server.use', () => {
    it('should be processed in middleware', async () => {
      const path = uniquePath();
      const server = createServer(path);

      server.use((req, res) => {
        res.headers.set('X-Middleware', '1');
      });

      server.router.get('/', 'Hello world');

      const { headers } = await sendRequest(`${path}/`);

      expect(headers.get('X-Middleware')).to.equal('1');
    });
  });

  describe('router.use', () => {
    it('should throw a TypeError', () => {
      const { router } = createServer();

      let err = null;

      try {
        router.use('wrong');
      } catch (e) {
        err = e;
      }

      expect(err).to.be.instanceof(TypeError);
    });

    it('should be processed in middleware', async () => {
      const { router } = createServer();
      const path = uniquePath();

      router.use((req, res) => {
        res.headers.set('X-Middleware', '10');
      });

      router.get(path, 'Hello world');

      const { headers } = await sendRequest(path);

      expect(headers.get('X-Middleware')).to.equal('10');
    });

    it('should be able to accept asynchronous middleware', async () => {
      const { router } = createServer();
      const path = uniquePath();

      router.use(async (req, res) => {
        await Promise.resolve(null);
        res.headers.set('X-Middleware', '11');
      });

      router.get(path, 'Hello world');

      const { headers } = await sendRequest(path);

      expect(headers.get('X-Middleware')).to.equal('11');
    });

    it('should inherit middleware from upstream', async () => {
      const { router } = createServer();
      const path = uniquePath();

      router.use((req, res) => {
        res.headers.set('X-Server', 'Mocker');
      });

      router.scope(path)
        .use((req, res) => {
          res.headers.set('X-CheckPoint', '1');
        })
        .get('/', 'Hello world');

      const { headers } = await sendRequest(`${path}/`);

      expect(headers.get('X-Server')).to.equal('Mocker');
      expect(headers.get('X-CheckPoint')).to.equal('1');
    });
  });
}
