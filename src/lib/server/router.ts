import * as pathToRegExp from 'path-to-regexp';

import { MockerRequest } from './request';

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
  baseURL: string,
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

  readonly baseURL: string;

  private _origin: string;
  private _basePath: string;
  private _rules: Array<RouteRule> = [];

  constructor(baseURL: string = '/') {
    MockerRouter.routers.push(this);

    // resolve url based on current origin for relative path
    // `location.origin` is not supported in IE
    const url = new URL(baseURL, location.href);

    this._origin = url.origin;
    this._basePath = url.pathname.replace(/\/$/, ''); // remove trailing slash

    this.baseURL = this._origin + this._basePath;
  }

  /**
   * Get a new router with the given base url,
   * relative `baseURL` will be resolved to current origin
   */
  base(baseURL: string = this.baseURL): MockerRouter {
    const url = new URL(baseURL, this._origin);

    return new MockerRouter(url.href);
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
      baseURL: this.baseURL,
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

    // `request.url` maybe relative in legacy mode
    const url = new URL(request.url, location.href);

    if (url.origin !== this._origin) {
      return;
    }

    // strip router's base path
    const path = url.pathname.replace(this._basePath, '');

    for (let rule of this._rules) {
      const {
        method,
        regex,
        callback,
      } = rule;

      if (regex.test(path) && (request.method === method || rule.isAll)) {
        const request = new MockerRequest(event, rule);
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
