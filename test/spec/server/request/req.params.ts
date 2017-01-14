import { expect } from 'chai';

import {
  uniquePath,
  requestToPromise,
} from '../../helpers/';

export default function() {
  describe('req.params', () => {
    it('should have a `.params` property', async () => {
      const request = await requestToPromise();

      expect(request).to.have.property('params')
        .and.that.is.an('object');
    });

    it('should have a `user` property in `req.params`', async () => {
      const path = uniquePath();
      const { params } = await requestToPromise({
        route: `${path}/:user`,
        requestURL: `${path}/dolphin`,
      });

      expect(params).to.have.property('user')
        .and.that.equals('dolphin');
    });
  });
}
