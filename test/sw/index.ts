import { Server } from '../../src/server/';

const mocker = new Server();
(self as any).mocker = mocker;
