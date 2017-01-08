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

const clientLog = debug.scope('legacy');
const registrations: any = {};

export class LegacyClient implements IMockerClient {
  readonly isLegacy = true;
  readonly ready: Promise<null>;

  controller = null;
  private _registration = null;

  constructor(scriptURL: string) {
    patchXHR();
    patchFetch();

    let promise: Promise<any>;

    // avoid duplications
    if (registrations[scriptURL]) {
      promise = registrations[scriptURL];
    } else {
      registrations[scriptURL] =
      promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptURL;
        script.onload = resolve;
        script.onerror = reject;

        document.body.appendChild(script);
      });
    }

    this.ready = promise.then(() => {
        return sendMessageRequest(window, {
          action: ACTION.PING,
        });
      })
      .then(() => {
        clientLog.info('connection established');
        return this._registration;
      })
      .catch(error => {
        // `ready` should never be rejected
        clientLog.error('bootstrap failed', error);
      });
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
