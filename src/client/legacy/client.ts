import {
  IMockerClient,
} from '../client';

import {
  debug,
  sendMessageRequest,
} from '../../utils/';

import {
  ACTION,
} from '../../constants/';

import { patchXHR } from './patch-xhr';
import { patchFetch } from './patch-fetch';

const registrations = {};

export class LegacyClient implements IMockerClient {
  readonly isLegacy = true;
  readonly ready: Promise<null>;

  controller = null;
  private _registration = null;

  constructor(scriptURL: string) {
    patchXHR();
    patchFetch();

    // avoid duplications
    if (registrations.hasOwnProperty(scriptURL)) {
      return registrations[scriptURL];
    }

    registrations[scriptURL] = this;

    const script = document.createElement('script');
    script.src = scriptURL;

    this.ready = new Promise<null>((resolve, reject) => {
      script.onload = async () => {
        await sendMessageRequest(window, {
          action: ACTION.PING,
        });

        debug.scope('legacy').info('connection established');

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
}
