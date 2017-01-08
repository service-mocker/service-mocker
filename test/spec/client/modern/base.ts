import { expect } from 'chai';
import { createClient } from 'service-mocker/client';

export function baseRunner() {
  const client = createClient('server.js');

  describe('Infrastructure', () => {
    describe('.isLegacy', () => {
      it('should have a `.isLegacy` property', () => {
        expect(client).to.have.property('isLegacy')
          .and.that.is.false;
      });
    });

    describe('.ready', () => {
      it('should have a `.ready` property', () => {
        expect(client).to.have.property('ready')
          .and.that.is.instanceof(Promise);
      });

      it('should resolved with service worker registration', async () => {
        const reg = await client.ready;
        const nativeReg = await navigator.serviceWorker.getRegistration();

        expect(reg).to.deep.equal(nativeReg);
      });
    });

    describe('.controller', () => {
      it('should have a `.controller` property', () => {
        expect(client).to.have.property('controller');
      });

      it('should equal to `navigator.serviceWorker.controller`', () => {
        expect(client.controller).to.equals(navigator.serviceWorker.controller);
      });
    });

    describe('.getRegistration()', () => {
      it('should resolved with service worker registration', async () => {
        const reg = await client.getRegistration();
        const nativeReg = await navigator.serviceWorker.getRegistration();

        expect(reg).to.deep.equal(nativeReg);
      });
    });

    describe('.update()', () => {
      it('should resolved with latest service worker registration', async () => {
        const latestReg = await client.update();
        const nativeReg = await navigator.serviceWorker.getRegistration();

        expect(latestReg).to.deep.equal(nativeReg);
      });
    });
  });
}
