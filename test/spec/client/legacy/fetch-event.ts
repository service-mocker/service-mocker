import { expect } from 'chai';
import { LEGACY_CLIENT_ID } from 'service-mocker/lib/constants';

export function fetchEventRunner() {
  describe('fetch event', () => {
    describe('.clientId', () => {
      it('should have a `.clientId` property', async () => {
        const event = await fetchEventToPromise();

        expect(event).to.have.property('clientId')
          .and.that.equals(LEGACY_CLIENT_ID);
      });
    });

    describe('.request', () => {
      it('should have a `.request` property', async () => {
        const event = await fetchEventToPromise();

        expect(event).to.have.property('request')
          .and.that.is.an.instanceof(Request);
      });
    });

    describe('.respondWith()', () => {
      it('should have a `.respondWith()` method', async () => {
        const event = await fetchEventToPromise();

        expect(event).to.have.property('respondWith')
          .and.that.is.a('function');
      });

      it('should throw an error when `.respondWith()` called twice', async () => {
        let err: any;
        const event = await fetchEventToPromise();

        try {
          event.respondWith(null);
          event.respondWith('whatever');
        } catch (e) {
          err = e;
        }

        expect(err).not.to.be.null;
      });
    });
  });
}

function fetchEventToPromise(): Promise<any> {
  return new Promise((resolve) => {
    self.addEventListener('fetch', resolve);
    fetch('/');
  });
}
