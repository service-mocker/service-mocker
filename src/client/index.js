import { register } from './register';
import { connect } from './connect';
import { disconnect } from './disconnect';
import { getNewestReg } from './get-newest-reg';

import { debug } from '../shared/';

export class Client {
  controller = null;
  ready = null;

  constructor(path, options) {
    if (!('serviceWorker' in navigator)) {
      throw new Error('service worker is not supported in your browser, further information: http://caniuse.com/#feat=serviceworkers');
    }

    Object.defineProperties(this, {
      _updateListeners: {
        value: [],
        configurable: true,
      },
    });

    this._setReady(this._init(path, options));
  }

  onUpdate(fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('handler must be a function');
    }

    const {
      _updateListeners: listeners,
    } = this;

    listeners.push(fn);

    return {
      remove() {
        for (let i = 0, max = listeners.length; i < max; i++) {
          if (listeners[i] === fn) {
            return listeners.splice(i, 1);
          }
        }
      },
    };
  }

  async connect() {
    return connect();
  }

  async disconnect() {
    return disconnect();
  }

  async update() {
    return getNewestReg();
  }

  async getRegistration() {
    return this.ready;
  }

  async unregister() {
    const registration = await this.getRegistration();

    const result = await registration.unregister();

    if (!result) {
      throw new Error('this service worker has already been unregistered, you may need to close all relative tabs to remove it');
    }

    return result;
  }

  async _init(path, options) {
    if (this._hasInitialized()) {
      return this.getRegistration();
    }

    const registration = await register(path, options);

    this._autoSyncClient();
    this._handleUnload();

    return registration;
  }

  _hasInitialized() {
    return this.ready !== null;
  }

  _setReady(updater) {
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
          debug.error('mocker initialization failed', error);
        });
    });
  }

  _autoSyncClient() {
    const {
      serviceWorker,
    } = navigator;

    const updateLog = debug.scope('update');

    serviceWorker.addEventListener('controllerchange', async (evt) => {
      let error = null;
      let registration = null;

      try {
        registration = await connect(true);
        this.controller = registration.active;

        updateLog.color('crimson')
          .warn('mocker updated, reload your requests to take effect');
      } catch (e) {
        error = e;
        updateLog.error('connecting to new mocker failed', e);
      }

      this._updateListeners.forEach((fn) => {
        fn(error, registration);
      });
    });
  }

  _handleUnload() {
    window.addEventListener('beforeunload', disconnect);
  }
}
