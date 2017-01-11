import * as pathToRegExp from 'path-to-regexp';

import {
  RequestParameter,
  MockerRequest,
} from './request';

import {
  MockerResponse,
} from './response';

// bacic HTTP request methods in fetch standard, see
// https://fetch.spec.whatwg.org/#concept-method
const methods = [
  'get',
  'post',
  'put',
  'head',
  'delete',
  'options',
];

export type RoutePath = string | RegExp;
export type RouteCallback = (request: MockerRequest, response: MockerResponse) => void;

export interface IRouterMatcher<T> {
  (path: RoutePath, callback: RouteCallback): T;
  (path: RoutePath, callback: any): T;
}

/* tslint:disable member-ordering */
export interface IMockerRouter {
  readonly baseURL: string;
  base(baseURL: string): IMockerRouter;

  // routings
  all: IRouterMatcher<this>;
  get: IRouterMatcher<this>;
  post: IRouterMatcher<this>;
  put: IRouterMatcher<this>;
  head: IRouterMatcher<this>;
  delete: IRouterMatcher<this>;
  options: IRouterMatcher<this>;
}
/* tslint:enable member-ordering */

type RouteRule = {
  method: string,
  isAll: boolean,
  path: RoutePath,
  callback: RouteCallback,
  regex: pathToRegExp.PathRegExp,
  keys: pathToRegExp.Key[],
};

// merge interface to pass type checks (lacking routing methods)
export interface MockerRouter extends IMockerRouter {}

export class MockerRouter implements IMockerRouter {
  // save all routers for lazy evaluations
  static routers: Array<MockerRouter> = [];

  private _rules: Array<RouteRule> = [];

  constructor(readonly baseURL: string = location.origin) {
    MockerRouter.routers.push(this);
  }

  /**
   * Get a new router with the given base url
   */
  base(baseURL: string = this.baseURL): MockerRouter {
    const url = new URL(baseURL);

    return new MockerRouter(url.origin);
  }

  /**
   * Add new routing to current router
   *
   * @param method HTTP method
   * @param path Routing path rule
   * @param callback Routing callback
   */
  add(method: string, path: RoutePath, callback: any): this {
    method = method.toUpperCase();

    const regex = pathToRegExp(path);

    let cb: RouteCallback;

    if (typeof callback === 'function') {
      cb = callback;
    } else {
      // shorthand method
      cb = (_request, response) => {
        response.send(callback);
      };
    }

    this._rules.push({
      method, path, regex,
      callback: cb,
      keys: regex.keys,
      isAll: method === 'ALL',
    });

    return this;
  }

  /**
   * Match the proper routing
   *
   * @param event Fetch event
   */
  match(event: FetchEvent): void {
    const {
      request,
    } = event;

    const url = new URL(request.url, location.href);

    if (url.origin !== this.baseURL) {
      return;
    }

    for (let rule of this._rules) {
      const {
        method,
        regex,
        keys,
        callback,
      } = rule;

      const matches = regex.exec(url.pathname);

      if (matches && (request.method === method || rule.isAll)) {
        const params: RequestParameter = {};

        // skip full matched string at [0]
        const max = matches.length;
        for (let i = 1; i < max; i++) {
          const { name } = keys[i - 1];
          params[name] = matches[i];
        }

        const request = new MockerRequest(event, params);
        const response = new MockerResponse(event);

        return callback.call(event, request, response);
      }
    }
  }
}

// assign all methods
[
  'all',
  ...methods,
].forEach(type => {
  MockerRouter.prototype[type] = function (path, callback) {
    return this.add(type, path, callback);
  };
});
