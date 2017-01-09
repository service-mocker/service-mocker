import {
  ACTION,
  LEGACY_CLIENT_ID,
} from '../constants/';

const clients: any = {
  [LEGACY_CLIENT_ID]: true,
};

export const clientManager = {
  _initialized: false,

  has(id: string): boolean {
    return !!clients[id];
  },

  add(id: string): void {
    if (id) {
      clients[id] = true;
    }
  },

  delete(id: string): void {
    delete clients[id];
  },

  async getAvailable(): Promise<ServiceWorkerClient | Window> {
    if (self === self.window) {
      // legacy
      return window;
    }

    const clients = await self.clients.matchAll();

    for (let client of clients) {
      if (this.has(client.id)) {
        return client;
      }
    }

    throw new Error('no active client is found');
  },

  listenOnce(): void {
    if (this._initialized) {
      return;
    }

    this._initialized = true;

    self.addEventListener('message', async (evt: ExtendableMessageEvent) => {
      const {
        data,
        source,
        ports,
      } = evt;

      if (!data) {
        return;
      }

      const port = ports[0];

      // `evt.source` is null in old webkit, see:
      // https://bugs.chromium.org/p/chromium/issues/detail?id=403693
      const clientID = source ? source.id : await this._inferClientID();

      switch (data.action) {
        case ACTION.PING:
          this.add(clientID);
          return port.postMessage({
            action: ACTION.PONG,
          });

        case ACTION.REQUEST_CLAIM:
          await self.clients.claim();
          return port.postMessage({
            action: ACTION.ESTABLISHED,
          });

        case ACTION.DISCONNECT:
          return this.delete(clientID);
      }
    });
  },

  // infer the possible client ID
  async _inferClientID(): Promise<any> {
    // legacy mode
    if (!self.clients) {
      return;
    }

    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
    });

    for (let { id } of clients) {
      if (!this.has(id)) {
        return id;
      }
    }
  },
};
