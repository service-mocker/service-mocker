import pathToRegExp from 'path-to-regexp';

import {
  debug,
} from '../utils/';

import { MockerRequest } from './request';
import { MockerResponse } from './response';

const routerLog = debug.scope('router');

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

export class MockerRouter {
  /**
   * save all routers for lazy evaluations
   *
   * @static
   * @type {Array<MockerRouter>}
   */
  static routers = [];

  /**
   * A parsed base URL
   *
   * @readonly
   * @type {string}
   */
  baseURL = undefined;

  /**
   * The origin which this router belongs to
   *
   * @private
   * @type {string}
   */
  _origin = undefined;

  /**
   * The base path of this router
   *
   * @private
   * @type {string}
   */
  _basePath = undefined;

  /**
   * A collection of all routings
   *
   * @private
   * @type {Array<RouteRule>}
   */
  _rules = [];

  /**
   * A collection of all middleware
   *
   * @private
   * @type {Array<MiddlewareFn>}
   */
  _middleware = [];

  /**
   * Constructs a new router object
   *
   * @param {string} [baseURL='/'] The base url of this router
   * @param {Array<MiddlewareFn>} [middleware=[]] Middleware that are attached to this router
   */
  constructor(baseURL = '/', middleware = []) {
    MockerRouter.routers.push(this);

    this._middleware.push(...middleware);

    // resolve url based on current origin for relative path
    // `location.origin` is not supported in IE
    const url = new URL(baseURL, location.href);

    this._origin = url.origin;
    this._basePath = url.pathname.replace(/\/$/, ''); // remove trailing slash

    this.baseURL = this._origin + this._basePath;
  }

  /**
   * Create a new router with the given path as scope
   *
   * @param {string}        [path]
   * @return {MockerRouter}
   */
  scope(path) {
    // in case of falsy values
    if (!path) {
      path = '/';
    }

    if (path[0] !== '/') {
      throw new TypeError(`the scope of router should start with "/", got ${path}`);
    }

    return new MockerRouter(
      this.baseURL + path,
      this._middleware, // inherit middleware from upstream
    );
  }

  /* istanbul ignore next */
  base(path) {
    routerLog.warn('`router.base()` is deprecated, use `router.scope()` instead.');

    return this.scope(path);
  }

  /**
   * Create a scoped router with the given path as
   * route path for every routing method.
   *
   * @param  {string|RegExp} path Routing's path
   * @return {SubRouter}
   */
  route(path) {
    return new SubRouter(this, path);
  }

  /**
   * Attach middleware to current router
   *
   * @param  {MiddlewareFn} fn Middleware function
   * @return {this}
   */
  use(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('Middleware is expected to be a function');
    }

    this._middleware.push(fn);

    return this;
  }

  /**
   * Register a new routing to current router
   *
   * @private
   * @param  {string}       method   HTTP method
   * @param  {RoutePath}    path     Routing path rule
   * @param  {function|any} callback Routing callback handler
   * @return {this}
   */
  _register(method, path, callback) {
    method = method.toUpperCase();

    const regex = pathToRegExp(path);

    let cb;

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
   * @private
   * @param {FetchEvent} event Fetch event
   * @return {boolean}
   */
  _match(event) {
    const {
      request,
    } = event;

    // `request.url` maybe relative in legacy mode
    const url = new URL(request.url, location.href);

    if (url.origin !== this._origin) {
      return false;
    }

    // strip router's base path
    const re = new RegExp(`^${this._basePath}`);
    const path = url.pathname.replace(re, '');

    for (let rule of this._rules) {
      const {
        method,
        regex,
        callback,
      } = rule;

      if (regex.test(path) && (request.method === method || rule.isAll)) {
        const request = new MockerRequest(event, rule);
        const response = new MockerResponse(event);

        // apply middleware
        this._middleware.forEach((fn) => {
          fn.call(event, request, response);
        });

        callback.call(event, request, response);
        return true;
      }
    }

    return false;
  }
}

export class SubRouter {
  /**
   * Router object
   *
   * @private
   * @type {MockerRouter}
   */
  _router = null;

  /**
   * Routing path rule
   *
   * @private
   * @type {string|RegExp}
   */
  _path = undefined;

  /**
   * Constructs a sub router
   * @param {MockerRouter}  router Parent router object
   * @param {string|RegExp} path   Routing path
   */
  constructor(router, path) {
    this._router = router;
    this._path = path;
  }

  /**
   * Register a new scoped routing
   *
   * @private
   * @param {string}       method   HTTP method
   * @param {function|any} callback Routing callback handler
   * @return {this}
   */
  _register(method, callback) {
    this._router._register(method, this._path, callback);

    return this;
  }
}

const allMethods = [
  'all',
  ...methods,
];

// assign all methods to router
allMethods.forEach((method) => {
  MockerRouter.prototype[method] = function (path, callback) {
    return this._register(method, path, callback);
  };
});

allMethods.forEach((method) => {
  SubRouter.prototype[method] = function (callback) {
    return this._register(method, callback);
  };
});
