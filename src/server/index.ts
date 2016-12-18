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

  public fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const globalContext: any = self;
    const nativeFetch = globalContext.fetch.native || globalContext.fetch;

    return nativeFetch(input, init);
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
      evt.respondWith(new Promise((res) => {
        setTimeout(() => {
          res(new Response('Hello new world!'));
        }, 3000);
      }));
    }

    // do some fetches with this.fetch(...)
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

      evt.waitUntil(this._router(evt));
    });
  }
}
