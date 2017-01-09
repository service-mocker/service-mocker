/**
 * Patch native `fetch` interface
 *
 * Notes:
 * - Why we should patch native `fetch`:
 *   Although all the environments that support service worker will support fetch too,
 *   but there are still possiblities that cause mocker runs in legacy mode,
 *   for example, user starts a remote access with `http://192.168.1.129:3000`,
 *   mocker will bootstrap in legacy mode because service worker can only be regiestered
 *   in secure pages.
 *   In case of this situation, we should patch up native fetch with a custom fetch event.
 *
 * - Don't patch fetch polyfills that are implementing with `XMLHttpRequest`:
 *   Since we've patched up native `XMLHttpRequest`,
 *   patching a fetch polyfill may cause an infinite loop:
 *   [unhandled -> fetch -> xhr -> router(unhandled) -> fetch]
 *
 * - Native fetch should always be called within Window context.
 *
 * - If custom fetch event resolved with `null`, re-fetch with native fetch.
 */

import { dispatchFetchEvent } from './dispatch-fetch-event';

export function patchFetch(): void {
  /* istanbul ignore if */
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
        // `event.respondWith` called
        // resolve with mock response
        return response;
      } else {
        // fetch real response
        return nativeFetch(request);
      }
    });
  }

  // marked with `mockerPatched` symbol
  (patchedFetch as any).mockerPatched = true;
  // keep a native reference
  (patchedFetch as any).native = nativeFetch;

  self.fetch = patchedFetch;
}

/**
 * Check `self.fetch` is (possible) a native one or a polyfill
 */
function isNativeFetch(): boolean {
  const fetch: any = self.fetch;

  /* tslint:disable no-multi-spaces max-line-length */
  return !fetch.mockerPatched                           && // haven't been patched
         !fetch.polyfill                                && // github fetch polyfill
         fetch.toString === Function.prototype.toString && // sometimes `toString` method is overrided to pretend it's native XD
         /\[native code\]/.test(fetch.toString());         // fetch is overrided
  /* tslint:enable no-multi-spaces max-line-length */
}
