# Service Mocker
[![CircleCI](https://circleci.com/gh/service-mocker/service-mocker/tree/develop.svg?style=shield)](https://circleci.com/gh/service-mocker/service-mocker)
[![Coverage](https://img.shields.io/codecov/c/github/service-mocker/service-mocker/develop.svg)](https://codecov.io/gh/service-mocker/service-mocker/branch/develop)
[![Version](https://img.shields.io/npm/v/service-mocker.svg)](https://www.npmjs.com/package/service-mocker)
[![Downloads](https://img.shields.io/npm/dt/service-mocker.svg)](https://www.npmjs.com/package/service-mocker)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)

[![Build Status](https://saucelabs.com/browser-matrix/Service_Mocker.svg)](https://saucelabs.com/u/Service_Mocker)

Service Mocker is an API mocking framework for frontend developers. With the power of [service workers](https://w3c.github.io/ServiceWorker/), we can easily set up mocking services without any real servers. It sets developers free from intricate workflows, complex documentations and endless proxies from server to server.

> Q: Is Service Worker ready?
>
> A: No, [not yet](https://jakearchibald.github.io/isserviceworkerready/).
>
> Q: Is Service Mocker ready?
>
> A: Yes! Welcome to the future!

```js
// server.js
import { createServer } from 'service-mocker/server';

const { router } = createServer();

router.get('/greet', (req, res) => {
  res.send('Hello new world!');
});
```

## Installation

```
npm install service-mocker --save-dev
```

## Docs & Demos

- [Documentation](https://service-mocker.js.org)
- [Examples](https://github.com/service-mocker/service-mocker-demo)

## Team

[![Dolphin Wood](https://avatars2.githubusercontent.com/u/6022672?v=3&s=130)](https://github.com/idiotWu) | [![Vincent Bel](https://avatars3.githubusercontent.com/u/6076919?v=3&s=130)](https://github.com/VincentBel)
---|---
[Dolphin Wood](https://github.com/idiotWu) | [Vincent Bel](https://github.com/VincentBel)

## License

[MIT](LICENSE)
