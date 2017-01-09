import * as mime from 'mime-component';
import * as HttpStatus from 'http-status-codes';

import { debug } from '../utils/';

// null body statuses, see
// https://fetch.spec.whatwg.org/#statuses
const NULL_BODY_STATUS = [
  101,
  204,
  205,
  304,
];

const IS_IE_EDGE = /Edge/.test(navigator.userAgent);

export interface IMockerResponse {
  readonly headers: Headers;

  status(code: number): this;
  type(type: string): this;
  json(body?: any): void;
  send(body?: any): void;
  sendStatus(code: number): void;
  end(): void;
  proxy(input: RequestInfo, init?: RequestInit): void;
}

export class MockerResponse implements IMockerResponse {
  readonly headers = new Headers({
    'X-Powered-By': 'ServiceMocker',
  });

  private _body: any;
  private _statusCode = 200;

  constructor(private _event: FetchEvent) {}

  status(code: number): this {
    this._statusCode = code;

    return this;
  }

  type(type: string): this {
    const contentType = type.indexOf('/') === -1 ? mime.lookup(type) : type;

    this.headers.set('content-type', contentType);

    return this;
  }

  json(body?: any): void {
    this._body = JSON.stringify(body);

    if (!this.headers.has('content-type')) {
      this.type('json');
    }

    this.end();
  }

  send(body?: any): void {
    let contentType = 'text';

    switch (typeof body) {
      case 'string':
        this._body = body;
        contentType = 'html';
        break;

      case 'boolean':
      case 'number':
      case 'object':
        if (body instanceof Blob) {
          this._body = body;
          contentType = body.type || 'bin';
        } else if (body instanceof ArrayBuffer) {
          this._body = body;
          contentType = 'bin';
        } else {
          return this.json(body);
        }
        break;
    }

    if (!this.headers.has('content-type')) {
      this.type(contentType);
    }

    this.end();
  }

  sendStatus(code: number): void {
    this.type('text');
    this._statusCode = code;
    const body = this._getStatusText();

    this.send(body);
  }

  end(): void {
    const { request } = this._event;

    let responseBody = this._body;

    // leave body empty for null body status
    if (NULL_BODY_STATUS.indexOf(this._statusCode) > -1) {
      if (IS_IE_EDGE) {
        debug.scope('response').warn('using null body status in IE Edge may raise a `TypeMismatchError` Error');
      }

      responseBody = undefined;
    }

    // skip body for HEAD requests
    if (request.method === 'HEAD') {
      responseBody = undefined;
    }

    // set default contentType to 'text/plain', see
    // https://tools.ietf.org/html/rfc2045#section-5.2
    if (!this.headers.has('content-type')) {
      this.type('text');
    }

    const responseInit: ResponseInit = {
      headers: this.headers,
      status: this._statusCode,
      statusText: this._getStatusText(),
    };

    const response = new Response(responseBody, responseInit);

    this._event.respondWith(response);
  }

  proxy(input: RequestInfo, init: RequestInit = {}): void {
    const transmit = async () => {
      const { request } = this._event;

      let defaultBody: any;

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        const req = request.clone();
        const contentType = req.headers.get('content-type');

        if (contentType) {
          if (/form-data/.test(contentType)) {
            defaultBody = await req.formData();
          } else {
            defaultBody = await req.blob();
          }
        } else {
          defaultBody = await req.text();
        }
      }

      const options: RequestInit = {
        body: init.body || defaultBody,
        method: init.method || request.method,
        headers: init.headers || request.headers,
        // always using 'cors'
        mode: 'cors',
        credentials: 'include',
      };

      return nativeFetch(input, options);
    };

    this._event.respondWith(transmit());
  }

  private _getStatusText() {
    let statusText: string;

    try {
      statusText = HttpStatus.getStatusText(this._statusCode);
    } catch (e) {
      statusText = JSON.stringify(this._statusCode);
    }

    return statusText;
  }
}

/**
 * Fetch with native `fetch`
 *
 * 1. If `fetch.mockerPatched` is found, it means you're running on
 *    legacy mode with fetch support, return with `fetch.native`.
 *
 * 2. Else if `XMLHttpRequest.mockerPatched` is found, you're possibly
 *    using a fetch polyfill, processing as following:
 *    2.1. Reset `XMLHttpRequest` to native one `(patched)XMLHttpRequest.native`,
 *    2.2. Run fetch polyfill (with native XHR),
 *    2.3. Restore `XMLHttpRequest` to patched one,
 *    2.4. Return the fetch promise.
 *
 * 3. Or, you may be running in service worker context, return `fetch`.
 */
function nativeFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const globalContext: any = self;

  const {
    fetch,
    XMLHttpRequest: XHR,
  } = globalContext;

  // native fetch
  if (fetch.mockerPatched) {
    return fetch.native(input, init);
  }

  // fetch polyfills
  if (XHR && XHR.mockerPatched) {
    // restore native...
    globalContext.XMLHttpRequest = XHR.native;
    // do a native fetch
    const promise = fetch(input, init);
    // replace with our fetch
    globalContext.XMLHttpRequest = XHR;

    return promise;
  }

  return fetch(input, init);
}
