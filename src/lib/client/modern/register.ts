import { connect } from './connect';

/**
 * Register service worker and connect
 * @async
 * @param  scriptURL The url of the worker script.
 * @param  [options] Register options.
 */
export async function register(
  scriptURL: string,
  options?: ServiceWorkerRegisterOptions,
): Promise<ServiceWorkerRegistration> {
  const {
    serviceWorker,
  } = navigator;

  await serviceWorker.register(scriptURL, options);

  return connect();
}
