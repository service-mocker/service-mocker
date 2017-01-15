## What is Service Mocker?

Service Mocker is an API mocking framework for frontend developers. With the power of service workers, we can easily set up mocking services without any real server. It sets developers free from intricate workflows, complex documentations and endless proxies from server to server.

## Installation

Since you are likely to run Service Mocker only during development, you will need to add `service-mocker` as a devDependency:

```bash
npm install service-mocker --save-dev
```

## Hello new world

<p class="tip">Before starting, make sure you are using a develop server (eg `webpack-dev-server`) to serve your static assets. </p>

A typical mocker includes two parts: `client` and `server`. First, let's create a server script named `server.js`:

```js
// server.js
import { createServer } from 'service-mocker/server';

const mocker = createServer();

mocker.router.get('/greet', (req, res) => {
  res.send('Hello new world!');
});
```

Then, we need to write a client script to connect to the server:

```js
// app.js
import { createClient } from 'service-mocker/client';

const client = createClient('server.js'); // the path to your server script

client.ready.then(async () => {
  const response = await fetch('/greet');

  console.log(await response.text());
});
```

Then create a `.html` file and include **ONLY** client script:

```html
<script src="app.js"></script>
```

Now navigate the browser to your develop server, assuming it's `http://localhost:3000`. Open the console and you will see a `Hello new world!` message lying under several connection logs:

```
> [mocker:modern] connection established
>
> Hello new world!
```

## Integrating into current project

It's quite easy to integrate Service Mocker into your current project, all you need to do is to put the bootstrapping code into `client.ready.then()` block:

```js
client.ready.then(() => {
  // bootstrapping...
});
```

However, as long as you may only want to use Service Mocker during development, it's recommended to pack your bootstrapping code into a reusable function then split into two entry points:

```js
// app.js
export function runMyApp() {
  // bootstrapping...
}
```

```js
// entry-dev.js
import { createClient } from 'service-mocker/client';
import { runMyApp } from './app';

const client = createClient('server.js');
client.ready.then(runMyApp);
```

```js
// entry-prod.js
import { runMyApp } from './app';

runMyApp();
```

## What's next...

Now you are likely to understand the basic ideas of Service Mocker, for further development, you may need to check <a router-link="/api" href="API.md">API documentations</a>.

## FAQ

### Why my mocker always runs in legacy mode?

As per [service worker spec](https://github.com/w3c/ServiceWorker/blob/master/explainer.md#getting-started):

<p class="warning">The registering page must have been served securely (HTTPS without cert errors)</p>

So if you are running on an insecure page other than `localhost`, you could only bootstrap mocker in legacy mode.


### I got a `Module parse failed: ./~/statuses/codes.json` error from webpack.

Using the [json-loader](https://github.com/webpack/json-loader) will resolve this problem, the following is an example of configuration:

```js
module.exports = {
  resolve: {
    extensions: ['', '.js', '.json'],
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: [
        'src',
        'test',
      ],
    }, {
      test: /\.json$/,
      loader: 'json',
    }],
  },
};
```

<p class="warning">If you are already using the `json-loader` but still getting this error, please check if `node_modules` is being excluded from loader config.</p>
