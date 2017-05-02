import qs from 'qs';

import {
  debug,
  extensify,
} from '../utils/';

const requestLog = debug.scope('request');

// convert native `Request` to extendable
// export or you'll get an error of 'using private'
/* istanbul ignore next: polyfill is legacy browsers only */
export const ExtandableRequest = fetch.polyfill ? Request : extensify(Request);

export class MockerRequest extends ExtandableRequest {
  /**
   * Literally equivalent to `router.baseURL` property of current router.
   *
   * @readonly
   * @type {string}
   */
  baseURL = undefined;

  /**
   * Contains the path part of the current request.
   *
   * @readonly
   * @type {string}
   */
  path = undefined;

  /**
   * Contains properties mapped the route parameters.
   *
   * @readonly
   * @type {object}
   */
  params = null;

  /**
   * Contains a property for each query string parameter from the request.
   *
   * @readonly
   * @type {object}
   */
  query = null;

  /**
   * Fetch event
   *
   * @private
   * @readonly
   * @type {FetchEvent}
   */
  _event = null;

  /**
   * Route rule object
   *
   * @private
   * @readonly
   * @type {RouteRule}
   */
  _route = null;

  /**
   * Constructs a mocker request object
   *
   * @param {FetchEvent} event Fetch event
   * @param {RouteRule}  route Router rule object
   */
  constructor(event, route) {
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
    const path = base.pathname === '/'
                 ? requestURL.pathname
                 : requestURL.pathname.replace(base.pathname, '');

    const matches = regex.exec(path);
    const params = {};

    // skip full matched string at [0]
    const max = matches.length;
    for (let i = 1; i < max; i++) {
      const { name } = keys[i - 1];
      params[name] = decodeParam(matches[i]);
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

/**
 * Decode request parameter
 *
 * @param  {string} value Parameter value
 * @return {string}
 */
function decodeParam(value) {
  try {
    return decodeURIComponent(value);
  } catch (err) {
    requestLog.error(`decode param: ${value} failed`, err);

    return null;
  }
}
