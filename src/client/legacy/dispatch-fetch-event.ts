import {
  Defer,
} from '../../utils/';

import {
  LEGACY_CLIENT_ID,
} from '../../constants/';

import { createEvent } from './create-event';

export function dispatchFetchEvent(request: Request): Promise<Response> {
  const fetchEvt = createEvent(self, 'fetch');
  const deferred = new Defer();

  fetchEvt.request = request;
  fetchEvt.clientId = LEGACY_CLIENT_ID;
  fetchEvt.respondWith = (response) => {
    deferred.resolve(response);
  };

  self.dispatchEvent(fetchEvt);

  return deferred.promise;
}
