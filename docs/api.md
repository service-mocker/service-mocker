## Top-level API

<p class="tip">Though there's an `index.js` entry that exports both <a href="#createclient" jump-to-id="createclient">`createClient()`</a> and <a href="#createserver" jump-to-id="createserver">`createServer()`</a> function, it's recommended to import them separately:</p>

```js
// app.js
import { createClient } from 'service-mocker/client';

const client = createClient('server.js');
```

```js
// server.js
import { createServer } from 'service-mocker/server';

const server = createServer();
```


### createClient()

```js
createClient(scriptURL, options?): MockerClient
```

| Param | Type | Description |
| --- | :-: | --- |
| `scriptURL` | string | The location of your **server script**. |
| `options` | object, _optional_ | Initial options, currently possible options are: <br> <ul><li>`forceLegacy?: boolean`: When this option is set to `true`, you will always get a legacy client despite what the browser you are using.</li></ul> |

The `createClient()` function constructs a new <a href="#client" jump-to-id="client">`Client`</a> instance with the given `scriptURL`. By default, it will try to create a `ModernClient` when you are running in a secure environment with service worker supported. By passing `forceLegacy: true`, you can always get a `LegacyClient` despite the browser environment.

A **secure environment** is defined as:

- HTTPS pages without cert errors, or
- localhost

In any environment other than the above, Service Mocker will be bootstrapped in legacy mode.

```js
import { createClient } from 'service-mocker/client';

const client = createClient('server.js');

const legacyClient = createClient('server.js', {
  forceLegacy: true,
});
```

### createServer()

```js
createServer(baseURL?): MockerServer
```

| Param | Type | Description |
| --- | :-: | --- |
| `baseURL` | string, _optional_ | The base URL of all routes, default is `'/'`. |

The `createServer()` function constructs a new <a href="#server" jump-to-id="server">`Server`</a> instance. The `baseURL` parameter defines the base URL for the router of this server, you can regard it as the **prefix** for every routes:

```js
import { createServer } from 'service-mocker/server';

const serverA = createServer();

// '/whatever'
serverA.router.get('/whatever', ...);

const serverB = createServer('/api/v1');

// '/api/v1/whatever'
serverB.router.get('/whatever', ...);
```

Unlike most backend frameworks, the base URLs can either be **absolute** or **relative**:

```js
const localServer = createServer('/api');

// '/api/v1/whatever'
localServer.router.get('/whatever', ...);

const remoteServer = createServer('https://a.com/api');

// 'https://a.com/api/whatever'
remoteServer.router.get('/whatever', ...);
```

It's recommended to use different base URLs for different modules, for example:

```js
// server.local.js
const server = createServer('/api');
```

```js
// server.remote.js
const server = createServer('https://a.com/api');
```

## Client

The client instance is what you get from <a href="#createclient" jump-to-id="createclient">`createClient()`</a> function:

```js
import { createClient } from 'service-mocker/client';

const client = createClient('server.js');
```

Usually, you won't have too many stuff with the client instance.

### client.ready

- Type: `Promise<ServiceWorkerRegistration | null>`

The `client.ready` property defines whether a client has **connected** to mocker server. In modern mode, it resolves with [`ServiceWorkerRegistration`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration), while in legacy mode, it resolves with `null` as there're actually no registrations.

Like `ServiceWorkerContainer.ready` property, this `Promise` will **never be rejected**.

```js
client.ready.then((registration) => {
  console.log(registration); // ServiceWorkerRegistration{} | null
});
```

**No request will be intercepted until `client.ready` is resolved**. Hence, in an ideal case, all your bootstrapping codes should be placed inside `ready.then(() => ...)`:

```js
client.ready.then((registration) => {
  ReactDOM.render(<App />);
});
```

### client.controller

- Type: `ServiceWorker | null`

The `client.controller` property points to currently activated [`ServiceWorker`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker) object, this value will stay `null` when running in legacy mode.

```js
client.ready.then(() => {
  console.log(client.controller); // ServiceWorker{} | null
});
```

### client.isLegacy

- Type: `boolean`

The `client.isLegacy` property indicates which mode current client is running on. The value will be `true` in legacy mode and `false` in modern mode.

### client.update()

```js
client.update(): Promise<ServiceWorkerRegistration | null>
```

Call `client.update()` method when you want to update the **service worker registration immediately**. In general, you don't need to invoke this method manually while the script will try to load the newest registration every time you reload your page.

