import { uniquePath } from './unique-path';

/**
 * Send fake XMLHttpRequest
 *
 * @param  {object} options
 * @return {Promise<Result>}
 */
export async function fakeRequest(options) {
  const path = uniquePath();
  const xhr = new XMLHttpRequest();

  xhr.open(options.method || 'GET', path, true);

  if (options.preprocess) {
    options.preprocess(xhr);
  }

  const promise = new Promise((resolve) => {
    self.addEventListener('fetch', (event) => {
      const url = new URL(event.request.url, location.href);

      if (url.pathname === path) {
        event.respondWith(options.response ? options.response.clone() : new Response('fake request'));

        resolve({
          xhr,
          request: event.request.clone(),
        });
      }
    });
  });

  xhr.send(options.body);

  await new Promise((resolve) => {
    xhr.addEventListener('load', resolve);
  });

  return promise;
}
