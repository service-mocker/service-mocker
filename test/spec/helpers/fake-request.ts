import { uniquePath } from './unique-path';

export type Options = {
  body?: any,
  method?: string,
  response?: Response,
  preprocess?(xhr: XMLHttpRequest): void,
};

export type Result = {
  xhr: XMLHttpRequest,
  request: Request,
};

/**
 * Send fake XMLHttpRequest
 */
export async function fakeRequest(options: Options = {}): Promise<Result> {
  const path = uniquePath();
  const xhr = new XMLHttpRequest();

  xhr.open(options.method || 'GET', path, true);

  if (options.preprocess) {
    options.preprocess(xhr);
  }

  const promise = new Promise<Result>(resolve => {
    self.addEventListener('fetch', (event: FetchEvent) => {
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

  await new Promise(resolve => {
    xhr.addEventListener('load', resolve);
  });

  return promise;
}
