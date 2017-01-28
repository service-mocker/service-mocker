import * as mime from 'mime-component';
import * as httpStatus from 'statuses';

import {
  debug,
  Defer,
} from '../utils/';

import { MockerRequest } from './request';

const responseLog = debug.scope('response');
const IS_IE_EDGE = /Edge/.test(navigator.userAgent);

export interface IMockerResponse {
  readonly headers: Headers;

  status(code: number): this;
  type(type: string): this;
  json(body?: any): void;
  send(body?: any): void;
  sendStatus(code: number): void;
  end(): void;
  forward(input: RequestInfo, init?: RequestInit): void;
}

export class MockerResponse implements IMockerResponse {
  readonly headers = new Headers({
    'X-Powered-By': 'ServiceMocker',
  });

  private _body: any;
  private _statusCode = 200;
  private _deferred = new Defer();

  constructor(private _event: FetchEvent) {
    const {
      _deferred,
    } = this;

    // everything within service worker should be asynchronous
    _event.respondWith(_deferred.promise);
  }

  /**
   * Sets the HTTP status for the response.
   *
   * @chainable
   * @param code Status code
   */
  status(code: number): this {
    this._statusCode = code;

    return this;
  }

  /**
   * Sets the Content-Type HTTP header to the MIME type.
   * If the given MIME doesn't contain '/' character,
   * use `mime.lookup(type)` to obtain MIME type.
   *
   * @chainable
   * @param type MIME type
   */
  type(type: string): this {
    const contentType = type.indexOf('/') === -1 ? mime.lookup(type) : type;

    this.headers.set('content-type', contentType);

    return this;
  }

  /**
   * Send a JSON response.
   *
   * @param body Any JSON compatible type, including object, array, string, Boolean, or number.
   */
  json(body?: any): void {
    this._body = JSON.stringify(body);

    if (!this.headers.has('content-type')) {
      this.type('json');
    }

    this.end();
  }

  /**
   * Sends the HTTP response.
   *
   * @param body Response body, one of Blob, ArrayBuffer, Object, or any primitive types
   */
  send(body?: any): void {
    // don't parse native Response objects
    if (body instanceof Response) {
      this._body = body;
      return this.end();
    }

    let contentType = 'text';

    switch (typeof body) {
      case 'string':
        // follow the express style
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

  /**
   * Set the response HTTP status code to statusCode and
   * send its status text representation as the response body.
   *
   * Equivalent to `res.status(code).send(statusText)`
   *
   * @param code Status code
   */
  sendStatus(code: number): void {
    const body = httpStatus[code] || JSON.stringify(code);

    this.type('text').status(code).send(body);
  }

  /**
   * End the response processing and pass the response to `fetchEvent.respondWith()`.
   * Simply call this method will end the response WITHOUT any data,
   * if you want to respond with data, use `res.send()` and `res.json()`.
   */
  end(): void {
    // respond with body if it's a native Response object
    if (this._body instanceof Response) {
      return this._deferred.resolve(this._body);
    }

    const { request } = this._event;

    let responseBody = this._body;

    // leave body empty for null body status
    if (httpStatus.empty[this._statusCode]) {
      /* istanbul ignore if */
      if (IS_IE_EDGE) {
        responseLog.warn('using null body status in IE Edge may raise a `TypeMismatchError` Error');
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
      statusText: httpStatus[this._statusCode] || JSON.stringify(this._statusCode),
    };

    const response = new Response(responseBody, responseInit);

    this._deferred.resolve(response);
  }

  /**
   * Forward the request to another destination.
   * The forwarded request will NOT be captured by service worker.
   *
   * @param input Destination URL or a Request object or MockerRequest
   * @param init Fetch request init
   */
  async forward(input: RequestInfo, init?: RequestInit): Promise<void>;
  async forward(input: MockerRequest, init?: RequestInit): Promise<void>;
  async forward(input: any, init?: RequestInit) {
    let request: Request;

    if (input instanceof Request) {
      // forward native Request
      request = new Request(input, init);
    } else if (input instanceof MockerRequest) {
      // forward MockerRequest
      request = new Request((input as any)._native, init);
    } else {
      // create new Request
      request = await concatRequest(this._event.request, input, init);
    }

    // fetch will somehow consume the body
    this._deferred.resolve(nativeFetch(request));
  }
}

/**
 * Concat new request info with given old request
 */
async function concatRequest(oldRequest: Request, input: RequestInfo, init: RequestInit = {}): Promise<Request> {
  const tempRequest = new Request(input, oldRequest);

  if (!init.body && tempRequest.method !== 'GET' && tempRequest.method !== 'HEAD') {
    init.body = await bodyParser(oldRequest);
  }

  return new Request(tempRequest, init);
}

/**
 * Parse request body
 *
 * 1. If you're using github fetch polyfill, return the private member `_bodyInit`,
 * 2. Else parsing request body as blob.
 */
function bodyParser(request: Request): any {
  // handle github fetch polyfill
  /* istanbul ignore if */
  if ((fetch as any).polyfill) {
    return (request as any)._bodyInit;
  }

  try {
    // always parse as blob
    return request.clone().blob();
  } catch (e) {
    /* istanbul ignore next */
    responseLog.warn('parsing request body failed, you may need to parse it manually', e);
  }
}

/**
 * Fetch with native `fetch`
 *
 * 1. If `fetch.mockerPatched` is found, it means you're running on
 *    legacy mode with fetch support, return with `fetch.native`.
 *
 * 2. Else if `XMLHttpRequest.mockerPatched` is found, you're possibly
 *    using a fetch polyfill, processing as the following:
 *    2.1. Reset `XMLHttpRequest` to native one `(patched)XMLHttpRequest.native`,
 *    2.2. Run fetch polyfill (with native XHR),
 *    2.3. Restore `XMLHttpRequest` to patched one,
 *    2.4. Return the fetch promise.
 *
 * 3. Or, you may be running in service worker context, return `fetch`.
 */
/* istanbul ignore next */
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
