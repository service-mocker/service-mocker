import mime from 'mime-component';
import httpStatus from 'statuses';

import {
  debug,
  Defer,
} from '../utils/';

import { MockerRequest } from './request';

const responseLog = debug.scope('response');
const IS_IE_EDGE = /Edge/.test(navigator.userAgent);

export class MockerResponse {
  /**
   * Response headers
   *
   * @readonly
   * @type {Headers}
   */
  headers = new Headers({
    'X-Powered-By': 'ServiceMocker',
  });

  /**
   * Fetch event
   *
   * @private
   * @readonly
   * @type {FetchEvent}
   */
  _event = null;

  /**
   * Response body to be sent
   *
   * @private
   * @type {any}
   */
  _body = undefined;

  /**
   * Response status code
   *
   * @private
   * @type {number}
   */
  _statusCode = 200;

  /**
   * Internal defer object to resolve response
   *
   * @private
   * @readonly
   * @type {Defer}
   */
  _deferred = new Defer();

  /**
   * Constructs a mocker response object
   *
   * @param {FetchEvent} event Fetch event
   */
  constructor(event) {
    const {
      _deferred,
    } = this;

    this._event = event;

    // everything within service worker should be asynchronous
    event.respondWith(_deferred.promise);
  }

  /**
   * Sets the HTTP status for the response.
   *
   * @chainable
   * @param  {number} code Status code
   * @return {this}
   */
  status(code) {
    this._statusCode = code;

    return this;
  }

  /**
   * Sets the Content-Type HTTP header to the MIME type.
   * If the given MIME doesn't contain '/' character,
   * use `mime.lookup(type)` to obtain MIME type.
   *
   * @chainable
   * @param  {string} type MIME type
   * @return {this}
   */
  type(type) {
    const contentType = type.indexOf('/') === -1 ? mime.lookup(type) : type;

    this.headers.set('content-type', contentType);

    return this;
  }

  /**
   * Send a JSON response.
   *
   * @param {any} [body] Any JSON compatible type, including object, array, string, Boolean, or number.
   */
  json(body) {
    this._body = JSON.stringify(body);

    if (!this.headers.has('content-type')) {
      this.type('json');
    }

    this.end();
  }

  /**
   * Sends the HTTP response.
   *
   * @param {any} [body] Response body, one of Blob, ArrayBuffer, Object, or any primitive types
   */
  send(body) {
    // don't parse native Response objects
    if (body instanceof Response) {
      this._body = body;
      this.end();
      return;
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
          this.json(body);
          return;
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
   * @param {number} code Status code
   */
  sendStatus(code) {
    const body = httpStatus[code] || JSON.stringify(code);

    this.type('text').status(code).send(body);
  }

  /**
   * End the response processing and pass the response to `fetchEvent.respondWith()`.
   * Simply call this method will end the response WITHOUT any data,
   * if you want to respond with data, use `res.send()` and `res.json()`.
   */
  end() {
    // respond with body if it's a native Response object
    if (this._body instanceof Response) {
      this._deferred.resolve(this._body);
      return;
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

    const responseInit = {
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
   * @param {RequestInfo|MockerRequest} input Destination URL or a Request object or MockerRequest
   * @param {RequestInit=}              init  Fetch request init
   */
  async forward(input, init) {
    let request;

    if (input instanceof Request) {
      // forward native Request
      request = new Request(input, init);
    } else if (input instanceof MockerRequest) {
      // forward MockerRequest
      request = new Request(input._native, init);
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
/**
 * Concat new request info with given old request
 *
 * @param  {Request}          oldRequest Old Request object
 * @param  {RequestInfo}      input      New Request input
 * @param  {RequestInit}      [init={}]  New Request init
 * @return {Promise<Request>}
 */
async function concatRequest(oldRequest, input, init = {}) {
  const tempRequest = new Request(input, oldRequest);

  if (!init.body && oldRequest.method !== 'GET' && oldRequest.method !== 'HEAD') {
    init.body = await bodyParser(oldRequest);
  }

  return new Request(tempRequest, init);
}

/**
 * Parse request body
 * 1. If you're using github fetch polyfill, return the private member `_bodyInit`,
 * 2. Else parsing request body as blob.
 *
 * @param  {Request} request Request object to be parsed
 * @return {any}
 */
function bodyParser(request) {
  // handle github fetch polyfill
  /* istanbul ignore if */
  if (fetch.polyfill) {
    return request._bodyInit;
  }

  try {
    // always parse as blob
    return request.clone().blob();
  } catch (e) {
    /* istanbul ignore next */
    responseLog.warn('parsing request body failed, you may need to parse it manually', e);
  }
}

/* istanbul ignore next */
/**
 * Fetch with native `fetch`
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
 *
 * @param  {RequestInfo}       input
 * @param  {RequestInit}       [init]
 * @return {Promise<Response>}
 */
function nativeFetch(input, init) {
  const {
    fetch,
    XMLHttpRequest: XHR,
  } = self;

  // native fetch
  if (fetch.mockerPatched) {
    return fetch.native(input, init);
  }

  // fetch polyfills
  if (XHR && XHR.mockerPatched) {
    // restore native...
    self.XMLHttpRequest = XHR.native;
    // do a native fetch
    const promise = fetch(input, init);
    // replace with our fetch
    self.XMLHttpRequest = XHR;

    return promise;
  }

  return fetch(input, init);
}
