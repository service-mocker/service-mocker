import * as qs from 'qs';

import {
  extensify,
} from '../utils/';

// convert native `Request` to extendable
// export or you'll get an error of 'using private'
/* istanbul ignore next: polyfill is legacy browsers only */
export const ExtandableRequest = (fetch as any).polyfill ? Request : extensify(Request);

export interface IMockerRequest extends Request {
  readonly path: string;
  readonly baseURL: string;
  readonly query: any;
  readonly params: any;
}

export class MockerRequest extends ExtandableRequest implements IMockerRequest {
  readonly path: string;
  readonly baseURL: string;
  readonly query: any;
  readonly params: any;

  private _event: FetchEvent;
  private _route: any;

  constructor(event: FetchEvent, route: any) {
    const { request } = event;
    const {
      regex,
      keys,
      baseURL,
    } = route;

    // avoid polluting original request
    super(request.clone());

    const base = new URL(baseURL);
    const requestURL = new URL(request.url, location.href);
    const path = base.pathname === '/' ?
                 requestURL.pathname :
                 requestURL.pathname.replace(base.pathname, '');

    const matches = regex.exec(path);
    const params = {};

    // skip full matched string at [0]
    const max = matches.length;
    for (let i = 1; i < max; i++) {
      const { name } = keys[i - 1];
      params[name] = matches[i];
    }

    this._event = event;
    this._route = route;

    this.path = path;
    this.params = params;
    this.baseURL = baseURL;
    this.query = qs.parse(requestURL.search.slice(1)); // remove leading '?'

    // overwrite relative URL from fetch polyfill
    /* istanbul ignore if: legacy browsers only */
    if (this.url !== requestURL.href) {
      Object.defineProperty(this, 'url', {
        value: requestURL.href,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
  }

  clone() {
    return new MockerRequest(this._event, this._route);
  }
}
