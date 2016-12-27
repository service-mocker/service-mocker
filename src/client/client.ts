import { ClientStorageService } from './storage';

export type MockerController = ServiceWorker | null /* legacy mode */;

export type MockerRegistration = ServiceWorkerRegistration | null;

export interface IMockerClient {
  controller: MockerController;

  readonly isLegacy: boolean;
  readonly storage: ClientStorageService;
  readonly ready: Promise<MockerRegistration>;

  update(): Promise<MockerRegistration>;
  getRegistration(): Promise<MockerRegistration>;
  unregister(): Promise<any>;
  sendMessage(message: any): Promise<any>;
}
