import * as qs from 'qs';

import {
  extensify,
} from '../utils/';

export type RequestParameter = {
  [key: string]: any,
};

export type RequestQuery = {
  [key: string]: any,
};

// convert native `Request` to extendable
// export or you'll get an error of 'using private'
export const ExtandableRequest = (fetch as any).polyfill ? Request : extensify(Request);

export interface IMockerRequest extends Request {
  readonly path: string;
  readonly query: RequestQuery;
  readonly params: RequestParameter;
}

export class MockerRequest extends ExtandableRequest implements IMockerRequest {
  readonly path: string;
  readonly query: RequestQuery;
  readonly params: RequestParameter;

  private _event: FetchEvent;

  constructor(event: FetchEvent, params: RequestParameter) {
    const { request } = event;

    super(request);

    const url = new URL(this.url, location.href);

    this._event = event;
    this.params = params;
    this.path = url.pathname;
    this.query = qs.parse(url.search.slice(1)); // remove leading '?'

    // overwrite relative URL from fetch polyfill
    if (this.url !== url.href) {
      Object.defineProperty(this, 'url', {
        value: url.href,
        writable: false,
        enumerable: true,
        configurable: true,
      });
    }
  }

  clone() {
    return new MockerRequest(this._event, this.params);
  }
}