```js
client.update().then(() => {
  ...
});
```

<p class="warning">The `client.update()` method has no effect in legacy mode.</p>

### client.getRegistration()

```js
client.getRegistration(): Promise<ServiceWorkerRegistration | null>
```

This method returns a `Promise` which resolves to current registration. Like the `client.ready` property, the `Promise` will be resolved with [`ServiceWorkerRegistration`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration) in modern mode and `null` in legacy mode.

```js
client.getRegistration().then((registration) => {
  console.log(registration); // ServiceWorkerRegistration{} | null
});
```

### client.unregister()

```js
client.unregister(): Promise<boolean>
```

Unregister current service worker registration, call this method will invoke [`ServiceWorkerRegistration.unregister()`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/unregister) method when possible.

```js
client.unregister().then(() => {
  ...
});
```

<p class="warning">The `client.unregister()` method has no effect in legacy mode.</p>

## Server

The server instance is what you get from <a href="#createserver" jump-to-id="createserver">`createServer()`</a> function:

```js
import { createServer } from 'service-mocker/server';

const server = createServer();
```

### server.isLegacy

- Type: `boolean`

The `server.isLegacy` property indicates which mode current server is running on. The value will be `true` in legacy mode and `false` in modern mode.

### server.router

- Type: `Router`

The `server.router` property returns the <a href="#router" jump-to-id="router">`Router`</a> instance of current server.

```js
console.log(server.router); // Router{}
```

## Router

A new `Router` instance is constructed by <a href="#createserver" jump-to-id="createserver">`createServer()`</a> function or <a href="#router-base" jump-to-id="router-base">`router.base()`</a> method.

