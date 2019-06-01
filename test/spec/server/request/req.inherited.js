import { expect } from 'chai';

import {
  requestToPromise,
} from '../../helpers/';

export default function () {
  // leave params empty for unique pathes
  describe('inherited methods from native Request class', () => {
    it('should have `.arrayBuffer()` method', async () => {
      const request = await requestToPromise({
        init: {
          method: 'POST',
          body: new ArrayBuffer(100),
        },
      });

      expect(await request.arrayBuffer()).to.be.an.instanceof(ArrayBuffer);
    });

    it('should have `.blob()` method', async () => {
      const request = await requestToPromise({
        init: {
          method: 'POST',
          body: new Blob(),
        },
      });

      expect(await request.blob()).to.be.an.instanceof(Blob);
    });

    // no `res.formData()` method in some browsers
    // fetch polyfill bug: https://github.com/github/fetch/issues/460
    // And it seems `FormData` isn't available at service worker env in Edge 18:
    // https://travis-ci.org/service-mocker/service-mocker/jobs/539948725#L595
    it.skip('should have `.formData()` method', async function () {
      const request = await requestToPromise({
        init: {
          method: 'POST',
          body: new FormData(),
        },
      });

      expect(await request.formData()).to.be.an.instanceof(FormData);
    });

    it('should have `.json()` method', async () => {
      const obj = { user: 'dolphin' };

      const request = await requestToPromise({
        init: {
          method: 'POST',
          body: JSON.stringify(obj),
        },
      });

      expect(await request.json()).to.deep.equal(obj);
    });

    it('should have `.text()` method', async () => {
      const request = await requestToPromise({
        init: {
          method: 'POST',
          body: '123',
        },
      });

      expect(await request.text()).to.equal('123');
    });
  });
}
