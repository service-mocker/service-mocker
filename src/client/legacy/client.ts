import {
  runOnce,
} from '../../utils/';

import {
  MockerController,
  MockerRegistration,
  MockerClient,
} from '../client';

import { ClientStorageService } from '../storage';
import { patchFetch } from './patch-fetch';

const clientStorage = new ClientStorageService();

export class LegacyClient implements MockerClient {
  legacy = true;
  controller: MockerController = window;
  ready: Promise<MockerRegistration> = null;
  storage: ClientStorageService = clientStorage;

  private _registration: MockerRegistration = {
    active: window,
    scope: `${location.protocol}://${location.host}`,
  };

  constructor(scriptURL: string) {
    patchFetch();
    this._load(scriptURL);
    clientStorage.startLegacy();
  }

  async update(): Promise<MockerRegistration> {
    return Promise.resolve(this._registration);
  }

  async getRegistration(): Promise<MockerRegistration> {
    return Promise.resolve(this._registration);
  }

  async unregister(): Promise<never> {
    throw new Error('mocker in legacy mode can\'t be unregistered');
  }

  @runOnce
  private _load(scriptURL: string) {
    const script = document.createElement('script');
    script.src = scriptURL;

    this.ready = new Promise((resolve, reject) => {
      script.onload = () => {
        resolve(this._registration);
      };

      script.onerror = () => {
        reject(new Error('legacy mode bootstrap failed'));
      };
    });

    document.body.appendChild(script);
  }
}
