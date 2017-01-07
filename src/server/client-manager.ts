import {
  ACTION,
  LEGACY_CLIENT_ID,
} from '../constants/';

import {
  debug,
} from '../utils/';

const cmLog = debug.scope('cm');

const clients: any = {
  [LEGACY_CLIENT_ID]: true,
};

export const clientManager = {
  has(id: string): boolean {
    return !!clients[id];
  },

  add(id: string): void {
    clients[id] = true;
  },

  delete(id: string): void {
    delete clients[id];
  },

  listen(): void {
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
          cmLog.info(`client connected in: ${clientId}`);
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
          cmLog.info(`client disconnected: ${clientId}`);
          return this.delete(clientId);
      }
    });
  },
};
