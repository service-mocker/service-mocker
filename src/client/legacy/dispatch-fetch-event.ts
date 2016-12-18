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

  let finished = false;

  fetchEvt.isLegacy = true;
  fetchEvt.request = request;
  fetchEvt.clientId = LEGACY_CLIENT_ID;

  function done(result: any) {
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
