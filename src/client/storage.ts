import * as localforage from 'localforage/dist/localforage.nopromises';

import {
  ACTION,
} from '../constants/';

const store = localforage.createInstance({
  name: 'ServiceMocker',
  description: 'storage space for service mocker',
});

if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', listen);
}

// always register a listener on window, see
// https://jakearchibald.github.io/isserviceworkerready/#postmessage-to-&-from-worker
window.addEventListener('message', listen);

async function listen(evt: MessageEvent): Promise<void> {
  const {
    data,
    ports,
  } = evt;

  if (!ports.length) {
    return;
  }

  try {
    let result;

    switch (data.action) {
      case ACTION.GET_STORAGE:
        result = await store.getItem(data.key);
        break;
      case ACTION.SET_STORAGE:
        result = await store.setItem(data.key, data.value);
        break;
      case ACTION.REMOVE_STORAGE:
        result = await store.removeItem(data.key);
        break;
      case ACTION.CLEAR_STORAGE:
        result = await store.clear();
        break;
      default:
        return;
    }

    ports[0].postMessage({ result });
  } catch (e) {
    ports[0].postMessage({
      error: {
        message: e.message,
        stack: e.stack,
      },
    });
  }
}
