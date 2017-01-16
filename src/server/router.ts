import * as pathToRegExp from 'path-to-regexp';

import { MockerRequest } from './request';
import { MockerResponse } from './response';

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
  /**
   * Register a routing
   *
   * @param path An express style route path.
   * @param callback A function that will be invoked with `request` and `response`,
   *                 if the second argument is provided with a non-function value,
   *                 then the value will be regarded as response body.
   */
  (path: RoutePath, callback: RouteCallback): T;
  /**
   * Register a routing
   *
   * @param path An express style route path.
   * @param responseBody The response body to be sent.
   */
  (path: RoutePath, responseBody: any): T;
}

export interface IScopedRouterMatcher<T> {
  /**
   * Register a routing to current scope
   *
   * @param callback A function that will be invoked with `request` and `response`,
   *                 if the second argument is provided with a non-function value,
   *                 then the value will be regarded as response body.
   */
  (callback: RouteCallback): T;
  /**
   * Register a routing to current scope
   *
   * @param responseBody The response body to be sent.
   */
  (responseBody: any): T;
}

/* tslint:disable member-ordering */
export interface IMockerRouter {
  readonly baseURL: string;
  base(baseURL: string): IMockerRouter;
  route(path: RoutePath): IScopedRouter;

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

export interface IScopedRouter {
  // routings
  all: IScopedRouterMatcher<this>;
  get: IScopedRouterMatcher<this>;
  post: IScopedRouterMatcher<this>;
  put: IScopedRouterMatcher<this>;
  head: IScopedRouterMatcher<this>;
  delete: IScopedRouterMatcher<this>;
  options: IScopedRouterMatcher<this>;
}

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
   * Create a new router with the given baseURL,
   * relative `baseURL` will be resolved to current origin
   */
  base(baseURL: string = this.baseURL): MockerRouter {
    const url = new URL(baseURL, this._origin);

    return new MockerRouter(url.href);
  }

  /**
   * Create a scoped router with the given path as
   * route path for every routing method.
   */
  route(path: RoutePath): ScopedRouter {
    return new ScopedRouter(this, path);
  }

  /**
   * Register a new routing to current router
   *
   * @param method HTTP method
   * @param path Routing path rule
   * @param callback Routing callback handler
   */
  register(method: string, path: RoutePath, callback: any): this {
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
      method,
      path,
      regex,
      callback: cb,
      keys: regex.keys,
      baseURL: this.baseURL,
      isAll: method === 'ALL',
    });

    return this;
  }

  /**
   * Match the proper routing, return `true` if rule matched
   *
   * @param event Fetch event
   */
  match(event: FetchEvent): boolean {
    const {
      request,
    } = event;

    // `request.url` maybe relative in legacy mode
    const url = new URL(request.url, location.href);

    if (url.origin !== this._origin) {
      return false;
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

        callback.call(event, request, response);
        return true;
      }
    }

    return false;
  }
}

export interface ScopedRouter extends IScopedRouter {}

export class ScopedRouter implements IScopedRouter {
  constructor(
    private _router: MockerRouter,
    private _path: RoutePath,
  ) {}

  /**
   * Register a new scoped routing
   * @param method HTTP method
   * @param callback Routing callback handler
   */
  register(method: string, callback: any) {
    // convert to 'any' type to access private method
    this._router.register(method, this._path, callback);

    return this;
  }
}

const allMethods = [
  'all',
  ...methods,
];

// assign all methods to router
allMethods.forEach(method => {
  MockerRouter.prototype[method] = function(path, callback) {
    return this.register(method, path, callback);
  };
});

allMethods.forEach(method => {
  ScopedRouter.prototype[method] = function(callback) {
    return this.register(method, callback);
  };
});
