import { expect } from 'chai';

import {
  uniquePath,
  requestToPromise,
} from '../../helpers/';

export default function () {
  describe('req.url', () => {
    it('should be an absolute path', async () => {
      const path = uniquePath();

      const request = await requestToPromise({
        route: path,
        requestURL: path,
      });

      expect(request).to.have.property('url')
        .and.that.equals(new URL(path, location.href).href);
    });
  });
}
