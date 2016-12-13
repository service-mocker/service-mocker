import {
  debug,
  sendMessageRequest,
} from '../../utils/';

import {
  ACTION,
} from '../../constants/';

import { getNewestReg } from './get-newest-reg';

const connectLog = debug.scope('connect');

export async function connect(skipUpdateCheck = false): Promise<ServiceWorkerRegistration> {
  const {
    serviceWorker,
  } = navigator;

  // check update
  if (!skipUpdateCheck && serviceWorker.controller) {
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
    await requestClaim(controller);
  }

  const response = await sendMessageRequest(controller, {
    action: ACTION.PING,
  });

  if (response.action !== ACTION.PONG) {
    throw new Error(`unknown error during ping: ${JSON.stringify(response)}`);
  }

  connectLog.info('connected to mocker successfully');

  return registration;
}

async function requestClaim(worker: ServiceWorker): Promise<void> {
  const response = await sendMessageRequest(worker, {
    action: ACTION.REQUEST_CLAIM,
  });

  if (response.action !== ACTION.ESTABLISHED) {
    throw new Error(`claiming failed: ${JSON.stringify(response)}`);
  }

  connectLog.info(`mocker claimed successfully`);
}
