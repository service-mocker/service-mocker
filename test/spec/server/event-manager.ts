import { expect } from 'chai';
import { createServer } from 'service-mocker/server';
import { createEvent } from 'service-mocker/lib/client/legacy/create-event';

import { requestToPromise } from './helpers/router-to-promise';

export function EventManagerRunner() {
  const server = createServer();

  describe('EventManager', () => {
    describe('.on()', () => {
      it('should delegate native event', async () => {
        let event = null;
        const listener = (evt) => {
          event = evt;
        };

        server.on('fetch', listener);
        await requestToPromise();
        server.off('fetch', listener);

        expect(event).to.be.an.instanceof(Event);
      });

      it('should be able to add custom event', () => {
        let event = null;
        const customEvt = createEvent('custom');
        const listener = (evt) => {
          event = evt;
        };

        server.on('custom', listener)
          .emit(customEvt)
          .off('custom', listener);

        expect(event).to.equal(customEvt);
      });
    });

    describe('.off()', () => {
      it('should be able to remove a native event listener', async () => {
        let event = null;
        const listener = (evt) => {
          event = evt;
        };

        server.on('fetch', listener).off('fetch', listener);

        await requestToPromise();

        expect(event).to.be.null;
      });

      it('should be able to remove a custom event listener', () => {
        let event = null;
        const listener = (evt) => {
          event = evt;
        };

        server.on('custom', listener)
          .off('custom', listener)
          .emit(createEvent('custom'));

        expect(event).to.be.null;
      });

      it('should remove all listeners', () => {
        let event = null;
        const listener = (evt) => {
          event = evt;
        };

        server.on('custom', listener)
          .on('custom', listener)
          .off('custom')
          .emit(createEvent('custom'));

        expect(event).to.be.null;
      });
    });

    describe('.emit()', () => {
      it('should be able to emit a native event', function () {
        let event = null;
        const fetchEvt = createEvent('fetch');
        // avoid error in routers
        fetchEvt.request = new Request('who-am-i');

        const listener = (evt) => {
          event = evt;
        };

        server.on('fetch', listener)
          .emit(fetchEvt)
          .off('fetch', listener);

        expect(event).to.equal(fetchEvt);
      });

      it('should be able to emit a custom event', async () => {
        let event = null;
        const customEvt = createEvent('custom');
        const listener = (evt) => {
          event = evt;
        };

        server.on('custom', listener)
          .emit(customEvt)
          .off('custom', listener);

        expect(event).to.equal(customEvt);
      });
    });
  });
}
