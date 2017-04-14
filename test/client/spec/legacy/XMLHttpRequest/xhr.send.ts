import { expect } from 'chai';

import { fakeRequest } from '../../../../helpers/';

export default function() {
  describe('xhr.send()', () => {
    it('should throw an error when state is not OPENED', () => {
      let err: any;

      try {
        const xhr = new XMLHttpRequest();
        xhr.send();
      } catch (e) {
        err = e;
      }

      expect(err).not.to.be.null;
    });
  });

  describe('xhr.send(body)', () => {
    it('should ignore body for GET request', async () => {
      const { request } = await fakeRequest({
        method: 'GET',
        body: 'whatever',
      });

      expect(await request.text()).to.be.empty;
    });

    it('should ignore body for HEAD request', async () => {
      const { request } = await fakeRequest({
        method: 'HEAD',
        body: 'whatever',
      });

      expect(await request.text()).to.be.empty;
    });

    it('should NOT ignore body for OPTIONS request', async () => {
      const { request } = await fakeRequest({
        method: 'OPTIONS',
        body: 'whatever',
      });

      expect(await request.text()).to.equal('whatever');
    });
  });
}
