import * as mime from 'mime-component';
import * as HttpStatus from 'http-status-codes';

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

    if (!this.headers.get('content-type')) {
      this.type('json');
    }

    this.end();
  }

  send(body?: any): void {
    switch (typeof body) {
      case 'string':
        this._body = body;
        if (!this.headers.get('content-type')) {
          this.type('html');
        }
        return this.end();

      case 'boolean':
      case 'number':
      case 'object':
        if (body instanceof Blob) {
          // blob's content type will be set by `Response`
          this._body = body;
          return this.end();
        }
        return this.json(body);
    }
  }

  sendStatus(code: number): void {
    this.type('text');
    this._statusCode = code;
    this._body = HttpStatus[code] || JSON.stringify(code);

    this.end();
  }

  end(): void {
    const { request } = this._event;

    // skip body for HEAD requests
    const responseBody = request.method === 'HEAD' ? undefined : this._body;

    let statusText: string;

    try {
      statusText = HttpStatus.getStatusText(this._statusCode);
    } catch (e) {
      statusText = 'OK';
    }

    const responseInit: ResponseInit = {
      statusText,
      headers: this.headers,
      status: this._statusCode,
    };

    const response = new Response(responseBody, responseInit);

    this._event.respondWith(response);
  }

  proxy(input: RequestInfo, init: RequestInit = {}): void {
    this._event.respondWith(async () => {
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
    });
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
