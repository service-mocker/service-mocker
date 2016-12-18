/**
 * Wrap native XMLHttpRequest
 */

import {
  sleep,
} from '../../utils/';

import {
  LEGACY_MODE_TIMEOUT,
} from '../../constants/';

import { createEvent } from './create-event';
import { dispatchFetchEvent } from './dispatch-fetch-event';

export function patchXHR() {
  if ((XMLHttpRequest as any).mockerPatched) {
    return;
  }

  Object.keys(XMLHttpRequest).forEach(prop => {
    Object.defineProperty(
      MockerXHR, prop,
      Object.getOwnPropertyDescriptor(XMLHttpRequest, prop),
    );
  });

  mapPrototypeMethods(XMLHttpRequest.prototype, MockerXHR.prototype);
  (self as any).XMLHttpRequest = MockerXHR;
}

interface MockerXHR extends XMLHttpRequest {}

// we can not extends `XMLHttpRequest`
// class MockerXHR extends XMLHttpRequest {
class MockerXHR {
  static readonly mockerPatched = true;
  static readonly native = XMLHttpRequest;

  private _nativeXHR = new MockerXHR.native();
  private _requestHeaders = new Headers();
  private _eventHandlers = {
    readystatechange: [],
    loadstart: [],
    progress: [],
    load: [],
    loadend: [],
  };

  private _responseHeaders: Headers;
  private _responseMIME: string;
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

  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void {
    this._nativeXHR.addEventListener(type, listener, useCapture);

    const { _eventHandlers } = this;

    if (_eventHandlers.hasOwnProperty(type)) {
      _eventHandlers[type].push(listener);
    }
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    this._nativeXHR.removeEventListener(type, listener);

    const { _eventHandlers } = this;

    if (_eventHandlers.hasOwnProperty(type)) {
      _eventHandlers[type].some((fn, idx, all) => {
        return fn === listener && all.splice(idx, 1);
      });
    }
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

    Promise.race([
      this._mockFetch(data),
      sleep(LEGACY_MODE_TIMEOUT),
    ]).then(result => {
      if (!result) {
        this._nativeXHR.send(data);
      } else {
        this._processResponse(result);
      }
    });
  }

  private _mockFetch(data?: any): Promise<Response> {
    const body = (this._method === 'GET' || this._method === 'HEAD') ? undefined : data;
    const credentials = this.withCredentials ? 'include' : undefined;

    const request = new Request(this._url, {
      body,
      credentials,
      method: this._method,
      headers: this._requestHeaders,
    });

    return dispatchFetchEvent(request);
  }

  private async _processResponse(response: Response): Promise<void> {
    if (this._responseMIME) {
      response.headers.set('content-type', this._responseMIME);
    }

    const result = await parseResponse(response, this.responseType);

    this._responseHeaders = response.headers;

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

    this._invokeEvents();
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
  private _invokeEvents(): void {
    Object.keys(this._eventHandlers).forEach(type => {
      const handlers = this._getHandlers(type);

      if (!handlers.length) {
        return;
      }

      const event = createEvent(this, type);

      if (type !== 'readystatechange') {
        // progress event
        event.total = event.loaded = 1;
      }

      handlers.forEach(fn => fn(event));
    });
  }

  private _getHandlers(type: string): any[] {
    const handlers = [...this._eventHandlers[type]];
    const fn = this[`on${type}`];

    if (fn) {
      handlers.unshift(fn);
    }

    return handlers;
  }
}

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

// proxy all unset properties to `_nativeXHR`
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

  mapPrototypeMethods(Object.getPrototypeOf(source), target);
}
