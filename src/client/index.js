import { ModernClient } from './modern/client';
import { LegacyClient } from './legacy/client';

/**
 * Constructs a new Client instance with the given scriptURL
 *
 * @param  {string} scriptURL The location of your server script
 * @param  {Object} options   Initial options
 * @return {MockerClient}
 */
export function createClient(scriptURL, options = {}) {
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
function isLegacyMode() {
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
