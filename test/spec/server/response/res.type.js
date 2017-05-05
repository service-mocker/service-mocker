import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import mime from 'mime-component';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function () {
  const { router } = createServer();

  describe('res.type("aaa")', () => {
    it(`should send a response with contentType "${mime.lookup('json')}"`, async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.type('json').send({});
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
    });
  });

  describe('res.type("aaaa/bbbb")', () => {
    it(`should send a response with contentType "text/plain"`, async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.type('text/plain').send('ServiceMocker');
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal('text/plain');
    });
  });
}
