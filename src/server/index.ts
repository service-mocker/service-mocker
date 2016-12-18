import {
  ACTION,
  LEGACY_CLIENT_ID,
} from '../constants/';

export class Server {
  private _running = false;
  private _clients = new Set<string>([ LEGACY_CLIENT_ID ]);

  constructor() {
    this._start();
  }

  // temporary restore native context
  // for any use of `fetch` or `XMLHttpRequest`
  private _setNativeContext() {
    const globalContext: any = self;

    if (globalContext.fetch.mockerPatched) {
      const { fetch, XMLHttpRequest } = globalContext;

      globalContext._fetch = fetch;
      globalContext._XMLHttpRequest = XMLHttpRequest;
      globalContext.fetch = fetch.native;
      globalContext.XMLHttpRequest = XMLHttpRequest.native;
    }
  }

  // restore patched context
  private _restoreMockerContext() {
    const globalContext: any = self;

    if (globalContext._fetch) {
      const { _fetch, _XMLHttpRequest } = globalContext;
      globalContext.fetch = _fetch;
      globalContext.XMLHttpRequest = _XMLHttpRequest;
    }
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

    self.addEventListener('install', evt => {
      console.info('installed');

      evt.waitUntil(self.skipWaiting());
    });

    self.addEventListener('activate', evt => {
      console.info('activated');

      evt.waitUntil(self.clients.claim());
    });
  }

  private _hasClient(id) {
    return this._clients.has(id);
  }

  private _handleMessage() {
    self.addEventListener('message', evt => {
      const {
        data,
        source,
        ports,
      } = evt;

      console.log(evt);

      if (!data) {
        return;
      }

      switch (data.action) {
        case ACTION.PING:
          this._clients.add(source.id);

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
          return this._clients.delete(source.id);
      }
    });
  }

  private _router(evt) {
    const {
      request,
    } = evt;

    if (/api/.test(request.url)) {
      evt.respondWith(new Response('Hello new world!'));
    }
    // return Promise.all([...]);
  }

  private _filterRequest() {
    self.addEventListener('fetch', evt => {
      const {
        clientId,
      } = evt;

      console.log(evt);

      if (clientId && !this._hasClient(clientId)) {
        console.warn(`unknown client: ${clientId}`);
        return;
      }

      this._setNativeContext();
      evt.waitUntil(this._router(evt));
      this._restoreMockerContext();
    });
  }
}
