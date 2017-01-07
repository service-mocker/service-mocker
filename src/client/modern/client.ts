import {
  debug,
} from '../../utils/';

import {
  IMockerClient,
} from '../client';

import { register } from './register';
import { connect } from './connect';
import { disconnect } from './disconnect';
import { getNewestReg } from './get-newest-reg';

export class ModernClient implements IMockerClient {
  readonly isLegacy = false;
  readonly ready: Promise<ServiceWorkerRegistration>;

  controller: ServiceWorker;

  constructor(scriptURL: string) {
    this.ready = this._init(scriptURL)
      .then(registration => {
        this.controller = registration.active;
        return registration;
      })
      .catch(error => {
        debug.error('mocker initialization failed: ', error);
      });
  }

  async update(): Promise<ServiceWorkerRegistration> {
    return getNewestReg();
  }

  async getRegistration(): Promise<ServiceWorkerRegistration> {
    return this.ready;
  }

  async unregister(): Promise<boolean> {
    const registration = await this.getRegistration();

    const result = await registration.unregister();

    if (!result) {
      // tslint:disable-next-line max-line-length
      debug.warn('this service worker has already been unregistered, you may need to close all relative tabs to remove it');
    }

    return result;
  }

  private async _init(scriptURL: string): Promise<ServiceWorkerRegistration> {
    const registration = await register(scriptURL);

    this._autoSyncClient();
    this._handleUnload();

    return registration;
  }

  private _autoSyncClient() {
    const {
      serviceWorker,
    } = navigator;

    const updateLog = debug.scope('update');

    serviceWorker.addEventListener('controllerchange', async () => {
      try {
        const registration = await connect();
        this.controller = registration.active;

        updateLog.color('crimson')
          .warn('mocker updated, reload your requests to take effect');
      } catch (error) {
        updateLog.error('connecting to new service worker failed', error);
      }
    });
  }

  private _handleUnload() {
    window.addEventListener('beforeunload', disconnect);
  }
}
