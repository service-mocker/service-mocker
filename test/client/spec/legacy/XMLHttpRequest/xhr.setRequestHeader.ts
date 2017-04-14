import { expect } from 'chai';

import { fakeRequest } from '../../../../helpers/';

export default function() {
  describe('xhr.setRequestHeader()', () => {
    it('should get "MockerClient"', async () => {
      const { request } = await fakeRequest({
        preprocess(xhr) {
          xhr.setRequestHeader('X-Custom', 'MockerClient');
        },
      });

      expect(request.headers.get('X-Custom')).to.equal('MockerClient');
    });
  });
}
