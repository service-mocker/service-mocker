import {
  sendMessageRequest,
} from '../utils/';

import {
  ACTION,
} from '../constants/';

export interface IMockerStorage {
  get(key: string): Promise<any>;
  set<T>(key: string, value: T): Promise<T>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MockerStorage implements IMockerStorage {
  async get(key: string): Promise<any> {
    return this._askClient({
      key,
      action: ACTION.GET_STORAGE,
    });
  }

  async set<T>(key: string, value: T): Promise<T> {
    return this._askClient({
      key, value,
      action: ACTION.SET_STORAGE,
    });
  }

  async remove(key: string): Promise<void> {
    return this._askClient({
      key,
      action: ACTION.REMOVE_STORAGE,
    });
  }

  async clear(): Promise<void> {
    return this._askClient({
      action: ACTION.CLEAR_STORAGE,
    });
  }

  private async _askClient(message: any) {
    const clients = await self.clients.matchAll();

    if (clients.length === 0) {
      throw new Error('storage service requires active clients');
    }

    const data = await sendMessageRequest(clients[0], message);

    return data.result;
  }
}
