import {
  debug,
  eventWaitUntil,
} from '../../utils/';

const updateLog = debug.scope('update');

/**
 * Update and get the newest registration.
 * @async
 */
export async function getNewestReg(): Promise<ServiceWorkerRegistration> {
  const {
    serviceWorker,
  } = navigator;

  updateLog.color('darkorchid').info('checking for updates');

  const registration = await serviceWorker.getRegistration();

  if (!registration) {
    throw new Error('no active service worker registration is found');
  }

  // reg.update() resolved with `reg.installing` set when updates are found, see
  // #10 in https://w3c.github.io/ServiceWorker/#update-algorithm
  // #4 and #7 in https://w3c.github.io/ServiceWorker/#installation-algorithm
  await registration.update();

  const newWorker = registration.installing || registration.waiting;

  if (newWorker) {
    updateLog.info('installing updates');

    // wait until worker is activated
    await eventWaitUntil(
      newWorker, 'statechange',
      () => newWorker.state === 'activated',
    );
  } else {
    updateLog.color('lightseagreen').info('already up-to-date');
  }

  return registration;
}
