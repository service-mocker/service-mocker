import { patchFetch } from './patch-fetch';

export class LegacyClient {
  ready = null;
  legacy = true;
  controller = window;
  _registration = {
    active: window,
    scope: `${location.protocol}://${location.host}`,
  };

  constructor(path) {
    patchFetch();
    this._load(path);
  }

  onUpdate() {}

  async update() {
    return Promise.resolve(this._registration);
  }

  async getRegistration() {
    return Promise.resolve(this._registration);
  }

  async unregister() {
    throw new Error('mocker in legacy mode can\'t be unregistered');
  }

  _load(path) {
    const script = document.createElement('script');
    script.src = path;

    this.ready = new Promise((resolve, reject) => {
      script.onload = () => {
        resolve(this._registration);
      };

      script.onerror = () => {
        reject(new Error('legacy mode bootstrap failed'));
      };
    });

    document.body.appendChild(script);
  }
}
