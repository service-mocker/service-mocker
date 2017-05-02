import { expect } from 'chai';

export default function () {
  describe('fetch event', () => {
    describe('event.request', () => {
      it('should have a `.request` property', async () => {
        const event = await fetchEventToPromise();

        expect(event).to.have.property('request')
          .and.that.is.an.instanceof(Request);
      });
    });

    describe('event.respondWith()', () => {
      it('should have a `.respondWith()` method', async () => {
        const event = await fetchEventToPromise();

        expect(event).to.have.property('respondWith')
          .and.that.is.a('function');
      });

      it('should throw an error when `.respondWith()` called twice', async () => {
        let err;
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

function fetchEventToPromise() {
  return new Promise((resolve) => {
    self.addEventListener('fetch', resolve);
    fetch('/');
  });
}
