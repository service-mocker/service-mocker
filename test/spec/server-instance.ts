import { createServer, Server } from '../../src/server/';

export const server: Server = createServer();

(self as any).server = server;
