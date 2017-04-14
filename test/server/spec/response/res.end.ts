import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import * as mime from 'mime-component';

import {
  uniquePath,
  sendRequest,
} from '../../../helpers/';

export default function() {
  const { router } = createServer();

  describe('res.end()', () => {
    it(`should send a response with default contentType "${mime.lookup('text')}"`, async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.end();
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('text'));
    });

    describe('when request method is HEAD', () => {
      it('should send an empty response body', async () => {
        const path = uniquePath();

        router.head(path, (_req, res) => {
          res.send('whatever');
        });

        const { body } = await sendRequest(path, {
          method: 'HEAD',
        });

        expect(body).to.be.empty;
      });
    });

    describe('when status code is null-body-status', () => {
      it('should send an empty response body', async function () {
        if (/Edge/.test(navigator.userAgent)) {
          // set a null status in IE Edge will raise a `TypeMismatchError` Error
          this.skip();
        }

        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.status(204).send('whatever');
        });

        const { body } = await sendRequest(path);

        expect(body).to.be.empty;
      });
    });
  });
}
