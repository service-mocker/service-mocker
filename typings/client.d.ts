type MockerController = ServiceWorker | null;

type MockerRegistration = ServiceWorkerRegistration | null;

type MockerClientOptions = {
  /**
   * When this option is set to true,
   * you will always get a legacy client despite what the browser you are using.
   */
  forceLegacy?: boolean;
};

interface MockerClient {
  /**
   * Indicates which mode current client is running on,
   * will be `true` in legacy mode and `false` in modern mode.
   */
  readonly isLegacy: boolean;

  /**
   * Points to currently activated `ServiceWorker` object,
   * this value will stay null when running in legacy mode.
   */
  readonly controller: MockerController;

  /**
   * Defines whether a client has connected to mocker server.
   * In modern mode, it resolves with `ServiceWorkerRegistration`,
   * while in legacy mode, it resolves with `null` as there're actually no registrations.
   */
  readonly ready: Promise<MockerRegistration>;

  /**
   * Call `client.update()` method when you want to
   * update the service worker registration immediately.
   *
   * This method has no effect in legacy mode.
   */
  update(): Promise<MockerRegistration>;

  /**
   * Returns a Promise which resolves to current registration.
   * Like the client.ready property, the Promise will be resolved with
   * `ServiceWorkerRegistration` in modern mode and `null` in legacy mode.
   */
  getRegistration(): Promise<MockerRegistration>;

  /**
   * Unregister current service worker registration,
   * call this method will invoke `ServiceWorkerRegistration.unregister()` method when possible.
   *
   * This method has no effect in legacy mode.
   */
  unregister(): Promise<boolean>;
}

/**
 * Constructs a new Client instance with the given scriptURL
 *
 * @param scriptURL The location of your server script
 * @param options Initial options
 */
export declare function createClient(
  scriptURL: string,
  options?: MockerClientOptions,
): MockerClient;
