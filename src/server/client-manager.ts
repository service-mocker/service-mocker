import {
  ACTION,
  LEGACY_CLIENT_ID,
} from '../constants/';

import {
  sendMessageRequest,
} from '../utils/';

const clients: any = {
  [LEGACY_CLIENT_ID]: true,
};

/* istanbul ignore next: unable to report coverage from sw context */
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

  // manage client connections
  async connect(evt: ExtendableMessageEvent) {
    const {
      data,
      source,
      ports,
    } = evt;

    if (!data || !ports.length) {
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
  },

  // reconnect clients after resumed from termination
  async reconnect(client: ServiceWorkerClient): Promise<void> {
    try {
      await sendMessageRequest(client, {
        action: ACTION.RECONNECT,
      });

      this.add(client.id);
    } catch (e) {
      this.delete(client.id);
    }
  },

  // infer the possible client ID
  async _inferClientID(): Promise<any> {
    // legacy mode
    if (!self.clients) {
      return;
    }

    // client maybe uncontrolled
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
