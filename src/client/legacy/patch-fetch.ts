import { dispatchFetchEvent } from './dispatch-fetch-event';

export function patchFetch(): void {
  const nativeFetch: any = self.fetch;

  if (!nativeFetch) {
    throw new Error('fetch is required for legacy mode');
  }

  // only patch once
  if (nativeFetch.mockerPatched) {
    return;
  }

  // don't patch polyfills
  // tslint:disable-next-line no-multi-spaces
  if (nativeFetch.polyfill                                || // github fetch polyfill
     nativeFetch.toString !== Function.prototype.toString || // `toString` method is overrided to pretend it's native XD
     !/\[native code\]/.test(nativeFetch.toString())         // fetch is replaced
  ) {
    return;
  }

  function patchedFetch(input: RequestInfo, init: RequestInit): Promise<Response> {
    const request = new Request(input, init);

    return new Promise((resolve, reject) => {
      dispatchFetchEvent(request).then((response) => {
        if (!response) {
          return nativeFetch(request).then(resolve, reject);
        }

        resolve(response);
      });
    });
  }

  (patchedFetch as any).native = fetch;
  (patchedFetch as any).mockerPatched = fetch;
  self.fetch = patchedFetch;
}
