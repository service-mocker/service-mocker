import { ClientStorageService } from './storage';

export type MockerController = ServiceWorker | Window /* legacy mode */;

export type MockerRegistration = ServiceWorkerRegistration | {
    scope: string;
    active: MockerController;
};

export interface MockerClient {
    readonly legacy: boolean;
    readonly storage: ClientStorageService;
    readonly ready: Promise<MockerRegistration>;

    controller: MockerController;

    update(): Promise<MockerRegistration>;
    getRegistration(): Promise<MockerRegistration>;
    unregister(): Promise<any>;
}
