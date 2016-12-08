import { ModernClient } from './modern/client';
import { LegacyClient } from './legacy/client';

import { clientStorage } from './storage';

export function createClient(path, options) {
  const useLegacy = isLegacyMode();

  clientStorage.start(useLegacy);

  if (useLegacy) {
    console.warn('Switching to legacy mode...');
    return new LegacyClient(path);
  }

  return new ModernClient(path, options);
}

function isLegacyMode() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service worker is not supported in your browser, please check: http://caniuse.com/#feat=serviceworkers');

    return true;
  }

  if (location.protocol !== 'https' && location.hostname !== 'localhost') {
    console.warn('Service workers should be registered in secure pages, further information: https://github.com/w3c/ServiceWorker/blob/master/explainer.md#getting-started');

    return true;
  }

  return false;
}
