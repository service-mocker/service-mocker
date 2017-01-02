import {
  ACTION,
  LEGACY_CLIENT_ID,
} from '../constants/';

import {
  debug,
} from '../utils/';

const serverLog = debug.scope('server');

// todo: createServer & IMockerServer
export function createServer(): Server {
  return new Server();
}

export class Server {
  private _running = false;
  private _clients: any = {
    [LEGACY_CLIENT_ID]: true,
  };

  constructor() {
    this._start();
  }

  /**
   * Fetch with native `fetch`
   *
   * 1. If `fetch.mockerPatched` is found, it means you're running on
   *    legacy mode with fetch support, return with `fetch.native`.
   *
   * 2. Else if `XMLHttpRequest.mockerPatched` is found, you're possibly
   *    using a fetch polyfill, processing as following:
   *    2.1. Reset `XMLHttpRequest` to native one `(patched)XMLHttpRequest.native`,
   *    2.2. Run fetch polyfill (with native XHR),
   *    2.3. Restore `XMLHttpRequest` to patched one,
   *    2.4. Return the fetch promise.
   *
   * 3. Or, you may be running in service worker context, return `fetch`.
   */
  async fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    this._detachFetchWarning();

    const globalContext: any = self;

    const {
      fetch,
      XMLHttpRequest: XHR,
    } = globalContext;

    // native fetch
    if (fetch.mockerPatched) {
      return fetch.native(input, init);
    }

    // fetch polyfills
    if (XHR && XHR.mockerPatched) {
      globalContext.XMLHttpRequest = XHR.native;
      const promise = fetch(input, init);
      globalContext.XMLHttpRequest = XHR;

      return promise;
    }

    return fetch(input, init);
  }

  private _isLegacyMode() {
    return self === self.window;
  }

  private _fetchWithWarning(input: RequestInfo, init?: RequestInit): Promise<Response> {
    serverLog.warn('invoking `fetch` directly is considered potentially dangerous, please use `server#fetch` instead');

    return this.fetch(input, init);
  }

  private _attachFetchWarning() {
    if (!this._isLegacyMode()) {
      return;
    }

    const originalFetch: any = self.fetch;

    const tempFetch = this._fetchWithWarning.bind(this);

    tempFetch.origin = originalFetch;

    self.fetch = tempFetch;
  }

  private _detachFetchWarning() {
    if (!this._isLegacyMode()) {
      return;
    }

    const originalFetch = (self.fetch as any).origin;

    if (!originalFetch) {
      return;
    }

    self.fetch = originalFetch;
  }

  private _hasClient(id) {
    return !!this._clients[id];
  }

  private _addClient(id) {
    this._clients[id] = true;
  }

  private _deleteClient(id) {
    delete this._clients[id];
  }

  private _start() {
    if (this._running) {
      return;
    }

    Object.defineProperty(this, '_running', {
      value: true,
    });

    this._handleMessage();
    this._filterRequest();

    // legacy browsers
    if (self === self.window) {
      return;
    }

    self.addEventListener('install', (evt: InstallEvent) => {
      console.info('installed');

      evt.waitUntil(self.skipWaiting());
    });

    self.addEventListener('activate', (evt: ExtendableEvent) => {
      console.info('activated');

      evt.waitUntil(self.clients.claim());
    });
  }

  private _handleMessage() {
    self.addEventListener('message', (evt: ExtendableMessageEvent) => {
      const {
        data,
        source,
        ports,
      } = evt;

      console.log(evt, data);

      if (!data) {
        return;
      }

      switch (data.action) {
        case ACTION.PING:
          this._addClient(source.id);

          return ports[0].postMessage({
            action: ACTION.PONG,
          });

        case ACTION.REQUEST_CLAIM:
          return self.clients.claim()
            .then(() => {
              ports[0].postMessage({
                action: ACTION.ESTABLISHED,
              });
            });

        case ACTION.DISCONNECT:
          return this._deleteClient(source.id);
      }
    });
  }

  private _filterRequest() {
    self.addEventListener('fetch', (evt: any) => {
      const {
        clientId,
        request,
      } = evt;

      if (clientId && !this._hasClient(clientId)) {
        console.warn(`unknown client: ${clientId}`);
        return;
      }

      this._attachFetchWarning();

      if (/api/.test(request.url)) {
        evt.respondWith(new Response('Hello new world!'));
        // evt.respondWith(fetch('api'));
      }

      if (/jsondata/.test(request.url)) {
        // do some fetches with this.fetch(...)
        evt.respondWith(this.fetch('/legacy/data.json'));
      }

      this._detachFetchWarning();

      if (evt.isLegacy) {
        evt.end();
      }
    });
  }
}
