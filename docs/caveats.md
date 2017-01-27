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

