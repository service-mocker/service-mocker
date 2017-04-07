import {
  debug,
} from '../../utils/';

import {
  IMockerClient,
} from '../client';

import { register } from './register';
import { connect } from './connect';
import { getNewestReg } from './get-newest-reg';

export class ModernClient implements IMockerClient {
  readonly isLegacy = false;
  readonly ready: Promise<ServiceWorkerRegistration>;

  controller: ServiceWorker;

  constructor(scriptURL: string) {
    /* istanbul ignore next */
    this.ready = this._init(scriptURL)
      .then(registration => {
        this.controller = registration.active as ServiceWorker;
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

  /* istanbul ignore next: don't unregister sw in tests */
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
    const registration = await register(scriptURL, {
      scope: location.pathname,
    });

    this._autoSyncClient();

    return registration;
  }

  private _autoSyncClient() {
    const {
      serviceWorker,
    } = navigator;

    const updateLog = debug.scope('update');

    /* istanbul ignore next: won't occur in tests */
    serviceWorker.addEventListener('controllerchange', async () => {
      try {
        const registration = await connect();
        this.controller = registration.active as ServiceWorker;

        updateLog.color('crimson')
          .warn('mocker updated, reload your requests to take effect');
      } catch (error) {
        updateLog.error('connecting to new service worker failed', error);
      }
    });
  }
}
