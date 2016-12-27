import { createClient, IMockerClient } from '../../src/client/';

export const client: IMockerClient = createClient('server.js');

(self as any).client = client;
