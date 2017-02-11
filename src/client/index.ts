import {
  IMockerClient,
} from './client';

import { ModernClient } from './modern/client';
import { LegacyClient } from './legacy/client';

export { IMockerClient };

export type MockerClientOptions = {
  forceLegacy?: boolean,
};

export function createClient(
  scriptURL: string,
  options: MockerClientOptions = {},
): IMockerClient {
  if (options.forceLegacy) {
    return new LegacyClient(scriptURL);
  }

  const useLegacy = isLegacyMode();

  /* istanbul ignore if */
  if (useLegacy) {
    console.warn('Switching to legacy mode...');
    return new LegacyClient(scriptURL);
  }

  return new ModernClient(scriptURL);
}

/* istanbul ignore next */
function isLegacyMode(): boolean {
  if (!('serviceWorker' in navigator)) {
    // tslint:disable-next-line max-line-length
    console.warn('Service worker is not supported in your browser, please check: http://caniuse.com/#feat=serviceworkers');

    return true;
  }

  if (location.protocol !== 'https:' &&
      location.hostname !== 'localhost' &&
      location.hostname !== '127.0.0.1'
  ) {
    // tslint:disable-next-line max-line-length
    console.warn('Service workers should be registered in secure pages, further information: https://github.com/w3c/ServiceWorker/blob/master/explainer.md#getting-started');

    return true;
  }

  return false;
}
