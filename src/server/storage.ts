import {
  sendMessageRequest,
} from '../utils/';

import {
  ACTION,
} from '../constants/';

import { clientManager } from './client-manager';

export interface IMockerStorage {
  get(key: string): Promise<any>;
  set<T>(key: string, value: T): Promise<T>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MockerStorage implements IMockerStorage {
  /**
   * Get an item from offline store.
   */
  get(key: string): Promise<any> {
    return this._askClient({
      key,
      action: ACTION.GET_STORAGE,
    });
  }

  /**
   * Set an item to offline store.
   *
   * @param key
   * @param value Any transferable objects
   */
  set<T>(key: string, value: T): Promise<T> {
    return this._askClient({
      key, value,
      action: ACTION.SET_STORAGE,
    });
  }

  /**
   * Remove an item from offline store.
   */
  remove(key: string): Promise<void> {
    return this._askClient({
      key,
      action: ACTION.REMOVE_STORAGE,
    });
  }

  /**
   * Remove all items from offline store.
   */
  clear(): Promise<void> {
    return this._askClient({
      action: ACTION.CLEAR_STORAGE,
    });
  }

  private async _askClient(message: any) {
    const client = await clientManager.getAvailable();

    const data = await sendMessageRequest(client, message);

    return data.result;
  }
}
