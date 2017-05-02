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
const registrations = {};

export class LegacyClient {
  /**
   * Indicates which mode current client is running on.
   *
   * @readonly
   * @type {boolean}
   */
  isLegacy = true;

  /**
   * Defines whether a client has connected to mocker server.
   * Resolves with `null` as there're actually no registrations
   *
   * @readonly
   * @type {Promise<null>}
   */
  ready = null;

  /**
   * Points to currently activated ServiceWorker object.
   * Stays null when running in legacy mode.
   *
   * @readonly
   * @type {null}
   */
  controller = null;

  _registration = null;

  constructor(scriptURL) {
    patchXHR();
    patchFetch();

    let promise = null;

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

    /* istanbul ignore next */
    this.ready = promise
      .then(() => {
        return sendMessageRequest(window, {
          action: ACTION.PING,
        });
      })
      .then(() => {
        clientLog.info('connection established');
        return this._registration;
      })
      .catch((error) => {
        // `ready` should never be rejected
        clientLog.error('bootstrap failed', error);
      });
  }

  /**
   * Update registration, this method has no effect in legacy mode
   *
   * @return {Promise<null>}
   */
  async update() {
    return Promise.resolve(this._registration);
  }

  /**
   * Get current registration, resolved with `null` in legacy mode
   *
   * @return {Promise<null>}
   */
  async getRegistration() {
    return Promise.resolve(this._registration);
  }

  /* istanbul ignore next */
  /**
   * Unregister mocker, this method has no effect in legacy mode
   *
   * @return {Promise<false>}
   */
  async unregister() {
    debug.scope('legacy').warn('mocker in legacy mode can\'t be unregistered');

    return false;
  }
}
