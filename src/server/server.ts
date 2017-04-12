/// <reference path="./missing-service-worker-typing" />

import { MockerRouter } from './router';
import { ACTION } from '../constants/';

export interface IMockerServer {
  readonly isLegacy: boolean;
  readonly router: MockerRouter;
}

export class MockerServer implements IMockerServer {
  readonly isLegacy = 'window' in self;
  readonly router: MockerRouter;

  constructor(baseURL?: string) {
    this.router = new MockerRouter(baseURL);
  }
}

// Event listeners MUST be added on the initial evaluation of worker scripts.
/* istanbul ignore next: unable to report coverage from sw context */
self.addEventListener('message', async (event: ExtendableMessageEvent) => {
  const {
    data,
    ports,
  } = event;

  if (!data || ports === null || ports.length === 0) {
    return;
  }

  const port = ports[0];

  // handle connections
  switch (data.action) {
    case ACTION.PING:
      return port.postMessage({
        action: ACTION.PONG,
      });

    case ACTION.REQUEST_CLAIM:
      await clients.claim();
      return port.postMessage({
        action: ACTION.ESTABLISHED,
      });
  }
});

self.addEventListener('fetch', (event: FetchEvent) => {
  MockerRouter.routers.some((router) => {
    return router.match(event);
  });
});

// IE will somehow fires `activate` event on form elements
/* istanbul ignore if: unable to report coverage from sw context */
if ('window' in self) {
  self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(skipWaiting());
  });

  self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(clients.claim());
  });
}
