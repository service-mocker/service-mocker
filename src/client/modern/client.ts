import {
  debug,
} from '../../utils/';

import {
  ACTION,
} from '../../constants/';

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
    /* istanbul ignore next */
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
    const registration = await register(scriptURL);

    this._autoSyncClient();
    this._handleReconnect();
    this._handleUnload();

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
        this.controller = registration.active;

        updateLog.color('crimson')
          .warn('mocker updated, reload your requests to take effect');
      } catch (error) {
        updateLog.error('connecting to new service worker failed', error);
      }
    });
  }

  /* istanbul ignore next: unable to test */
  private _handleReconnect() {
    // also register a listener on window, see
    // https://jakearchibald.github.io/isserviceworkerready/#postmessage-to-&-from-worker
    self.addEventListener('message', listener);
    navigator.serviceWorker.addEventListener('message', listener);

    function listener(evt: MessageEvent) {
      const {
        data,
        ports,
      } = evt;

      if (!data || !ports.length || data.action !== ACTION.RECONNECT) {
        return;
      }

      ports[0].postMessage({
        action: ACTION.CLIENT_FOUND,
      });
    }
  }

  private _handleUnload() {
    window.addEventListener('beforeunload', disconnect);
  }
}
