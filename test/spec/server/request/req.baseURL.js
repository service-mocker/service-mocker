import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
  requestToPromise,
} from '../../helpers/';

export default function () {
  const { router } = createServer();

  describe('req.baseURL', () => {
    describe('with `router.scope()` unset', () => {
      it('should equal to local machine', async () => {
        const request = await requestToPromise();

        expect(request).to.have.property('baseURL')
          .and.that.equals(new URL(location.href).origin);
      });
    });

    describe('with `router.scope(path)', () => {
      it('should equal to the given scope path', async () => {
        const baseURL = '/api/v1';
        const path = uniquePath();
        let request;

        router.scope(baseURL).get(path, (req, res) => {
          request = req;
          res.end();
        });

        await sendRequest(baseURL + path);

        expect(request.baseURL).to.equal(new URL(baseURL, location.href).href);
      });
    });
  });
}
