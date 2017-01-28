import {
  Defer,
} from '../../utils/';

import { createEvent } from './create-event';

interface MockFetchEvent extends Event {
  // source request
  request: Request;

  // simulate native `respondWith` interface
  // invoke this method to terminate a fetch event
  respondWith(response: Response | Promise<Response>): void;
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

  fetchEvt.request = request;

  fetchEvt.respondWith = (response: Response | Promise<Response>) => {
    if (deferred.done) {
      // tslint:disable-next-line max-line-length
      throw new Error(`Failed to execute 'respondWith' on 'FetchEvent': The fetch event has already been responded to.`);
    }

    deferred.resolve(response);
  };

  fetchEvents.forEach((listener) => {
    listener(fetchEvt);
  });

  // `event.respondWith` wasn't called
  if (!deferred.done) {
    deferred.resolve(null);
  }

  return deferred.promise;
}
