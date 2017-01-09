import {
  Defer,
} from '../../utils/';

import {
  LEGACY_CLIENT_ID,
} from '../../constants/';

import { createEvent } from './create-event';

interface MockFetchEvent extends Event {
  // legacy client ID
  clientId: string;

  // source request
  request: Request;

  // simulate native `respondWith` interface
  // invoke this method to terminate a fetch event
  respondWith(response: Response | Promise<Response>): void;

  // simulate native `waitUntil` interface
  // extend fetch event's lifetime until promise resolved
  waitUntil(promise: any): void;
}

const fetchEvents: any = [];
const addEventListener = self.addEventListener.bind(self);

// handle fetch events ourselves
self.addEventListener = function(type: string, listener: (event: any) => void, useCapture?: boolean) {
  if (type === 'fetch') {
    fetchEvents.push(listener);
  } else {
    addEventListener(type, listener, useCapture);
  }
};

/**
 * Dispatch fetch event on GlobalScope in legacy mode.
 * Resolved with `null` if `event.respondWith` isn't called.
 */
export async function dispatchFetchEvent(request: Request): Promise<Response | null> {
  const fetchEvt: MockFetchEvent = createEvent('fetch');
  const deferred = new Defer();

  let finished = false;

  fetchEvt.request = request;
  fetchEvt.clientId = LEGACY_CLIENT_ID;

  function done(result: any) {
    if (finished) {
      return;
    }

    finished = true;
    deferred.resolve(result);
  }

  fetchEvt.respondWith = (response: Response | Promise<Response>) => {
    if (finished) {
      // tslint:disable-next-line max-line-length
      throw new Error(`Failed to execute 'respondWith' on 'FetchEvent': The fetch event has already been responded to.`);
    }

    done(response);
  };

  fetchEvt.waitUntil = (promise: any) => {
    Promise.resolve(promise).then(() => {
      done(null);
    });
  };

  fetchEvents.forEach((listener) => {
    listener(fetchEvt);
  });

  // `event.respondWith` wasn't called
  if (!finished) {
    done(null);
  }

  return deferred.promise;
}
