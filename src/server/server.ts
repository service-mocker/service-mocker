import { MockerRouter } from './router';
import { ACTION } from '../constants/';

export interface IMockerServer {
  readonly isLegacy: boolean;
  readonly router: MockerRouter;
}

export class MockerServer implements IMockerServer {
  readonly isLegacy = self === self.window;
  readonly router: MockerRouter;

  constructor(baseURL?: string) {
    this.router = new MockerRouter(baseURL);
  }
}

// Event listeners MUST be added on the initial evaluation of worker scripts.
// handle connections
self.addEventListener('message', async (event: ExtendableMessageEvent) => {
  const {
    data,
    ports,
  } = event;

  if (!data || !ports.length) {
    return;
  }

  const port = ports[0];

  switch (data.action) {
    case ACTION.PING:
      return port.postMessage({
        action: ACTION.PONG,
      });

    case ACTION.REQUEST_CLAIM:
      await self.clients.claim();
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
if (self !== self.window) {
  self.addEventListener('install', (event: InstallEvent) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(self.clients.claim());
  });
}
