import { createClient } from '../../src/client/';

import Promise from 'promise-polyfill';
import 'whatwg-fetch';

if (!(window as any).Promise) {
  (window as any).Promise = Promise;
}

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
