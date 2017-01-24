import { MockerRouter } from './router';
import { clientManager } from './client-manager';

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
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  clientManager.connect(event);
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const {
    client, // old spec
    clientId,
  } = event;

  /* istanbul ignore next: unable to test old spec */
  const id = clientId || (client && client.id);

  // only the connected clients should be intercepted
  /* istanbul ignore if */
  if (!clientManager.has(id)) {
    return;
  }

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

// try to reconnect clients after resumed from termination
/* istanbul ignore if: unable to report coverage from sw context */
if (self.clients) {
  self.clients.matchAll().then(clients => {
    clients.forEach(cli => clientManager.reconnect(cli));
  });
}
