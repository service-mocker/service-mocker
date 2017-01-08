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
    clients[id] = true;
  },

  delete(id: string): void {
    delete clients[id];
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
      const clientId = source.id;

      switch (data.action) {
        case ACTION.PING:
          this.add(clientId);
          return port.postMessage({
            action: ACTION.PONG,
          });

        case ACTION.REQUEST_CLAIM:
          await self.clients.claim();
          return port.postMessage({
            action: ACTION.ESTABLISHED,
          });

        case ACTION.DISCONNECT:
          return this.delete(clientId);
      }
    });
  },
};
