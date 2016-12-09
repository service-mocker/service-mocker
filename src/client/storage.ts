import * as localforage from 'localforage';

import {
  ACTION,
} from '../constants/';

const store = localforage.createInstance({
  name: 'ServiceMocker',
  description: 'storage space for service mocker',
});

class ClientStorageService {
  private activated = false;

  public async get(key: string): Promise<any> {
    return store.getItem(key);
  }

  public async set<T>(key: string, value: T): Promise<T> {
    return store.setItem(key, value);
  }

  public async remove(key: string): Promise<void> {
    return store.removeItem(key);
  }

  public async clear(): Promise<void> {
    return store.clear();
  }

  public start(useLegacy: boolean): void {
    if (this.activated) {
      return;
    }

    this.activated = true;

    const listener = this._listener.bind(this);

    if (useLegacy) {
      self.addEventListener('message', listener);
    } else {
      navigator.serviceWorker.addEventListener('message', listener);
    }
  }

  private async _listener(evt: MessageEvent): Promise<void> {
    const {
      data,
      ports,
    } = evt;

    if (!ports.length) {
      return;
    }

    try {
      let result;

      switch (data.action) {
        case ACTION.GET_STORAGE:
          result = await this.get(data.key);
          break;
        case ACTION.SET_STORAGE:
          result = await this.set(data.key, data.value);
          break;
        case ACTION.REMOVE_STORAGE:
          result = await this.remove(data.key);
          break;
        case ACTION.CLEAR_STORAGE:
          result = await this.clear();
          break;
        default:
          return;
      }

      ports[0].postMessage({
        result,
        action: ACTION.SUCCESS,
      });
    } catch (e) {
      ports[0].postMessage({
        error: e,
        action: ACTION.FAILED,
      });
    }
  }
};

export const clientStorage = new ClientStorageService();
