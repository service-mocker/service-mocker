import { connect } from './connect';

/**
 * Register service worker
 *
 * @param  {string}                             scriptURL
 * @param  {ServiceWorkerRegisterOptions}       options
 * @return {Promise<ServiceWorkerRegistration>}
 */
export async function register(scriptURL, options) {
  const {
    serviceWorker,
  } = navigator;

  await serviceWorker.register(scriptURL, options);

  return connect();
}
