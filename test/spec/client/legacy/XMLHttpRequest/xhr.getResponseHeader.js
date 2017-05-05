import { expect } from 'chai';

import { fakeRequest } from '../../../helpers/';

export default function () {
  describe('xhr.getResponseHeader()', () => {
    it('should get "ServiceMocker"', async () => {
      const { xhr } = await fakeRequest({
        response: new Response('', {
          headers: { 'X-Powered-By': 'FakeRequest' },
        }),
      });

      const header = xhr.getResponseHeader('X-Powered-By');

      expect(header).to.equal('FakeRequest');
    });

    it('should return native header', async () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/', true);

      const promise = new Promise((resolve) => {
        xhr.onload = resolve;
      });

      xhr.send();

      await promise;

      const header = xhr.getResponseHeader('X-Powered-By');

      expect(header).to.not.equal('FakeRequest');
    });
  });
}
