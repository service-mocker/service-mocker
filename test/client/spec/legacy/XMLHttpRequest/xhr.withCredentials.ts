import { expect } from 'chai';

import { fakeRequest } from '../../../../helpers/';

export default function() {
  describe('xhr.withCredentials()', () => {
    it('should include credentials', async () => {
      const { request } = await fakeRequest({
        preprocess(xhr) {
          xhr.withCredentials = true;
        },
      });

      expect(request.credentials).to.equal('include');
    });
  });
}
