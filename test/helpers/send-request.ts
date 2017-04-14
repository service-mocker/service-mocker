import { sendMessageRequest } from 'service-mocker/utils/';

export type ClientResponse = {
  headers: Headers,
  body: any,
  status: number,
  statusText: string,
};

/**
 * Request client to send a http request
 */
export async function sendRequest(url: string, init: RequestInit = {}): Promise<ClientResponse> {
  if (init.body instanceof FormData) {
    init.body = 'FORM_DATA';
  }

  const message = {
    url, init,
    request: 'FETCH',
  };

  let data: any;

  if (typeof clients !== 'undefined') {
    const matchedClients = await clients.matchAll({
      includeUncontrolled: true,
    });

    data = await Promise.race(
      matchedClients.map(cli => sendMessageRequest(cli, message, Infinity)),
    );
  } else {
    data = await sendMessageRequest(self, message, Infinity);
  }

  data.headers = new Headers(data.headers);

  return data;
}
