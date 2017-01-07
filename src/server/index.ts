import {
  IMockerServer,
  MockerServer,
} from './server';

export function createServer(): IMockerServer {
  return new MockerServer();
}
