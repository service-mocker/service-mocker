import { createClient, IMockerClient } from '../../src/client/';

const forceLegacy = /legacy/.test(location.hash);

export const client: IMockerClient = createClient('server.js', forceLegacy);

(self as any).client = client;
