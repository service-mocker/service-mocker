import {
  MockerController,
  MockerRegistration,
  MockerClient,
} from '../client';

import { ClientStorageService } from '../storage';
import { patchFetch } from './patch-fetch';

export class LegacyClient implements MockerClient {
  readonly legacy = true;
  readonly ready: Promise<MockerRegistration> = null;
  readonly storage = new ClientStorageService(true);

  controller: MockerController = window;

  private _registration: MockerRegistration = {
    active: window,
    scope: `${location.protocol}://${location.host}${location.pathname}`,
  };

  constructor(scriptURL: string) {
    patchFetch();

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

  async update(): Promise<MockerRegistration> {
    return Promise.resolve(this._registration);
  }

  async getRegistration(): Promise<MockerRegistration> {
    return Promise.resolve(this._registration);
  }

  async unregister(): Promise<never> {
    throw new Error('mocker in legacy mode can\'t be unregistered');
  }
}
