import { sendMessageRequest } from 'service-mocker/utils/';

/**
 * Request client to send a http request
 */
export async function sendRequest(url, init = {}) {
  const message = {
    url,
    init,
    request: 'FETCH',
  };

  let data;

  if (self.clients) {
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
    });

    data = await Promise.race(
      clients.map((cli) => sendMessageRequest(cli, message, Infinity)),
    );
  } else {
    data = await sendMessageRequest(self, message, Infinity);
  }

  data.headers = new Headers(data.headers);

  return data;
}
