import {
  IMockerClient,
} from '../client';

import {
  debug,
  Defer,
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

    const deferred = new Defer();

    // avoid duplications
    if (registrations.hasOwnProperty(scriptURL)) {
      deferred.resolve();
    } else {
      const script = document.createElement('script');
      script.src = scriptURL;
      script.onload = () => {
        deferred.resolve();
      };
      script.onerror = (error) => {
        deferred.reject(error);
      };

      document.body.appendChild(script);
    }

    this.ready = deferred.promise
      .then(() => {
        return sendMessageRequest(window, {
          action: ACTION.PING,
        });
      })
      .then(() => {
        clientLog.info('connection established');
        registrations[scriptURL] = true;
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
