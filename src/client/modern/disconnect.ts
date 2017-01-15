import {
  sendMessageRequest,
} from '../../utils/';

import {
  ACTION,
} from '../../constants/';

/* istanbul ignore next */
export async function disconnect(): Promise<void> {
  const {
    serviceWorker,
  } = navigator;

  if (!serviceWorker.controller) {
    return;
  }

  return sendMessageRequest(serviceWorker.controller, {
    action: ACTION.DISCONNECT,
  });
}
