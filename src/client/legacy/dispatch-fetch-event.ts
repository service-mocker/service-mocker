/*!
 * Dispatch a native-like fetch event in GlobalScope.
 * @author Dolphin Wood
 *
 * Notes:
 * - 300ms timeout VS `end()` hook:
 *    Both of them work well, but if every request is delaied for 300ms,
 *    it would be a huge burden for daily devlopment.
 *
 * - Re-fetch unhandled events or not:
 *   No.
 *   When a XHR fails, we invoke `nativeXHR.send()`;
 *   But when a fetch fails, we call `nativeFetch()` again to fetch response.
 *   They are handled differently, so I think we should not do a re-fetch when event resolved with `null`.
 */

import {
  Defer,
} from '../../utils/';

import {
  LEGACY_CLIENT_ID,
} from '../../constants/';

import { createEvent } from './create-event';

interface CustomFetchEvent extends Event {
  // symbol for legacy mode
  isLegacy: boolean;

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

  // hook method for terminating fetch event.
  // since we are not able to know whether a fetch event is handled,
  // we need provide a method to terminate it from outside.
  // a `end()` call will resolve the event with `null`
  end(): void;
}

/**
 * Dispatch fetch event on GlobalScope in legacy mode.
 * Resolved with `null` if `event.respondWith` isn't called.
 */
export async function dispatchFetchEvent(request: Request): Promise<Response | null> {
  const fetchEvt: CustomFetchEvent = createEvent('fetch');
  const deferred = new Defer();

  let finished = false;

  fetchEvt.isLegacy = true;
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

  fetchEvt.end = () => {
    done(null);
  };

  self.dispatchEvent(fetchEvt);

  return deferred.promise;
}
