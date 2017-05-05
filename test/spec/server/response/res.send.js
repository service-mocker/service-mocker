import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import mime from 'mime-component';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function () {
  const { router } = createServer();

  describe('res.send()', () => {
    it('should end up with empty response', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.send();
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('text'));
      expect(body).to.be.empty;
    });

    it('should be able to do some asynchronous stuffs', async () => {
      const path = uniquePath();

      router.post(path, async (req, res) => {
        const body = await req.text();
        res.send(body);
      });

      const { body } = await sendRequest(path, {
        method: 'POST',
        body: 'whatever',
      });

      expect(body).to.equal('whatever');
    });

    it('should not override current contentType', async () => {
      const path = uniquePath();
      const contentType = mime.lookup('html');

      router.get(path, (_req, res) => {
        res.type(contentType).send({});
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(contentType);
    });
  });

  describe('res.send(Response)', () => {
    it('should respond with native Response object', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.send(new Response('whatever'));
      });

      const { body } = await sendRequest(path);

      expect(body).to.equal('whatever');
    });
  });

  describe('res.send(String)', () => {
    it(`should respond with contentType "${mime.lookup('html')}"`, async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.send('<div>Hello new world</div>');
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('html'));
    });
  });

  describe('res.send(ArrayBuffer)', () => {
    it(`should send ArrayBuffer with default contentType "${mime.lookup('bin')}"`, async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.send(new ArrayBuffer(8));
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('bin'));
    });
  });

  describe('res.send(Blob)', () => {
    it(`should send Blob with default contentType "${mime.lookup('bin')}"`, async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.send(new Blob());
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('bin'));
    });

    it(`should send Blob with it's own contentType`, async () => {
      const path = uniquePath();
      const contentType = mime.lookup('png');

      router.get(path, (_req, res) => {
        res.send(new Blob([], { type: contentType }));
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(contentType);
    });
  });

  describe('res.send(JSONLikes)', () => {
    it('should convert number to JSON', async () => {
      const path = uniquePath();
      const num = 123;

      router.get(path, (_req, res) => {
        res.send(num);
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(body).to.equal(JSON.stringify(num));
    });

    it('should convert boolean to JSON', async () => {
      const path = uniquePath();
      const bool = true;

      router.get(path, (_req, res) => {
        res.send(bool);
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(body).to.equal(JSON.stringify(bool));
    });

    it('should convert object to JSON', async () => {
      const path = uniquePath();
      const obj = { id: 123 };

      router.get(path, (_req, res) => {
        res.send(obj);
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(JSON.parse(body)).to.deep.equal(obj);
    });
  });
}
