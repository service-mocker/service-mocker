import * as localforage from 'localforage/dist/localforage.nopromises';

import {
  ACTION,
} from '../constants/';

import {
  runOnce,
} from '../utils/';

const store = localforage.createInstance({
  name: 'ServiceMocker',
  description: 'storage space for service mocker',
});

export class ClientStorageService {
  async get(key: string): Promise<any> {
    return store.getItem(key);
  }

  async set<T>(key: string, value: T): Promise<T> {
    return store.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    return store.removeItem(key);
  }

  async clear(): Promise<void> {
    return store.clear();
  }

  @runOnce
  start() {
    navigator.serviceWorker.addEventListener(
      'message',
      this._listener.bind(this),
    );
  }

  @runOnce
  startLegacy() {
    self.addEventListener(
      'message',
      this._listener.bind(this),
    );
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
