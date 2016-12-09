export type MockerController = ServiceWorker | Window /* legacy mode */;

export type MockerRegistration = ServiceWorkerRegistration | {
    scope: string;
    active: MockerController;
};

export interface MockerClient {
    legacy: boolean;
    ready: Promise<MockerRegistration>;
    controller: MockerController;

    update(): Promise<MockerRegistration>;
    getRegistration(): Promise<MockerRegistration>;
    unregister(): Promise<any>;
}
