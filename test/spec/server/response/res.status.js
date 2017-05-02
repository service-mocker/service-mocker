import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import httpStatus from 'statuses';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function () {
  const { router } = createServer();

  describe('res.status(code)', () => {
    describe('with well-known HTTP status codes', () => {
      it('should send a response with 202 status', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.status(202).end();
        });

        const { status } = await sendRequest(path);

        expect(status).to.equal(202);
      });

      it(`should send a response with "${httpStatus[202]}" statusText`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.status(202).end();
        });

        const { statusText } = await sendRequest(path);

        expect(statusText).to.equal(httpStatus[202]);
      });
    });

    describe('with unknown status code', () => {
      it('should receive a request with status 222', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.status(222).end();
        });

        const { status, statusText } = await sendRequest(path);

        expect(status).to.equals(222);
        expect(statusText).to.equal('222');
      });
    });
  });
}
