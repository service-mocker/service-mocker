import {
  IMockerClient,
} from '../client';

import {
  sendMessageRequest,
  debug,
} from '../../utils/';

import { ClientStorageService } from '../storage';
import { patchXHR } from './patch-xhr';
import { patchFetch } from './patch-fetch';

export class LegacyClient implements IMockerClient {
  readonly isLegacy = true;
  readonly ready: Promise<null>;
  readonly storage = new ClientStorageService(true);

  controller = null;
  private _registration = null;

  constructor(scriptURL: string) {
    patchXHR();
    patchFetch();

    const script = document.createElement('script');
    script.src = scriptURL;

    this.ready = new Promise<null>((resolve, reject) => {
      script.onload = () => {
        resolve(null);
      };

      script.onerror = () => {
        reject(new Error('legacy mode bootstrap failed'));
      };
    });

    document.body.appendChild(script);
  }

  async update(): Promise<null> {
    return Promise.resolve(this._registration);
  }

  async getRegistration(): Promise<null> {
    return Promise.resolve(this._registration);
  }

  async unregister(): Promise<boolean> {
    debug.scope('legacy').warn('mocker in legacy mode can\'t be unregistered');

    return false;
  }

  async sendMessage(message: any): Promise<any> {
    await this.ready;

    return sendMessageRequest(window, message, 0);
  }
}
