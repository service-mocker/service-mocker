import { connect } from './connect';

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
