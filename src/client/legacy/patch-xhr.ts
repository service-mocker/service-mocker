/*!
 * Patch native `XMLHttpRequest`
 *
 * Notes:
 * - When and how to dispatch fetch event:
 *   1. A XMLHttpRequest won't be sent until we call `xhr.send()`, so we should dispatch a
 *   fetch event when `xhr.send()` is invoked,
 *   2. By overriding `xhr.open()` method, we can get `request_method` and `request_url`,
 *   3. By overriding `xhr.setRequestHeader()`, we can get `request_headers`,
 *   4. Create a request instance with `request_method`, `request_url`, `request_headers`,
 *      and other options got from `this[xhrProp]` like `this.withCredentials` (will be
 *      delegated to `this.nativeXHR[xhrProp]`).
 *   5. Dispatch fetch event with the request.
 *   6. If fetch event responds with a `Response`, parse it and dispatch `readystatechange`
 *      event and progress events via `this.dispatchEvent()` (will be delegated to
 *      `this.nativeXHR.dispatchEvent()`).
 *   7. Or, re-send native requeust via `this.nativeXHR.send()`.
 *
 * - About events handling:
 *   1. Since we delegate all `XMLHttpRequest.prototype` methods to `this.nativeXHR`, there's
 *   no need to create an event emitter, simply calling `this.dispatchEvent()` and all
 *   registered listeners will be invoked, including those are set by `instance#on[event]`.
 *   2. Meanwhile, all the event handlers you registered on `ExtandableXHR` instance will actually be
 *   registered on `this.nativeXHR`. So even if we re-send the native request, all the handlers will
 *   be called properly.
 */

import { createEvent } from './create-event';
import { ExtandableXHR } from './extendable-xhr';
import { dispatchFetchEvent } from './dispatch-fetch-event';

export function patchXHR() {
  if ((XMLHttpRequest as any).mockerPatched) {
    return;
  }

  (self as any).XMLHttpRequest = MockerXHR;
}

// only `readystatechange` event and progress events are need to be dispatched
const EVENTS_LIST = [
  'readystatechange',
  'loadstart',
  'progress',
  'load',
  'loadend',
];

class MockerXHR extends ExtandableXHR {
  // marked with `mockerPatched` symbol
  static readonly mockerPatched = true;

  // keep a native reference
  static readonly native = XMLHttpRequest;

  // record request headers via `setRequestHeader` method
  private _requestHeaders = new Headers();

  // save response headers for `getResponseHeader(s)` methods
  private _responseHeaders: Headers;

  // override response 'Content-Type' header via `overrideMimeType` method
  private _responseMIME: string;

  // save request method and url via `open` method
  private _method: string;
  private _url: string;

  setRequestHeader(header: string, value: string): void {
    super.setRequestHeader(header, value);
    this._requestHeaders.append(header, value);
  }

  getResponseHeader(header: string): string | null {
    if (!this._responseHeaders) {
      return super.getResponseHeader(header);
    }

    return this._responseHeaders.get(header);
  }

  getAllResponseHeaders(): string {
    if (!this._responseHeaders) {
      return super.getAllResponseHeaders();
    }

    const results: Array<string> = [];

    this._requestHeaders.forEach((value, name) => {
      results.push(`${name}: ${value}`);
    });

    return results.join('\n');
  }

  overrideMimeType(mime: string): void {
    super.overrideMimeType(mime);
    this._responseMIME = mime;
  }

  // using rest parameter `method, url, ...rest` here raises a typescript error report, see:
  // https://github.com/Microsoft/TypeScript/issues/4130
  open(method: string, url: string, async?: boolean, user?: string, password?: string): void {
    super.open(method, url, async, user, password);
    this._method = method;
    this._url = url;
  }

  send(data?: any): void {
    if (this.readyState !== this.OPENED) {
      throw new Error(`Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.`);
    }

    this._mockFetch(data).then(result => {
      if (result) {
        // `event.respondWith` called
        // resolve with mock response
        this._processResponse(result);
      } else {
        // send real XMLHttpRequest
        super.send(data);
      }
    });
  }

  private _mockFetch(data?: any): Promise<Response> {
    // GET|HEAD requests cannot include body
    // set body to `null` will raise a TypeMismatchError in IE Edge
    const body = (this._method === 'GET' || this._method === 'HEAD') ? undefined : data;

    // we are not able to handling cookies
    // const credentials = this.withCredentials ? 'include' : 'omit';

    const request = new Request(this._url, {
      body,
      // credentials,
      method: this._method,
      headers: this._requestHeaders,
    });

    return dispatchFetchEvent(request);
  }

  private async _processResponse(response: Response): Promise<void> {
    if (this._responseMIME) {
      // apply `overrideMimeType`
      response.headers.set('content-type', this._responseMIME);
    }

    const result = await parseResponse(response, this.responseType);

    this._responseHeaders = response.headers;

    // pretend this request is DONE
    this._setProperty('readyState', this.DONE);
    this._setProperty('responseURL', response.url);
    this._setProperty('status', response.status);
    this._setProperty('statusText', response.statusText);
    this._setProperty('response', result);

    if (!this.responseType || this.responseType === 'text') {
      this._setProperty('responseText', result);
    }

    if (this.responseType === 'document') {
      this._setProperty('responseXML', result);
    }

    this._dispatchEvents();
  }

  private _setProperty(name: string, value?: any): void {
    // in IE & Safari, those property are unconfigurable
    // assign to patched XHR, as a trade-off
    Object.defineProperty(this, name, {
      value,
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }

  // events handlers
  private _dispatchEvents(): void {
    EVENTS_LIST.forEach(type => {
      const event = createEvent(type);

      if (type !== 'readystatechange') {
        // progress event
        event.total = event.loaded = 1;
      }

      // Caveat: `this` & `event.target` are still the native one
      this.dispatchEvent(event);
    });
  }
}

/**
 * Parse response with the specified `responseType`,
 * return `null` if any error occurs, see:
 * https://xhr.spec.whatwg.org/#the-response-attribute
 */
async function parseResponse(response: Response, responseType?: string): Promise<any> {
  try {
    const res = response.clone();

    switch (responseType) {
      case '':
      case 'text':
        return await res.text();
      case 'json':
        return await res.json();
      case 'blob':
        return await res.blob();
      case 'arraybuffer':
        return await res.arrayBuffer();
      case 'document':
        const text = await res.text();
        const contentType = res.headers.get('content-type');
        const mime = contentType ? contentType.replace(/;.*/, '') : 'text/html';
        const parser = new DOMParser();
        return parser.parseFromString(text, mime);
      default:
        return null;
    }
  } catch (e) {
    return null;
  }
}
