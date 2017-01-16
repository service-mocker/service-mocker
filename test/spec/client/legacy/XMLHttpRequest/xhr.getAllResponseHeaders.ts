import { expect } from 'chai';

import { fakeRequest } from '../../../helpers/';

export default function() {
  describe('xhr.getAllResponseHeaders()', () => {
    it('should use 0x0D 0x0A as linebreak characters', async () => {
      const linebreaker = String.fromCharCode(0x0D) + String.fromCharCode(0x0A);

      const { xhr } = await fakeRequest({
        response: new Response('whatever', {
          headers: {
            'X-Custom': 'MockerClient',
            'X-Powered-By': 'FakeRequest',
          },
        }),
      });

      const headers = xhr.getAllResponseHeaders();

      expect(headers).to.have.string(linebreaker);
    });

    it('should return native headers', async () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/', true);

      const promise = new Promise(resolve => {
        xhr.onload = resolve;
      });

      xhr.send();

      await promise;

      const headers = xhr.getAllResponseHeaders();

      expect(headers).to.not.have.string('FakeRequest');
    });
  });
}
