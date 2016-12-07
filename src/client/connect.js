import {
  debug,
  oneOffMessage,
} from '../utils/';

import {
  ACTION,
} from '../constants/';

import { getNewestReg } from './get-newest-reg';

const connectLog = debug.scope('connect');

export async function connect(skipUpdateCheck = false) {
  const {
    serviceWorker,
  } = navigator;

  // check update
  if (!skipUpdateCheck && serviceWorker.controller) {
    return getNewestReg().then(handshake);
  }

  return serviceWorker.ready.then(handshake);
}

async function handshake(registration) {
  const controller = registration.active;

  if (!controller) {
    throw new Error('no active service worker registration is found');
  }

  // uncontrolled
  // possibly a newly install
  if (!navigator.serviceWorker.controller) {
    await requestClaim(controller);
  }

  const response = await oneOffMessage({
    target: controller,
    body: {
      action: ACTION.PING,
    },
  });

  if (response.action !== ACTION.PONG) {
    throw new Error(`unknown error during ping: ${JSON.stringify(response)}`);
  }

  connectLog.info('connected to mocker successfully');

  return registration;
}

async function requestClaim(worker) {
  const response = await oneOffMessage({
    target: worker,
    body: {
      action: ACTION.REQUEST_CLAIM,
    },
  });

  if (response.action !== ACTION.ESTABLISHED) {
    throw new Error(`claiming failed: ${JSON.stringify(response)}`);
  }

  connectLog.info(`mocker claimed successfully`);
}
