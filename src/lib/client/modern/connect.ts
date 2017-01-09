import {
  debug,
  sendMessageRequest,
} from '../../utils/';

import {
  ACTION,
} from '../../constants/';

import { getNewestReg } from './get-newest-reg';

export async function connect(): Promise<ServiceWorkerRegistration> {
  const {
    serviceWorker,
  } = navigator;

  // check update
  if (serviceWorker.controller) {
    return getNewestReg().then(handshake);
  }

  return serviceWorker.ready.then(handshake);
}

async function handshake(registration: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration> {
  const controller = registration.active;

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
