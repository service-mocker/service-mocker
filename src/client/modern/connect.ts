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
 * @param [skipUpdate] Set to `true` to bypass auto update
 */
export async function connect(
  skipUpdate = false,
): Promise<ServiceWorkerRegistration> {
  const {
    serviceWorker,
  } = navigator;

  // controller may be set when sw is ready
  const hasController = !!serviceWorker.controller;

  // chrome will sometimes be hanging after reloading page
  // delay all actions until sw is ready
  await serviceWorker.ready;

  const reg = (!skipUpdate && hasController)
              ? await getNewestReg()
              : await serviceWorker.getRegistration();

  return handshake(reg);
}

async function handshake(registration: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration> {
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
