import {
  Defer,
} from '../../utils/';

import {
  LEGACY_CLIENT_ID,
} from '../../constants/';

let originalFetch: any;
let fetchPatched: boolean;

function dispatchFetchEvent(request: Request): Promise<Response> {
  let fetchEvt: any;

  try {
    fetchEvt = new Event('fetch', {
      bubbles: true,
    });
  } catch (e) {
    fetchEvt = document.createEvent('Event');
    fetchEvt.initEvent('fetch', true, false);
  }

  const deferred = new Defer();
  const fetch = originalFetch || self.fetch;

  fetchEvt.request = request;
  fetchEvt.clientId = LEGACY_CLIENT_ID;
  fetchEvt.respondWith = (response) => {
    deferred.resolve(response);
  };

  self.dispatchEvent(fetchEvt);

  setTimeout(() => {
    if (!deferred.done) {
      deferred.resolve(fetch(request));
    }
  }, 300);

  return deferred.promise;
}

export function patchFetch(): void {
  const {
    fetch,
  } = self;

  if (!fetch) {
    throw new Error('fetch is required for legacy mode');
  }

  if (fetchPatched) {
    return;
  }

  self.fetch = function patchedFetch(input, init) {
    const request = new Request(input, init);

    return dispatchFetchEvent(request);
  };

  fetchPatched = true;
  originalFetch = fetch;
}
