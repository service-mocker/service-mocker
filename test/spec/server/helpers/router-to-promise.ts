import { uniquePath } from './unique-path';
import { sendRequest } from './send-request';
import { RESPONSE } from '../../mock-response';
import { createServer } from 'service-mocker/server';

export const requestToPromise = routerToPromise.bind(null, true);
export const responseToPromise = routerToPromise.bind(null, false);

async function routerToPromise(
  returnReq: boolean,
  path?: string | null,
  requsetInfo?: string | null,
  init: RequestInit = {},
): Promise<any> {
  const { router } = createServer();
  const p = uniquePath();

  const method = init.method ? init.method.toLowerCase() : 'get';

  const promise = new Promise((resolve) => {
    router[method](path || p, (req, res) => {
      resolve(returnReq ? req : res);
      res.send(RESPONSE);
    });
  });

  await sendRequest(requsetInfo || p, init);

  return promise;
}
