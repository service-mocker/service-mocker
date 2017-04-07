// ==============================================
// Missing webworker interface in typescript webworker.lib.ts
// See more at: <https://github.com/Microsoft/TSJS-lib-generator/pull/223>

interface URL {
    hash: string;
    host: string;
    hostname: string;
    href: string;
    readonly origin: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    username: string;
    readonly searchParams: URLSearchParams;
    toString(): string;
}

declare var URL: {
    prototype: URL;
    new(url: string, base?: string): URL;
    createObjectURL(object: any, options?: ObjectURLOptions): string;
    revokeObjectURL(url: string): void;
}

 interface URLSearchParams {
    /**
      * Appends a specified key/value pair as a new search parameter.
      */
    append(name: string, value: string): void;
    /**
      * Deletes the given search parameter, and its associated value, from the list of all search parameters.
      */
    delete(name: string): void;
    /**
      * Returns the first value associated to the given search parameter.
      */
    get(name: string): string | null;
    /**
      * Returns all the values association with a given search parameter.
      */
    getAll(name: string): string[];
    /**
      * Returns a Boolean indicating if such a search parameter exists.
      */
    has(name: string): boolean;
    /**
      * Sets the value associated to a given search parameter to the given value. If there were several values, delete the others.
      */
    set(name: string, value: string): void;
}

declare var URLSearchParams: {
    prototype: URLSearchParams;
    /**
      * Constructor returning a URLSearchParams object.
      */
    new (init?: string | URLSearchParams): URLSearchParams;
}

interface ObjectURLOptions {
    oneTimeOnly?: boolean;
}



// ==============================================
// Missing serviceworker interface in typescript webworker.lib.ts
// See more at: <https://github.com/Microsoft/TypeScript/issues/14877>

declare var clients: Clients;
declare var onactivate: (this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any;
declare var onfetch: (this: ServiceWorkerGlobalScope, ev: FetchEvent) => any;
declare var oninstall: (this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any;
declare var onnotificationclick: (this: ServiceWorkerGlobalScope, ev: NotificationEvent) => any;
declare var onnotificationclose: (this: ServiceWorkerGlobalScope, ev: NotificationEvent) => any;
declare var onpush: (this: ServiceWorkerGlobalScope, ev: PushEvent) => any;
declare var onpushsubscriptionchange: (this: ServiceWorkerGlobalScope, ev: ExtendableEvent) => any;
declare var onsync: (this: ServiceWorkerGlobalScope, ev: SyncEvent) => any;
declare var registration: ServiceWorkerRegistration;
declare function skipWaiting(): Promise<void>;

// The following variable/function already declared in webworker.d.ts, but with different typing.
// <https://github.com/Microsoft/TypeScript/blob/v2.3.0/lib/lib.webworker.d.ts#L1727>
// declare var onmessage: (this: ServiceWorkerGlobalScope, ev: ExtendableMessageEvent) => any;
// declare function addEventListener<K extends keyof ServiceWorkerGlobalScopeEventMap>(type: K, listener: (this: ServiceWorkerGlobalScope, ev: ServiceWorkerGlobalScopeEventMap[K]) => any, useCapture?: boolean): void;
// declare function addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
