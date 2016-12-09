import {
  oneOffMessage,
} from '../../utils/';

import {
  ACTION,
} from '../../constants/';

export async function disconnect(): Promise<void> {
  const {
    serviceWorker,
  } = navigator;

  if (!serviceWorker.controller) {
    return;
  }

  return oneOffMessage(serviceWorker.controller, {
    action: ACTION.DISCONNECT,
  });
}
