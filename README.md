# Service Mocker

[![CircleCI branch](https://img.shields.io/circleci/project/github/service-mocker/service-mocker/develop.svg)](https://circleci.com/gh/service-mocker/service-mocker)
[![Coverage](https://img.shields.io/codecov/c/github/service-mocker/service-mocker/develop.svg)](https://codecov.io/gh/service-mocker/service-mocker/branch/develop)
[![Version](https://img.shields.io/npm/v/service-mocker.svg)](https://www.npmjs.com/package/service-mocker)
[![Downloads](https://img.shields.io/npm/dt/service-mocker.svg)](https://www.npmjs.com/package/service-mocker)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)

[![Build Status](https://saucelabs.com/browser-matrix/Service_Mocker.svg)](https://saucelabs.com/u/Service_Mocker)

Service Mocker is an API mocking framework for frontend developers. With the power of [service workers](https://w3c.github.io/ServiceWorker/), we can easily set up mocking services **without any real servers**. It sets developers free from intricate workflows, complex documentations and endless proxies from server to server.

> Q: Is Service Worker ready?
>
> A: No, [not yet](https://jakearchibald.github.io/isserviceworkerready/).
>
> Q: Is Service Mocker ready?
>
> A: Yes! Welcome to the future!

## Installation

Since you are likely to run Service Mocker only during development, you will need to add `service-mocker` as a devDependency:

```
npm install service-mocker --save-dev
```

For legacy browsers, you may also need the [polyfills](https://github.com/service-mocker/service-mocker-polyfills):

```
npm install service-mocker-polyfills --save-dev
```

## Features

- **No server is required**.
- **Real** HTTP requests and responses that can be inspected in modern browsers.
- [express](https://github.com/expressjs/express) style routing system.
- IE10+ compatibility.

## Hello new world

A typical mocker includes two parts: `client` and `server`. First, let's create a server script named `server.js`:

```js
// server.js
import { createServer } from 'service-mocker/server';

const { router } = createServer();

router.get('/greet', (req, res) => {
  res.send('Hello new world!');
});

// or you can use the shorthand method
router.get('/greet', 'Hello new world!');
```

Then, we need to write a client script to connect to the server:

```js
// app.js
import 'service-mocker-polyfills';
import { createClient } from 'service-mocker/client';

const client = createClient('path/to/server.js');

client.ready.then(async () => {
  const response = await fetch('/greet');

  console.log(await response.text());
});
```

After that, create a `.html` file and include **ONLY** the client script:

```html
<script src="app.js"></script>
```

Now navigate your browser to your local dev server (e.g. `http://localhost:3000`). Open the console and you will see the following messages:

```
> [mocker:modern] connection established
>
> Hello new world!
```

Welcome to the future :clap:.

## Docs & Demos

- [Documentation](https://service-mocker.js.org)
- [Examples](https://github.com/service-mocker/service-mocker-demo)

## Team

[![Dolphin Wood](https://avatars2.githubusercontent.com/u/6022672?v=3&s=130)](https://github.com/idiotWu) | [![Vincent Bel](https://avatars3.githubusercontent.com/u/6076919?v=3&s=130)](https://github.com/VincentBel)
:---:|:---:
[Dolphin Wood](https://github.com/idiotWu) | [Vincent Bel](https://github.com/VincentBel)

## License

[MIT](LICENSE)
