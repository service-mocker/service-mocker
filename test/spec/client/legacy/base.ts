import { expect } from 'chai';
import { createClient } from 'service-mocker/client';

export function baseRunner() {
  const client = createClient('server.js', {
    forceLegacy: true,
  });

  describe('Infrastructure', () => {
    describe('.isLegacy', () => {
      it('should have a `.isLegacy` property', () => {
        expect(client).to.have.property('isLegacy')
          .and.that.is.true;
      });
    });

    describe('.ready', () => {
      it('should have a `.ready` property', () => {
        expect(client).to.have.property('ready')
          .and.that.is.instanceof(Promise);
      });

      it('should resolved with `null`', async () => {
        const reg = await client.ready;

        expect(reg).to.be.null;
      });
    });

    describe('.controller', () => {
      it('should have a `.controller` property', () => {
        expect(client).to.have.property('controller');
      });

      it('should be `null`', () => {
        expect(client.controller).to.be.null;
      });
    });

    describe('.getRegistration()', () => {
      it('should resolved with `null`', async () => {
        const reg = await client.getRegistration();
        expect(reg).to.be.null;
      });
    });

    describe('.update()', () => {
      it('should resolved with `null`', async () => {
        const latestReg = await client.update();

        expect(latestReg).to.be.null;
      });
    });
  });
}
