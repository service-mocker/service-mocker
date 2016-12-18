import {
  Defer,
} from '../../utils/';

import {
  LEGACY_CLIENT_ID,
} from '../../constants/';

import { createEvent } from './create-event';

export function dispatchFetchEvent(request: Request): Promise<Response | null> {
  const fetchEvt = createEvent(self, 'fetch');
  const deferred = new Defer();

  let done = false;

  fetchEvt.request = request;
  fetchEvt.clientId = LEGACY_CLIENT_ID;

  fetchEvt.respondWith = (response: Response | Promise<Response>) => {
    if (done) {
      // tslint:disable-next-line max-line-length
      throw new Error(`Failed to execute 'respondWith' on 'FetchEvent': The fetch event has already been responded to.`);
    }

    done = true;
    deferred.resolve(response);
  };

  fetchEvt.waitUntil = (promise: any) => {
    Promise.resolve(promise).then(() => {
      if (!done) {
        done = true;
        deferred.resolve(null);
      }
    });
  };

  self.dispatchEvent(fetchEvt);

  return deferred.promise;
}
