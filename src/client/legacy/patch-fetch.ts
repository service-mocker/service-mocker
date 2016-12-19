import { dispatchFetchEvent } from './dispatch-fetch-event';

function isNativeFetch() {
  const fetch: any = self.fetch;

  /* tslint:disable no-multi-spaces max-line-length */
  return !fetch.mockerPatched                           && // haven't been patched
         !fetch.polyfill                                && // github fetch polyfill
         fetch.toString === Function.prototype.toString && // sometimes `toString` method is overrided to pretend it's native XD
         /\[native code\]/.test(fetch.toString());         // fetch is overrided
  /* tslint:enable no-multi-spaces max-line-length */
}

export function patchFetch(): void {
  if (!self.fetch) {
    throw new Error('fetch is required for legacy mode');
  }

  // don't patch polyfills
  if (!isNativeFetch()) {
    return;
  }

  // fetch should be called within Window context
  const nativeFetch = self.fetch.bind(self);

  function patchedFetch(input: RequestInfo, init: RequestInit): Promise<Response> {
    const request = new Request(input, init);

    return dispatchFetchEvent(request).then((response) => {
      if (response) {
        return response;
      } else {
        return nativeFetch(request);
      }
    });
  }

  (patchedFetch as any).mockerPatched = true;
  (patchedFetch as any).native = nativeFetch;
  self.fetch = patchedFetch;
}
