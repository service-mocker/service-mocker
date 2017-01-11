import { MockerRouter } from './router';
import { MockerStorage } from './storage';
import { clientManager } from './client-manager';
import { delegateEvent } from './delegate-event';

export interface IMockerServer {
  readonly isLegacy: boolean;
  readonly router: MockerRouter;
  readonly storage: MockerStorage;
}

export class MockerServer implements IMockerServer {
  readonly isLegacy = self === self.window;

  readonly router = new MockerRouter();
  readonly storage = new MockerStorage();

  constructor() {
    clientManager.listen();

    /* istanbul ignore next: unable to report coverage from sw context */
    delegateEvent('install', (event: InstallEvent) => {
      event.waitUntil(self.skipWaiting());
    });

    /* istanbul ignore next */
    delegateEvent('activate', (event: ExtendableEvent) => {
      event.waitUntil(self.clients.claim());
    });
  }
}
