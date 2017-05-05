/**
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
import { dispatchFetchEvent } from './dispatch-fetch-event';

import {
  extensify,
} from '../../utils/';

export function patchXHR() {
  if (XMLHttpRequest.mockerPatched) {
    return;
  }

  self.XMLHttpRequest = MockerXHR;
}

// only `readystatechange` event and progress events are need to be dispatched
const EVENTS_LIST = [
  'readystatechange',
  'loadstart',
  'progress',
  'load',
  'loadend',
];

const ExtandableXHR = extensify(XMLHttpRequest);

class MockerXHR extends ExtandableXHR {
  // marked with `mockerPatched` symbol
  static mockerPatched = true;

  // keep a native reference
  static native = XMLHttpRequest;

  // record request headers via `setRequestHeader` method
  _requestHeaders = new Headers();

  // save response headers for `getResponseHeader(s)` methods
  _responseHeaders = null;

  // override response 'Content-Type' header via `overrideMimeType` method
  _responseMIME = undefined;

  // save request method and url via `open` method
  _method = undefined;
  _url = undefined;

  setRequestHeader(header, value) {
    super.setRequestHeader(header, value);
    this._requestHeaders.append(header, value);
  }

  getResponseHeader(header) {
    if (!this._responseHeaders) {
      return super.getResponseHeader(header);
    }

    return this._responseHeaders.get(header);
  }

  getAllResponseHeaders() {
    if (!this._responseHeaders) {
      return super.getAllResponseHeaders();
    }

    const results = [];

    // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-getallresponseheaders
    const seperator = String.fromCharCode(0x3A) + String.fromCharCode(0x20);
    const linebreaker = String.fromCharCode(0x0D) + String.fromCharCode(0x0A);

    this._responseHeaders.forEach((value, name) => {
      results.push([name, value].join(seperator));
    });

    return results.join(linebreaker);
  }

  overrideMimeType(mime) {
    /* istanbul ignore if */
    if (!super.overrideMimeType) {
      return;
    }

    super.overrideMimeType(mime);
    this._responseMIME = mime;
  }

  open(method, url, ...rest) {
    super.open(method, url, ...rest);
    this._method = method;
    this._url = url;
  }

  send(data) {
    if (this.readyState !== this.OPENED) {
      throw new Error(`Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.`);
    }

    this._mockFetch(data).then((result) => {
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

  /**
   * Mock fetch
   * @private
   * @param  {any}               data request body
   * @return {Promise<Response>}
   */
  _mockFetch(data) {
    // GET|HEAD requests cannot include body
    // set body to `null` will raise a TypeMismatchError in IE Edge
    const body = (this._method === 'GET' || this._method === 'HEAD') ? undefined : data;

    const credentials = this.withCredentials ? 'include' : 'omit';

    const request = new Request(this._url, {
      body,
      credentials,
      method: this._method,
      headers: this._requestHeaders,
    });

    return dispatchFetchEvent(request);
  }

  /**
   * Process response object
   *
   * @private
   * @param  {Response}      response Response object
   */
  async _processResponse(response) {
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

  /**
   * Assign property to self
   * @private
   * @param {string} name  property name
   * @param {any}    value property value
   */
  _setProperty(name, value) {
    // in IE & Safari, these property are internally read-only on native XHR instance
    // assign to patched XHR, as a trade-off
    Object.defineProperty(this, name, {
      value,
      writable: false,
      enumerable: true,
      configurable: true,
    });
  }

  /**
   * Dispatch XHR events
   * @private
   */
  _dispatchEvents() {
    EVENTS_LIST.forEach((type) => {
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
 *
 * @async
 * @param  {Response}     response     Response object
 * @param  {string}       responseType XHR responseType
 * @return {Promise<any>}
 */
async function parseResponse(response, responseType) {
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
        const parser = new DOMParser();
        return parser.parseFromString(text, getDocumentMIME(res));
    }
  } catch (e) {}

  return null;
}

/**
 * Get MIME from 'content-type' header
 * @param  {Response} res Response object
 * @return {string}
 */
function getDocumentMIME(res) {
  const contentType = res.headers.get('content-type');

  /* istanbul ignore if */
  if (!contentType) {
    return 'text/html';
  }

  // strip charset
  return contentType.replace(/;.*/, '');
}
