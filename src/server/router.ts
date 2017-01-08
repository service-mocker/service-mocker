import * as pathToRegExp from 'path-to-regexp';

import {
  RequestParameter,
  MockerRequest,
} from './request';

import {
  MockerResponse,
} from './response';

import { clientManager } from './client-manager';

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

export interface IMockerRouter {
  all: IRouterMatcher<this>;
  get: IRouterMatcher<this>;
  post: IRouterMatcher<this>;
  put: IRouterMatcher<this>;
  head: IRouterMatcher<this>;
  delete: IRouterMatcher<this>;
  options: IRouterMatcher<this>;
}

type RouteRule = {
  method: string,
  isAll: boolean,
  path: RoutePath,
  callback: RouteCallback,
  regex: pathToRegExp.PathRegExp,
  keys: pathToRegExp.Key[],
};

// merge interface to pass type checks
export interface MockerRouter extends IMockerRouter {}

export class MockerRouter implements IMockerRouter {
  private _rules: Array<RouteRule> = [];

  constructor() {
    self.addEventListener('fetch', (event: FetchEvent) => {
      const {
        client, // old spec
        clientId,
      } = event;

      const id = clientId || (client && client.id);

      if (clientManager.has(id)) {
        this._match(event);
      }
    });
  }

  protected _add(method: string, path: RoutePath, callback: any): this {
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

  private _match(event: FetchEvent): void {
    const {
      request,
    } = event;

    const { pathname } = new URL(request.url, location.href);

    for (let rule of this._rules) {
      const {
        method,
        regex,
        keys,
        callback,
      } = rule;

      const matches = regex.exec(pathname);

      if (matches && (request.method === method || rule.isAll)) {
        const params: RequestParameter = {};

        // skip full string at [0]
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
    return this._add(type.toUpperCase(), path, callback);
  };
});
