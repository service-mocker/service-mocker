import * as qs from 'qs';

import {
  extensify,
} from '../utils/';

export type Parameters = {
  [key: string]: any,
};

export type Query = {
  [key: string]: any,
};

// export or you'll get an error of 'using private'
export const ExtandableRequest = extensify(Request, '');

export interface IMockerRequest extends Request {
  readonly path: string;
  readonly query: Query;
  readonly params: Parameters;
}

export class MockerRequest extends ExtandableRequest implements IMockerRequest {
  readonly path: string;
  readonly query: Query;
  readonly params: Parameters;

  private _event: FetchEvent;

  constructor(event: FetchEvent, params: Parameters) {
    const { request } = event;

    super(request);

    const url = new URL(this.url, location.href);

    this._event = event;
    this.params = params;
    this.path = url.pathname;
    this.query = qs.parse(url.search.slice(1)); // remove leading '?'
  }
}
