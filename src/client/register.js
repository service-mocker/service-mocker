import { connect } from './connect';

export async function register(path, options) {
  const {
    serviceWorker,
  } = navigator;

  await serviceWorker.register(path, options);

  return connect();
}
