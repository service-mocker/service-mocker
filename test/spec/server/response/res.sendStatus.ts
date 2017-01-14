import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import * as mime from 'mime-component';
import * as httpStatus from 'statuses';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function() {
  const { router } = createServer();

  describe('res.sendStatus(code)', () => {
    it(`should send response with text type`, async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.sendStatus(200);
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equals(mime.lookup('text'));
    });

    describe('with well-known HTTP status codes', () => {
      it('should send a response with 202 status', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(202);
        });

        const { status } = await sendRequest(path);

        expect(status).to.equal(202);
      });

      it(`should set statusText to ${httpStatus[202]}`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(202);
        });

        const { statusText } = await sendRequest(path);

        expect(statusText).to.equal(httpStatus[202]);
      });

      it('should set response body to statusText', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(202);
        });

        const { body } = await sendRequest(path);

        expect(body).to.equal(httpStatus[202]);
      });
    });

    describe('with unknown status codes', () => {
      it('should respond with status 233', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(233);
        });

        const { status } = await sendRequest(path);

        expect(status).to.equals(233);
      });

      it('should set statusText to the status code', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(233);
        });

        const { statusText } = await sendRequest(path);

        expect(statusText).to.equal('233');
      });

      it('should set response body to the status code', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(233);
        });

        const { body } = await sendRequest(path);

        expect(body).to.equal('233');
      });
    });
  });
}
