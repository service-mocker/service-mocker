// Request
interface MockerRequest extends Request {
  /**
   * Literally equivalent to router.baseURL property of current router
   */
  readonly baseURL: string;

  /**
   * Contains the path part of the current request
   */
  readonly path: string;

  /**
   * Contains a property for each query string parameter from the request
   */
  readonly query: any;

  /**
   * Contains properties mapped the route parameters
   */
  readonly params: any;

  /**
   * Creates a copy of the current `MockerRequest` object
   */
  clone(): MockerRequest;
}

// Response
interface MockerResponse {
  /**
   * A native `Headers` object which contains the response headers to be sent
   */
  readonly headers: Headers;

  /**
   * Sets the HTTP status for the response.
   *
   * @chainable
   * @param code Status code
   */
  status(code: number): this;

  /**
   * Sets the Content-Type HTTP header to the MIME type.
   * If the given MIME doesn't contain '/' character,
   * use `mime.lookup(type)` to obtain MIME type.
   *
   * @chainable
   * @param type MIME type
   */
  type(type: string): this;

  /**
   * Send a JSON response.
   *
   * @param body Any JSON compatible type, including object, array, string, Boolean, or number.
   */
  json(body?: any): void;

  /**
   * Sends the HTTP response.
   *
   * @param body Response body, one of Blob, ArrayBuffer, Object, or any primitive types
   */
  send(body?: any): void;

  /**
   * Set the response HTTP status code to statusCode and
   * send its status text representation as the response body.
   *
   * Equivalent to `res.status(code).send(statusText)`
   *
   * @param code Status code
   */
  sendStatus(code: number): void;

  /**
   * End the response processing and pass the response to `fetchEvent.respondWith()`.
   * Simply call this method will end the response WITHOUT any data,
   * if you want to respond with data, use `res.send()` and `res.json()`.
   */
  end(): void;

  /**
   * Forward the request to another destination.
   * The forwarded request will NOT be captured by service worker.
   *
   * @param input Destination URL or a Request object or MockerRequest
   * @param init Fetch request init
   */
  forward(input: RequestInfo, init?: RequestInit): Promise<void>;
  forward(input: MockerRequest, init?: RequestInit): Promise<void>;
}

// Router
type RoutePath = string | RegExp;
type RouteCallback = (request: MockerRequest, response: MockerResponse) => void;

interface RouterMatcher<T> {
  /**
   * Register a routing
   *
   * @param path An express style route path.
   * @param callback A function that will be invoked with `request` and `response`,
   *                 if the second argument is provided with a non-function value,
   *                 then the value will be regarded as response body.
   */
  (path: RoutePath, callback: RouteCallback): T;
  /**
   * Register a routing
   *
   * @param path An express style route path.
   * @param responseBody The response body to be sent.
   */
  (path: RoutePath, responseBody: any): T;
}

interface SubRouterMatcher<T> {
  /**
   * Register a routing to current scope
   *
   * @param callback A function that will be invoked with `request` and `response`,
   *                 if the second argument is provided with a non-function value,
   *                 then the value will be regarded as response body.
   */
  (callback: RouteCallback): T;
  /**
   * Register a routing to current scope
   *
   * @param responseBody The response body to be sent.
   */
  (responseBody: any): T;
}

interface SubRouter {
  all: SubRouterMatcher<this>;
  get: SubRouterMatcher<this>;
  post: SubRouterMatcher<this>;
  put: SubRouterMatcher<this>;
  head: SubRouterMatcher<this>;
  delete: SubRouterMatcher<this>;
  options: SubRouterMatcher<this>;
}

interface MockerRouter {
  /**
   * Returns a parsed base URL string
   */
  readonly baseURL: string;

  /**
   * Create a new router with the given path as scope.
   */
  scope(path?: string): MockerRouter;

  /**
   * Create a scoped router with the given path as
   * route path for every routing method.
   */
  route(path: RoutePath): SubRouter;

  all: RouterMatcher<this>;
  get: RouterMatcher<this>;
  post: RouterMatcher<this>;
  put: RouterMatcher<this>;
  delete: RouterMatcher<this>;
  head: RouterMatcher<this>;
  options: RouterMatcher<this>;
}

// MockerServer
interface MockerServer {
  /**
   * Indicates which mode current server is running on.
   * The value will be true in legacy mode and false in modern mode.
   */
  readonly isLegacy: boolean;

  /**
   * Returns the Router instance of current server
   */
  readonly router: MockerRouter;
}

/**
 * Constructs a new Server instance
 *
 * @param [baseURL='/'] The base URL of all routes, default is '/'.
 */
export declare function createServer(baseURL?: string): MockerServer;
