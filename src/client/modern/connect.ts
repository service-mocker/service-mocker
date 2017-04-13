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

  const reg = serviceWorker.controller ? await getNewestReg() : await serviceWorker.ready;

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

  debug.scope('modern').info('connection established');

  return registration;
}
