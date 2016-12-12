import { ClientStorageService } from './storage';

export type MockerController = ServiceWorker | Window /* legacy mode */;

export type MockerRegistration = ServiceWorkerRegistration | {
  scope: string;
  active: MockerController;
};

export abstract class MockerClient {
  abstract controller: MockerController;

  abstract readonly legacy: boolean;
  abstract readonly storage: ClientStorageService;
  abstract readonly ready: Promise<MockerRegistration>;

  abstract async update(): Promise<MockerRegistration>;
  abstract async getRegistration(): Promise<MockerRegistration>;
  abstract async unregister(): Promise<any>;
}
