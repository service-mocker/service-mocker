import { MockerRouter } from './router';
import { MockerStorage } from './storage';
import { EventManager } from './event-manager';
import { clientManager } from './client-manager';

export interface IMockerServer {
  readonly isLegacy: boolean;
  readonly router: MockerRouter;
  readonly storage: MockerStorage;

  on(type: string, listener: EventListener): this;
  off(type: string, listener?: EventListener): this;
  emit(event: Event): this;
}

export class MockerServer implements IMockerServer {
  readonly isLegacy = self === self.window;

  readonly router = new MockerRouter();
  readonly storage = new MockerStorage();

  constructor() {
    clientManager.listenOnce();

    /* istanbul ignore next: unable to report coverage from sw context */
    this.on('install', (event: InstallEvent) => {
      event.waitUntil(self.skipWaiting());
    });

    /* istanbul ignore next */
    this.on('activate', (event: ExtendableEvent) => {
      event.waitUntil(self.clients.claim());
    });
  }

  /**
   * Register an event listener
   *
   * @param type Event type
   * @param listener Event listener
   */
  on(type: string, listener: EventListener): this {
    EventManager.on(type, listener);

    return this;
  }

  /**
   * Remove event listener
   *
   * @param type Event type
   * @param listener Event listener, if not present, all listeners will be removed
   */
  off(type: string, listener?: EventListener): this {
    EventManager.off(type, listener);

    return this;
  }

  /**
   * Emit an event, event type will be inferred from `event` object
   *
   * @param event Custom event
   */
  emit(event: Event): this {
    EventManager.emit(event);

    return this;
  }
}
