import {
  IMockerServer,
  MockerServer,
} from './server';

export { IMockerServer };

export function createServer(baseURL?: string): IMockerServer {
  return new MockerServer(baseURL);
}
