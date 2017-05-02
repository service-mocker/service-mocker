import {
  debug,
} from '../../utils/';

import { register } from './register';
import { connect } from './connect';
import { getNewestReg } from './get-newest-reg';

export class ModernClient {
  /**
   * Indicates which mode current client is running on.
   *
   * @readonly
   * @type {boolean}
   */
  isLegacy = false;

  /**
   * Defines whether a client has connected to mocker server.
   *
   * @readonly
   * @type {Promise<ServiceWorkerRegistration>}
   */
  ready = null;

  /**
   * Points to currently activated ServiceWorker object.
   *
   * @readonly
   * @type {ServiceWorker}
   */
  controller = null;

  constructor(scriptURL) {
    /* istanbul ignore next */
    this.ready = this._init(scriptURL)
      .then((registration) => {
        this.controller = registration.active;
        return registration;
      })
      .catch((error) => {
        debug.error('mocker initialization failed: ', error);
      });
  }

  /**
   * Update the service worker registration immediately
   *
   * @return {Promise<ServiceWorkerRegistration>}
   */
  async update() {
    return getNewestReg();
  }

  /**
   * Get current service worker registration.
   *
   * @return {Promise<ServiceWorkerRegistration>}
   */
  async getRegistration() {
    return this.ready;
  }

  /* istanbul ignore next: don't unregister sw in tests */
  /**
   * Unregister current service worker registration,
   * call this method will invoke `ServiceWorkerRegistration.unregister()` method when possible.
   *
   * @return {Promise<boolean>}
   */
  async unregister() {
    const registration = await this.getRegistration();

    const result = await registration.unregister();

    if (!result) {
      // tslint:disable-next-line max-line-length
      debug.warn('this service worker has already been unregistered, you may need to close all relative tabs to remove it');
    }

    return result;
  }

  /**
   * Init mocker
   *
   * @private
   * @param  {string} scriptURL
   * @return {Promise<ServiceWorkerRegistration>}
   */
  async _init(scriptURL) {
    const registration = await register(scriptURL, {
      scope: location.pathname,
    });

    this._autoSyncClient();

    return registration;
  }

  /**
   * Synchronize mocker controller when sw controller changed
   *
   * @private
   */
  _autoSyncClient() {
    const {
      serviceWorker,
    } = navigator;

    const updateLog = debug.scope('update');

    /* istanbul ignore next: won't occur in tests */
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
}
