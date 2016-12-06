import {
  ACTION,
  oneOffMessage,
} from '../shared/';

export async function disconnect() {
  const {
    serviceWorker,
  } = navigator;

  if (!serviceWorker.controller) {
    return;
  }

  return oneOffMessage({
    timeout: 0,
    target: serviceWorker.controller,
    body: {
      action: ACTION.DISCONNECT,
    },
  });
}
