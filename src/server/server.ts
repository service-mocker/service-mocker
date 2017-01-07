import {
  debug,
} from '../utils/';

import { MockerRouter } from './router';
import { MockerStorage } from './storage';
import { clientManager } from './client-manager';

const serverLog = debug.scope('server');

export interface IMockerServer {
  readonly isLegacy: boolean;
  readonly router: MockerRouter;
  readonly storage: MockerStorage;
}

export class MockerServer {
  readonly isLegacy = self === self.window;

  readonly router = new MockerRouter();
  readonly storage = new MockerStorage();

  constructor() {
    clientManager.listen();

    if (!this.isLegacy) {
      self.addEventListener('install', (event: InstallEvent) => {
        serverLog.info('sw installed');
        event.waitUntil(self.skipWaiting());
      });

      self.addEventListener('activate', (event: ExtendableEvent) => {
        serverLog.info('sw activated');
        event.waitUntil(self.clients.claim());
      });
    }
  }
}
