import {
  debug,
  sendMessageRequest,
} from '../../utils/';

import {
  ACTION,
} from '../../constants/';

import { getNewestReg } from './get-newest-reg';

/**
 * Connect to service worker
 *
 * @return {Promise<ServiceWorkerRegistration>}
 */
export async function connect() {
  const {
    serviceWorker,
  } = navigator;

  const reg = serviceWorker.controller ? await getNewestReg() : await serviceWorker.ready;

  return handshake(reg);
}

/**
 * Establish service worker connection
 *
 * @param  {ServiceWorkerRegistration} registration
 * @return {Promise<ServiceWorkerRegistration>}
 */
async function handshake(registration) {
  const controller = registration.active;

  /* istanbul ignore if */
  if (!controller) {
    throw new Error('no active service worker registration is found');
  }

  // uncontrolled
  // possibly a newly install
  if (!navigator.serviceWorker.controller) {
    await sendMessageRequest(controller, {
      action: ACTION.REQUEST_CLAIM,
    });
  }

  await sendMessageRequest(controller, {
    action: ACTION.PING,
  });

  debug.scope('modern').info('connection established');

  return registration;
}
