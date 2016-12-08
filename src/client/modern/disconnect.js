import {
  oneOffMessage,
} from '../../utils/';

import {
  ACTION,
} from '../../constants/';

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
    message: {
      action: ACTION.DISCONNECT,
    },
  });
}
