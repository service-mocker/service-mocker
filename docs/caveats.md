## Path restriction

As per [spec](https://w3c.github.io/ServiceWorker/#selection):

> the service worker client attempts to consult a service worker registration whose scope url [matches](https://w3c.github.io/ServiceWorker/#match-service-worker-registration) its creation URL.

That is to say, **the max scope for a service worker is the location of the worker script itself.**

So if you are serving the server script from a non-root path, e.g. `'assets/js/server.js'`, by default you will get:

| location | matches |
| -------- | :-------: |
| `/` | ❌ |
| `/a/b` | ❌ |
| `assets/js/index.html` | ✅ |
| `assets/js/what/ever` | ✅ |

If you want to override the path restriction, you need to add a `Service-Worker-Allowed` header to the response. The following is an example of [webpack-dev-server](https://github.com/webpack/webpack-dev-server):

```js
const devServer = new WebpackDevServer(compiler, {
  ...
  // override service worker path restriction
  headers: {
    'Service-Worker-Allowed': '/'
  }
});
```

For more information, please check the [Service Worker Script Response](https://w3c.github.io/ServiceWorker/#service-worker-script-response) section.

## Promises in Safari

Up to now, the unhandled promise rejection will still be swallowed silently. Since we have been using [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) everywhere in Service Mocker, it may be hard to debug with Safari when something goes wrong.

## Multiple apps on same port

If you are developing multiple apps on same port (e.g. `localhost:3000`), the requests may be intercepted unexpectedly when you switch to a non-mocker project. By then, you'd better unregister the server script:

- For Chrome: open [chrome://serviceworker-internals](chrome://serviceworker-internals), find your script and click the `unregister` button.
- For Firefox: open [about:debugging#workers](about:debugging#workers), find your script and click the `unregister` button.

## Cross-browser `body.formData()` support

Currently, browsers' support for `body.formData()` is really limited. Avoid using `req.formData()` in your code.

## Forbidden header names

Due to the [security restrictions](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name), we are not able to control the following headers:

- Accept-Charset
- Accept-Encoding
- Access-Control-Request-Headers
- Access-Control-Request-Method
- Connection
- Content-Length
- Cookie
- Cookie2
- Date
- DNT
- Expect
- Host
- Keep-Alive
- Origin
- Proxy-
- Sec-
- Referer
- TE
- Trailer
- Transfer-Encoding
- Upgrade
- Via

