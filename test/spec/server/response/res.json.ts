import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import * as mime from 'mime-component';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function() {
  const { router } = createServer();

  describe('res.json()', () => {
    it('should send a response with JSON type', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.json({});
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
    });

    it('should not override previous content-type', async () => {
      const path = uniquePath();
      const contentType = mime.lookup('html');

      router.get(path, (_req, res) => {
        res.type(contentType).json({});
      });

      const { headers } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(contentType);
    });
  });

  describe('res.json(Object)', () => {
    it('should send JSON response for objects', async () => {
      const path = uniquePath();
      const obj = { whoami: 'ServiceMocker' };

      router.get(path, (_req, res) => {
        res.json(obj);
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(JSON.parse(body)).to.deep.equal(obj);
    });

    it('should send JSON response for null', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.json(null);
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(JSON.parse(body)).to.deep.equal(null);
    });
  });

  describe('res.json(Array)', () => {
    it('should send JSON response for arrays', async () => {
      const path = uniquePath();
      const arr = [1, 2, 3];

      router.get(path, (_req, res) => {
        res.json(arr);
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(JSON.parse(body)).to.deep.equal(arr);
    });
  });

  describe('res.json(primitives)', () => {
    it('should send JSON response for strings', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.json('ServiceMocker');
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(JSON.parse(body)).to.deep.equal('ServiceMocker');
    });

    it('should send JSON response for numbers', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.json(123);
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(JSON.parse(body)).to.deep.equal(123);
    });

    it('should send JSON response for booleans', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.json(true);
      });

      const { headers, body } = await sendRequest(path);

      expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      expect(JSON.parse(body)).to.deep.equal(true);
    });
  });
}
