/*!
 * Patch native `XMLHttpRequest`
 * @author Dolphin Wood
 *
 * Notes:
 * - Main concepts:
 *   1. Implement another XHR is considered tough and meaningless, FYI:
 *      <https://github.com/nuysoft/Mock/blob/refactoring/src/mock/xhr/xhr.js>
 *   2. The best way to make another XHR is extending native constructor with
 *      overriding some methods. However, extending XMLHttpRequest raises an error
 *      <Failed to construct 'XMLHttpRequest': Please use the 'new' operator,
 *      this DOM object constructor cannot be called as a function.>
 *   3. So we should extend `XMLHttpRequest` in some ways that are not constructing
 *      XHR with `XMLHttpRequest.call(this)`:
 *      3.1. Look back to JavaScript inheritance, no matter which method we choose to
 *           use, we are almost doing the same thing: let the execution context of
 *           `SuperClass.prototype.method` be the instance of `SubClass`.
 *      3.2. Thus if we bind `XMLHttpRequest.prototype.method` with a XHR instance,
 *           we can be free to invoke all methods in prototype! Then attaching these
 *           methods to the `SubXHR.prototype`, the instances of `SubXHR` will act
 *           as if they're real XHR instances!
 *
 * - Implementation of `SubXHR`:
 *   1. Create a normal class with `this.nativeXHR` pointing to a XHR instance,
 *   2. Iterate through the descriptors of `XMLHttpRequest.prototype`:
 *      2.1. If the property is a primitive value, do nothing,
 *      2.2. If the property is an accessor, bind `get` and `set` with `this.nativeXHR`,
 *      2.3. If the property is a function, bind it with `this.nativeXHR`,
 *      2.4. Copy the descriptor to `SubXHR.prototype`
 *   3. Iterate through the descriptors of `XMLHttpRequest`, copy them to `SubXHR` as
 *      static methods.
 *
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
 *   2. Meanwhile, all the event handlers you registered on `SubXHR` instance will actually be
 *   registered on `this.nativeXHR`, so even if we send native request, all the handlers will
 *   be called properly.
 */

import { createEvent } from './create-event';
import { dispatchFetchEvent } from './dispatch-fetch-event';

export function patchXHR() {
  if ((XMLHttpRequest as any).mockerPatched) {
    return;
  }

  // copy all static properties
  Object.keys(XMLHttpRequest).forEach(prop => {
    Object.defineProperty(
      MockerXHR, prop,
      Object.getOwnPropertyDescriptor(XMLHttpRequest, prop),
    );
  });

  // copy all prototype properties
  mapPrototypeMethods(XMLHttpRequest.prototype, MockerXHR.prototype);
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

// merge XMLHttpRequest interface
interface MockerXHR extends XMLHttpRequest {}

class MockerXHR {
  // marked with `mockerPatched` symbol
  static readonly mockerPatched = true;

  // keep a native reference
  static readonly native = XMLHttpRequest;

  // init a real XHR instance
  private _nativeXHR = new MockerXHR.native();

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
    this._nativeXHR.setRequestHeader(header, value);
    this._requestHeaders.append(header, value);
  }

  getResponseHeader(header: string): string | null {
    return this._responseHeaders.get(header);
  }

  getAllResponseHeaders(): string {
    const results = [];

    this._requestHeaders.forEach((value, name) => {
      results.push(`${name}: ${value}`);
    });

    return results.join('\n');
  }

  overrideMimeType(mime: string): void {
    this._nativeXHR.overrideMimeType(mime);
    this._responseMIME = mime;
  }

  // using rest parameter `method, url, ...rest` here raises a typescript error report, see:
  // https://github.com/Microsoft/TypeScript/issues/4130
  open(method: string, url: string, async?: boolean, user?: string, password?: string): void {
    this._nativeXHR.open(method, url, async, user, password);
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
        this._nativeXHR.send(data);
      }
    });
  }

  private _mockFetch(data?: any): Promise<Response> {
    // GET|HEAD requests cannot include body
    const body = (this._method === 'GET' || this._method === 'HEAD') ? null : data;

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

      this.dispatchEvent(event);

      // no need to invoke listeners manually
      // const handler = this[`on${type}`];
      // if (handler) {
      //   handler.call(this._nativeXHR, event);
      // }
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

// delegate all unset properties to `_nativeXHR`
function mapPrototypeMethods(
  source: any = XMLHttpRequest.prototype,
  target: any = MockerXHR.prototype,
): void {
  if (source.constructor === Object) {
    // exit recursion
    return;
  }

  Object.keys(source).forEach(name => {
    if (target.hasOwnProperty(name)) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(source, name);

    if (descriptor.set || descriptor.get) {
      // getter
      const {
        get: nativeGet,
        set: nativeSet,
      } = descriptor;

      descriptor.get = nativeGet && function get() {
        return nativeGet.call(this._nativeXHR);
      };

      descriptor.set = nativeSet && function set(value) {
        return nativeSet.call(this._nativeXHR, value);
      };
    } else if (typeof descriptor.value === 'function') {
      // method
      const nativeFn = descriptor.value;
      descriptor.value = function wrapped(...args) {
        return nativeFn.apply(this._nativeXHR, args);
      };
    }

    Object.defineProperty(target, name, descriptor);
  });

  // recursively look-up
  mapPrototypeMethods(Object.getPrototypeOf(source), target);
}
