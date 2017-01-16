import { expect } from 'chai';

import {
  uniquePath,
  requestToPromise,
} from '../../helpers/';

export default function() {
  describe('req.query', () => {
    it('should be an object', async () => {
      const request = await requestToPromise();

      expect(request.query).to.be.an('object');
    });

    it('should obtain a `.user` property', async () => {
      const path = uniquePath();
      const { query } = await requestToPromise({
        route: path,
        requestURL: `${path}?user=dolphin`,
      });

      expect(query).to.have.property('user')
        .and.that.equals('dolphin');
    });

    describe('nested query', () => {
      it('should have a `query.user.name` property', async () => {
        const path = uniquePath();
        const { query } = await requestToPromise({
          route: path,
          requestURL: `${path}?user[name]=dolphin`,
        });

        expect(query.user).to.have.property('name')
          .and.that.equals('dolphin');
      });
    });
  });
}
