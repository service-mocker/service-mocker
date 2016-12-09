import {
  MockerClient,
} from '../client.d';

import { register } from './register';
import { connect } from './connect';
import { disconnect } from './disconnect';
import { getNewestReg } from './get-newest-reg';

import { debug } from '../../utils/';

export class ModernClient implements MockerClient {
  legacy = false;
  controller: ServiceWorker = null;
  ready: Promise<ServiceWorkerRegistration> = null;

  constructor(scriptURL: string, options: ServiceWorkerRegisterOptions) {
    this._setReady(this._init(scriptURL, options));
  }

  async update(): Promise<ServiceWorkerRegistration> {
    return getNewestReg();
  }

  async getRegistration(): Promise<ServiceWorkerRegistration> {
    return this.ready;
  }

  async unregister(): Promise<boolean | never> {
    const registration = await this.getRegistration();

    const result = await registration.unregister();

    if (!result) {
      // tslint:disable-next-line max-line-length
      throw new Error('this service worker has already been unregistered, you may need to close all relative tabs to remove it');
    }

    return result;
  }

  private async _init(scriptURL: string, options: ServiceWorkerRegisterOptions): Promise<ServiceWorkerRegistration> {
    if (this._hasInitialized()) {
      return this.getRegistration();
    }

    const registration = await register(scriptURL, options);

    this._autoSyncClient();
    this._handleUnload();

    return registration;
  }

  private _hasInitialized(): boolean {
    return this.ready !== null;
  }

  private _setReady(updater: Promise<ServiceWorkerRegistration>) {
    if (this._hasInitialized()) {
      return;
    }

    this.ready = new Promise(resolve => {
      updater
        .then(registration => {
          this.controller = registration.active;
          resolve(registration);
        })
        .catch(error => {
          this.controller = null;
          debug.error('mocker initialization failed: ', error);
        });
    });
  }

  private _autoSyncClient() {
    const {
      serviceWorker,
    } = navigator;

    const updateLog = debug.scope('update');

    serviceWorker.addEventListener('controllerchange', async () => {
      try {
        const registration = await connect(true);
        this.controller = registration.active;

        updateLog.color('crimson')
          .warn('mocker updated, reload your requests to take effect');
      } catch (error) {
        updateLog.error('connecting to new mocker failed', error);
      }
    });
  }

  private _handleUnload() {
    window.addEventListener('beforeunload', disconnect);
  }
}
