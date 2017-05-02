import {
  MockerServer,
} from './server';

/**
 * Constructs a new Server instance
 *
 * @param  {string} baseURL The base URL of all routes, default is '/'
 * @return {MockerServer}
 */
export function createServer(baseURL = '/') {
  return new MockerServer(baseURL);
}
