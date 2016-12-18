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

  let res = null;

  fetchEvt.request = request;
  fetchEvt.clientId = LEGACY_CLIENT_ID;
  fetchEvt.respondWith = (response) => {
    res = response;
    deferred.resolve(response);
  };
  fetchEvt.waitUntil = (promise: any) => {
    Promise.resolve(promise).then(() => {
      deferred.resolve(res);
    });
  };

  self.dispatchEvent(fetchEvt);

  return deferred.promise;
}
