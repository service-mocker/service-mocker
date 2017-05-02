import {
  Defer,
} from '../../utils/';

import { createEvent } from './create-event';

const fetchEvents = [];
const addEventListener = self.addEventListener.bind(self);

// handle fetch events ourselves
self.addEventListener = function (type, listener, useCapture) {
  if (type === 'fetch') {
    fetchEvents.push(listener);
  } else {
    addEventListener(type, listener, useCapture);
  }
};

/**
 * Dispatch fetch event on GlobalScope in legacy mode.
 * Resolved with `null` if `event.respondWith` isn't called.
 *
 * @param  {Request} request Request object
 * @return {Promise<Response>}
 */
export function dispatchFetchEvent(request) {
  const fetchEvt = createEvent('fetch');
  const deferred = new Defer();

  fetchEvt.request = request;

  fetchEvt.respondWith = (response) => {
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
