import 'es6-promise/auto';
import 'whatwg-fetch';

import { createClient } from '../../src/client/';

const client = createClient('sw.js');
(window as any).client = client;

client.ready.then(reg => {
  console.log(reg);

  fetch('/api')
    .then(res => {
      console.log(res);

      if (!res.ok) {
        return Promise.reject(`${res.url} ${res.status} ${res.statusText}`);
      }

      return res.text();
    })
    .then(context => {
      console.info(`fetch success: ${context}`);
    })
    .catch(err => {
      console.error(`fetch failed: ${err}`);
    });
});
