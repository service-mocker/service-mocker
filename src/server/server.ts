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

  readonly router = new MockerRouter();
  readonly storage = new MockerStorage();

  constructor() {
    clientManager.listen();

    if (!this.isLegacy) {
      self.addEventListener('install', (event: InstallEvent) => {
        event.waitUntil(self.skipWaiting());
      });

      self.addEventListener('activate', (event: ExtendableEvent) => {
        event.waitUntil(self.clients.claim());
      });
    }
  }
}
