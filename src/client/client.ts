export type MockerController = ServiceWorker | null /* legacy mode */;

export type MockerRegistration = ServiceWorkerRegistration | null;

export interface IMockerClient {
  controller: MockerController;

  readonly isLegacy: boolean;
  readonly ready: Promise<MockerRegistration>;

  update(): Promise<MockerRegistration>;
  getRegistration(): Promise<MockerRegistration>;
  unregister(): Promise<any>;
}
