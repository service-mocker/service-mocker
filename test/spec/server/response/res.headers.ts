import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function() {
  const { router } = createServer();

  describe('res.headers', () => {
    it('should has a `headers` property', async () => {
      let response: any;
      const path = uniquePath();

      router.get(path, (_req, res) => {
        response = res;
        res.end();
      });

      await sendRequest(path);

      expect(response).to.have.property('headers')
        .and.that.is.an.instanceof(Headers);
    });

    describe('send headers to client', () => {
      it('should receive a `X-Test` header', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.headers.set('X-Test', 'ServiceMocker');
          res.end();
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('X-Test')).to.equal('ServiceMocker');
      });
    });
  });
}
