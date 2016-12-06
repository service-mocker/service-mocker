import { Client } from '../../src/client/';

if ('serviceWorker' in navigator) {
  const client = new Client('sw.js', { scope: '/' });
  window.client = client;

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
}