In Service Mocker, we are using the [express style](http://expressjs.com/en/guide/routing.html) route paths via the [path-to-regexp](https://github.com/pillarjs/path-to-regexp) module. You can visit [express/routing](http://expressjs.com/en/guide/routing.html) for more routing guides.

### router.baseURL

- Type: `string`

The `router.baseURL` property returns a parsed base URL.

```js
// assuming you are running on http://localhost:3000
const localServer = createServer('/api');
console.log(localServer.router.baseURL); // 'http://localhost:3000/api'

const remoteServer = createServer('https://a.com/api');
console.log(remoteServer.router.baseURL); // 'https://a.com/api'
```

<p class="warning">The value of `router.baseURL` will always be an **absolute** path.</p>

### router.METHOD()

```js
router.METHOD(path, callback): this
router.METHOD(path, responseBody): this
```

| Param | Type | Description |
| --- | :-: | --- |
| `path` | string &#124; RegExp | An [express style](http://expressjs.com/en/guide/routing.html) route path. |
| `callback` | (req, res) => void | A routing handler which will be executed when the route is matched. The `callback` function receives two parameters:<br> <ol><li>`req`: A <a href="#request" jump-to-id="request">`Request()`</a> object.</li><li>`res`: A <a href="#response" jump-to-id="response">`Response()`</a> object.</li></ol> |

If the second argument is provided with a non-function value, then the value will be regarded as response body:

| Param | Type | Description |
| --- | :-: | --- |
| `path` | string &#124; RegExp | An [express style](http://expressjs.com/en/guide/routing.html) route path. |
| `responseBody` | any | The body to be sent. This can be one of [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [Array](https://developer.mozilla.org/en-US/docs/Glossary/array), [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), and [Primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) except `Symbol`. |

Call `router.METHOD()` method to intercept HTTP requests by matching the given path pattern. The `METHOD` refers to a HTTP method of the request, such as `GET`, `POST` and so on, in **lowercase**. Thus, the actual routing methods are `router.get()`, `router.post()`, etc. See the <a href="#routing-methods" jump-to-id="routing-methods">Routing methods</a> below for the complete list.

To avoid chaos, this method accepts only one callback function. If the `callback` is provided with a non-function value, then the value will be regarded as response body, as a shorthand method:

```js
// register a route for 'GET /greet'
router.get('/greet', (req, res) => {
  res.send('Hello new world!');
});

// in short
router.get('/greet', 'Hello new world!');
```

With this router, you will get the following results:

```md
✅  GET  /greet
❌  POST /greet
❌  GET  /knock
❌  GET  /greet/ding
❌  GET  https://a.com/greet
```

As everything inside service workers is asynchronous, you may want to do some asynchronous stuff in the `callback` block:

```js
router.put('/posts/:id', async (req, res) => {
  const posts = await storage.get('posts');
  posts[req.params.id] = await req.text();

  await storage.set('posts', posts);

  res.sendStatus(200);
});
```

#### Routing methods

Up to now, we support the following routing methods:

- get
- post
- put
- head
- delete
- options

### router.all()

```js
router.all(path, callback): this
router.all(path, responseBody): this
```

| Param | Type | Description |
| --- | :-: | --- |
| `path` | string &#124; RegExp | An [express style](http://expressjs.com/en/guide/routing.html) route path. |
| `callback` | (req, res) => void | A Routing handler which will be executed when the route is matched. The `callback` function receives two parameters:<br> <ol><li>`req`: A <a href="#request" jump-to-id="request">`Request()`</a> object.</li><li>`res`: A <a href="#response" jump-to-id="response">`Response()`</a> object.</li></ol> |

If the second argument is provided with a non-function value, then the value will be regarded as response body:

| Param | Type | Description |
| --- | :-: | --- |
| `path` | string &#124; RegExp | An [express style](http://expressjs.com/en/guide/routing.html) route path. |
| `responseBody` | any | The body to be sent. This can be one of [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [Array](https://developer.mozilla.org/en-US/docs/Glossary/array), [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), and [Primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) except `Symbol`. |

This method like the <a href="#router-method" jump-to-id="router-method">`router.METHOD()`</a> method but for **all types of HTTP requests**.

```js
// register a route for '/whatever'
router.all('/whatever', (req, res) => {
  res.send('Yoooo');
});

// in short
router.all('/whatever', 'Yoooo');
```

With this router, you will get the following results:

```md
✅  GET  /whatever
✅  POST /whatever
❌  GET  /greet
❌  GET  /whatever/yo
❌  GET  https://a.com/whatever
```

### router.base()

```js
router.base(baseURL?): Router
```

| Param | Type | Description |
| --- | :-: | --- |
| `baseURL` | string | The base URL of the new router. |

This method creates a **new router** with the given `baseURL`. A base URL can be either an absolute or a relative path, the relative `baseURL` will be resolved to current origin.

```js
// router.baseURL = 'http://localhost:3000'

// when giving a relative path
const apiRouter = router.base('/api');

console.log(apiRouter === router); // false
console.log(apiRouter.baseURL); // http://localhost:3000/api

// when giving an absolute path
const remoteRouter = router.base('https://a.com');

console.log(remoteRouter.baseURL); // https://a.com
```

When the base URL of a router is specified, all routes will base on the given `baseURL`:

```js
const apiRouter = router.base('/api');

apiRouter.get('/greet', 'Hello new world');
```

```md
✅  GET  /api/greet
❌  GET  /greet
```

### router.route()

```js
router.route(path?): ScopedRouter
```

| Param | Type | Description |
| --- | :-: | --- |
| `path` | string | The route path for this sub router. |

`router.route()` method creates a sub router of which all route paths are bound with the given `path`. The sub router contains all routing methods from <a href="#router" jump-to-id="router">`Router`</a>, use this method to avoid duplicate route naming and thus typing errors:

```js
router.route('/post/:id')
  .get(async (req, res) => {
    const posts = await storage.get('posts');

    if (posts.hasOwnProperty(req.params.id)) {
      res.send(posts[req.params.id]);
    } else {
      res.sendStatus(404);
    }
  })
  .put(async (req, res) => {
    const posts = await storage.get('posts');
    posts[req.params.id] = await req.text();

    await storage.set('posts', posts);

    res.sendStatus(200);
  })
  .delete(async (req, res) => {
    const posts = await storage.get('posts');
    delete posts[req.params.id];

    await storage.set('posts', posts);

    res.sendStatus(200);
  });
```

## Request

The Request object is inherited from the [native Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request). It represents the HTTP request that is captured by your router. In this documentation, we are using `req` to represent the `Request` objects.

### req.baseURL

- Type: `string`

The `req.baseURL` property is literally equivalent to <a href="#router-baseurl" jump-to-id="router-baseurl">`router.baseURL`</a> property of current router.

```js
// assuming you are running on http://localhost:3000
router.base('/api').get('/whatever', (req, res) => {
  console.log(req.baseURL); // 'http://localhost:3000/api'
  console.log(req.baseURL === router.baseURL); // true
});

router.base('https://a.com/api').get('/whatever', (req, res) => {
  console.log(req.baseURL); // 'https://a.com/api'
});
```

### req.path

- Type: `string`

The `req.path` property contains the path part of the current request.

```js
// GET /api/users/1
router.base('/api').get('/users/:id', (req, res) => {
  console.log(req.path); // '/user/1'
});

router.base('/').get('/api/users/:id', (req, res) => {
  console.log(req.path); // '/api/users/1'
});
```

### req.params

- Type: `object`

The `req.params` property contains properties mapped the route parameters. For example, if you have a route `/users/:id`, then the `id` property is available as `req.params.id`. All parameters will be parsed as `string`.

```js
// GET /users/1
router.get('/users/:id', (req, res) => {
  console.log(req.params); // { id: '1' }
});

// GET /api/users/1/videos/1024
router.base('api').get('/users/:userID/videos/:videoID', function (req, res) {
  res.send(req.params); // { userID: '1', videoID: '1024' }
});
```

<p class="tip">Since we are using the [express](http://expressjs.com) style routing system, you can find more information about `req.params` in [express/routing](http://expressjs.com/en/guide/routing.html#route-parameters) page.</p>

### req.query

- Type: `object`

The `req.query` property contains a property for each query string parameter from the request. You can use the nested query style from [qs](https://github.com/ljharb/qs) module. All parameters will be parsed as `string`.

```js
// GET /search?q=dolphin
console.log(req.query); // { q: 'dolphin' }

// GET /activity?user=dolphin&year[from]=2016
console.log(req.query); // { user: 'dolphin', year: { from: '2016' } }
```

### req.headers

- Type: `Headers`

The `req.headers` property is inherited from the [native Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request/headers). It contains the [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object associated with the request.

#### Methods

See https://developer.mozilla.org/en-US/docs/Web/API/Headers.

```js
req.headers.get('content-type');
```

### req.method

- Type: `string`

The `req.method` property is inherited from the [native Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request/method). It contains a string corresponding to the HTTP method of the request: GET, POST, PUT, and so on.

```js
// GET /whatever
console.log(req.method); // 'GET'
```

### req.url

- Type: `string`

The `req.url` property is inherited from the [native Request object](https://developer.mozilla.org/en-US/docs/Web/API/Request/url). It contains the full URL of the request.

```js
// assuming you are running on http://localhost:3000
// GET /whatever
console.log(req.url); // http://localhost:3000/whatever
```

### req.clone()

```js
req.clone(): Request
```

Creates a copy of the current <a href="#request" jump-to-id="request">`Request`</a> object. This will be useful when you want to parse the request body multiple times.

```js
req.clone().text();
req.clone().blob(); // OK

req.text();
req.blob(); // TypeError: Body has already been consumed.
```

### req.arrayBuffer()

```js
req.arrayBuffer(): Promise<ArrayBuffer>
```

The `req.arrayBuffer()` method is inherited from the [native Request object](https://developer.mozilla.org/en-US/docs/Web/API/Body/arrayBuffer). Call this method to parse the request body as `ArrayBuffer`.

```js
req.arrayBuffer().then(body => {
  console.log(body); // ArrayBuffer{}
});
```

### req.blob()

```js
req.blob(): Promise<Blob>
```

The `req.blob()` method is inherited from the [native Request object](https://developer.mozilla.org/en-US/docs/Web/API/Body/blob). Call this method to parse the request body as `Blob`.

```js
req.blob().then(body => {
  console.log(body); // Blob{}
});
```

### req.json()

```js
req.json(): Promise<Object>
```

The `req.json()` method is inherited from the [native Request object](https://developer.mozilla.org/en-US/docs/Web/API/Body/json). Call this method to parse the request body as a JSON object.

```js
req.json().then(body => {
  console.log(body); // { ... }
});
```

### req.text()

```js
req.text(): Promise<string>
```

The `req.text()` method is inherited from the [native Request object](https://developer.mozilla.org/en-US/docs/Web/API/Body/text). Call this method to parse the request body as a text string.

```js
req.text().then(body => {
  console.log(body); // '...'
});
```

## Response

The `Response` object represents the HTTP response to send when the router gets an HTTP request. In this documentation, we are using `res` to represent the `Response` objects.

### res.headers

- Type: `Headers`

The `res.headers` is a native [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object which contains the response headers to be sent.

#### Methods

See https://developer.mozilla.org/en-US/docs/Web/API/Headers.

```js
res.headers.set('content-type', 'application/json');
```

### res.type()

```js
res.type(type): this
```

| Param | Type | Description |
| --- | :-: | --- |
| `type` | string | The MIME type to be set. |

Sets the `Content-Type` HTTP header to the MIME type using the [mime-component](https://github.com/component/mime).

```js
res.type('json'); // 'application/json'
res.type('text/plain'); // 'text/plain'
```

### res.status()

```js
res.status(code): this
```

| Param | Type | Description |
| --- | :-: | --- |
| `code` | number | The HTTP status for the response. |

Sets the HTTP status for this response.

```js
res.status(200);
res.status(404).send('Not Found');
```

### res.json()

```js
res.json(body?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `body` | any, _optional_ | The response body to be sent. This can be any JSON compatible type includes [Array](https://developer.mozilla.org/en-US/docs/Glossary/array), [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), and [Primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) except `Symbol`. |

Sends a JSON response, the given `body` will be converted to a JSON string using [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

```js
res.json(null);
res.json({ user: 'dolphin' });
```

### res.send()

```js
res.send(body?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `body` | any, _optional_ | The response body to be sent. This can be one of [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [Array](https://developer.mozilla.org/en-US/docs/Glossary/array), [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), and [Primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive) except `Symbol`. |

Sends the HTTP response with given `body` as the response body.

When the `body` is provided with a `string`, then the `Content-Type` response header will be set to `'text/html'`.

```js
// Content-Type: text/html
res.send('<main>Service Mocker</main>');
```

When the `body` is an `ArrayBuffer`, then the `Content-Type` response header will be `'application/octet-stream'` (as a binary type).

```js
// Content-Type: application/octet-stream
res.send(new ArrayBuffer(1024));
```

When the `body` is a `Blob` object, then the `Content-Type` response header will be the type of this `Blob` object.

```js
// Content-Type: image/png
res.send(new Blob([], {
  type: 'image/png',
}));
```

And if the `body` is an `Array` or `Object`, then the <a href="#res-json" jump-to-id="res-json">`res.json()`</a> method will be invoked.

```js
res.send({ user: 'dolphin '}); // => res.json({ user: 'dolphin '})
res.send([1, 2, 3]); // => res.json([1, 2, 3])
```

### res.sendStatus()

```js
res.sendStatus(code): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `code` | number | The HTTP status for the response. |

Sets the response HTTP status code to the given `code` and send its string representation as the response body.

This method is equivalent to `res.status(code).send(statusText)`.

```js
res.sendStatus(200); // => res.status(200).send('OK')
res.sendStatus(404); // => res.status(404).send('Not Found')
```

### res.end()

```js
res.end(): void
```

Ends the response processing and passes the response to [`FetchEvent.respondWith()`](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent/respondWith). Simply call this method will end the response **WITHOUT** any data, if you want to respond with data, use <a href="#res-send" jump-to-id="res-send">`res.send()`</a> or <a href="#res-json" jump-to-id="res-json">`res.json()`</a> method.

```js
res.end();
res.status(200).end();
```

<p class="danger">If an HTTP request matches your route and you didn't respond to it, the request will be hanging thus you will not receive any data.</p>

### res.forward()

```js
res.forward(input, init?): void
```

| Param | Type | Description |
| --- | :-: | --- |
| `input` | string &#124; Request | The resource that you wish to fetch. This  can either be a `string` or a [native `Request` object](https://developer.mozilla.org/en-US/docs/Web/API/Request). |
| `init` | object, _optional_ | The [request init options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters). |

Forwards the request to another destination. The forwarded request will **NOT** be captured again.

This method is useful for building a proxy middleware.

```js
// forward a simple request
router.get('/user/:id', (req, res) => {
  res.forward(`/users/${req.params.id}`);
});

// forward to a remote server
router.get('/videos/:id', (req, res) => {
  res.forward(`https://a.com/videos/${req.params.id}`);
});

// forward a request with body
router.post('/posts/:id', async (req, res) => {
  const content = await req.text();

  res.forward(`/articles/${req.params.id}`, {
    method: 'POST',
    headers: req.headers,
    body: content,
  });
});

// or you can simply rely on our parsing mechanism
router.post('/posts/:id', (req, res) => {
  res.forward(`/articles/${req.params.id}`);
});
```
