import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

export function storageRunner() {
  const { storage } = createServer();

  describe('Storage', () => {
    describe('.set()', () => {
      it('should return what is set', async () => {
        const complexData = {
          source: [{
            id: 1,
          }],
        };

        const res = await storage.set('complexData', complexData);

        expect(res).to.deep.equal(complexData);
      });
    });

    describe('.get()', () => {
      it('should get previously set value', async () => {
        await storage.set('whoami', 'ServiceMocker');

        const res = await storage.get('whoami');

        expect(res).to.equal('ServiceMocker');
      });
    });

    describe('.remove()', () => {
      it('should get previously set value', async () => {
        await storage.set('whoami', 'ServiceMocker');

        await storage.remove('whoami');

        const res = await storage.get('whoami');

        expect(res).to.be.null;
      });
    });

    describe('.clear()', () => {
      it('should remove all entries', async () => {
        await storage.set('a', '1');
        await storage.set('b', '2');
        await storage.set('c', '3');

        await storage.clear();

        expect(await storage.get('a')).to.be.null;
        expect(await storage.get('b')).to.be.null;
        expect(await storage.get('c')).to.be.null;
      });
    });
  });
}
