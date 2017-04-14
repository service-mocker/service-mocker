import { expect } from 'chai';

import {
  uniquePath,
  requestToPromise,
} from '../../../helpers/';

export default function() {
  describe('req.clone()', () => {
    it('should return a new MockerRequest', async () => {
      const request = await requestToPromise();

      const rr = request.clone();

      expect(rr.constructor).to.equal(request.constructor);
    });

    it('should keep the same properties', async () => {
      const path = uniquePath();

      const request = await requestToPromise({
        route: `${path}/:user`,
        requestURL: `${path}/dolphin?id=1`,
      });

      const rr = request.clone();

      Object.keys(rr).forEach((prop) => {
        expect(rr[prop]).to.deep.equal(request[prop]);
      });
    });
  });
}
