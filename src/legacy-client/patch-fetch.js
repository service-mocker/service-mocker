import {
  Defer,
} from '../utils/';

import {
  LEGACY_CLIENT_ID,
} from '../constants/';

function createFetchEvent(request) {
  let fetchEvt = {};

  try {
    fetchEvt = new Event('fetch', {
      bubbles: true,
    });
  } catch (e) {
    fetchEvt = document.createEvent('Event');
    fetchEvt.initEvent('fetch', true, false);
  }

  const deferred = new Defer();
  const fetch = self.fetch.origin || self.fetch;

  fetchEvt.request = request;
  fetchEvt.clientId = LEGACY_CLIENT_ID;
  fetchEvt._promise = deferred.promise;
  fetchEvt.respondWith = (response) => {
    deferred.resolve(response);
  };

  setTimeout(() => {
    if (deferred.done) return;
    deferred.resolve(fetch(request));
  }, 300);

  return fetchEvt;
}

export function patchFetch() {
  const {
    fetch,
  } = self;

  if (!fetch) {
    throw new Error('fetch is required for legacy mode');
  }

  if (fetch.mockerPatched) {
    return;
  }

  self.fetch = function patchedFetch(input, init) {
    const request = new Request(input, init);
    const fetchEvt = createFetchEvent(request);

    self.dispatchEvent(fetchEvt);

    return fetchEvt._promise;
  };

  self.fetch.mockerPatched = true;
  self.fetch.origin = fetch;
}
