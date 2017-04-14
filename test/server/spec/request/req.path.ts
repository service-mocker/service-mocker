import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
  requestToPromise,
} from '../../../helpers/';

export default function() {
  const { router } = createServer();

  describe('req.path', () => {
    it('should be set to the request path', async () => {
      const path = uniquePath();
      const request = await requestToPromise({
        route: path,
        requestURL: path,
      });

      expect(request.path).to.equal(path);
    });

    describe('with given baseURL', () => {
      it('should shrink to the given baseURL', async () => {
        let request: any;

        const path = uniquePath();
        const baseURL = '/api/v1';

        router.scope(baseURL).get(path, (req, res) => {
          request = req;
          res.end();
        });

        await sendRequest(baseURL + path);

        expect(request.path).to.equal(path);
      });
    });
  });
}
