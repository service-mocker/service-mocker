## Promises in Safari

Up to now, the unhandled promise rejection will still be swallowed silently. Since we have been using [async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) everywhere in Service Mocker, it may be hard to debug with Safari when something goes wrong.

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

