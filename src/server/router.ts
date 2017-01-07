import * as pathToRegExp from 'path-to-regexp';

import {
  Parameters,
  MockerRequest,
} from './request';

import {
  MockerResponse,
} from './response';

import { clientManager } from './client-manager';

export type RoutePath = string;
export type RouteCallback = (request: MockerRequest, response: MockerResponse) => void;

export interface IMockerRouter {
  all(path: RoutePath, callback: RouteCallback): this;
  all(path: RoutePath, callback: any): this;

  get(path: RoutePath, callback: RouteCallback): this;
  get(path: RoutePath, callback: any): this;

  post(path: RoutePath, callback: RouteCallback): this;
  post(path: RoutePath, callback: any): this;
}

type RouteMethod = 'GET' | 'POST' | 'ALL';

type RouteRule = {
  method: RouteMethod,
  path: RoutePath,
  callback: RouteCallback,
  regex: pathToRegExp.PathRegExp,
  keys: pathToRegExp.Key[],
  isAll: boolean,
};

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

  all(path: RoutePath, callback: RouteCallback): this;
  all(path: RoutePath, callback: any): this;
  all(path, callback) {
    return this._add('ALL', path, callback);
  }

  get(path: RoutePath, callback: RouteCallback): this;
  get(path: RoutePath, callback: any): this;
  get(path, callback) {
    return this._add('GET', path, callback);
  }

  post(path: RoutePath, callback: RouteCallback): this;
  post(path: RoutePath, callback: any): this;
  post(path, callback) {
    return this._add('POST', path, callback);
  }

  private _add(method: RouteMethod, path: RoutePath, callback: any): this {
    const regex = pathToRegExp(path);

    let cb: RouteCallback;

    if (typeof callback === 'function') {
      cb = callback;
    } else {
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

    const url = new URL(request.url, location.href);

    for (let rule of this._rules) {
      const {
        method,
        regex,
      } = rule;

      const matched = regex.test(url.pathname);

      if (matched && (request.method === method || rule.isAll)) {
        return this._dispatch(event, rule);
      }
    }
  }

  private _dispatch(event: FetchEvent, rule: RouteRule): void {
    const { callback } = rule;

    const params = this._parseParams(event.request.url, rule);

    const request = new MockerRequest(event, params);
    const response = new MockerResponse(event);

    callback.call(event, request, response);
  }

  private _parseParams(requestURL: string, rule: RouteRule): Parameters {
    const {
      regex,
      keys,
    } = rule;

    const params: Parameters = {};
    const matches = regex.exec(requestURL);

    if (matches) {
      // skip full string at [0]
      const max = matches.length;
      for (let i = 1; i < max; i++) {
        const { name } = keys[i];
        params[name] = matches[i];
      }
    }

    return params;
  }
}
