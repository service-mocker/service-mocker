import { MockerRouter } from './router';
import { MockerStorage } from './storage';
import { clientManager } from './client-manager';

export interface IMockerServer {
  readonly isLegacy: boolean;
  readonly router: MockerRouter;
  readonly storage: MockerStorage;
}

export class MockerServer implements IMockerServer {
  readonly isLegacy = self === self.window;
  readonly storage = new MockerStorage();
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

  /* istanbul ignore if */
  if (!clientManager.has(id)) {
    return;
  }

  MockerRouter.routers.forEach((router) => {
    router.match(event);
  });
});

/* istanbul ignore next: unable to report coverage from sw context */
self.addEventListener('install', (event: InstallEvent) => {
  event.waitUntil(self.skipWaiting());
});

/* istanbul ignore next */
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});
