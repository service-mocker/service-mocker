import {
  IMockerServer,
  MockerServer,
} from './server';

export { IMockerServer };

export function createServer(): IMockerServer {
  return new MockerServer();
}
