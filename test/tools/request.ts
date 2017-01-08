import { sendMessageRequest } from 'service-mocker/utils/';

export async function request(url: string, init?: RequestInit) {
  const message = {
    url, init,
    request: 'FETCH',
  };

  let data: any;

  if (self.clients) {
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
    });

    data = await Promise.race(
      clients.map(cli => sendMessageRequest(cli, message, Infinity)),
    );
  } else {
    data = await sendMessageRequest(self, message, Infinity);
  }

  return data.result;
}
