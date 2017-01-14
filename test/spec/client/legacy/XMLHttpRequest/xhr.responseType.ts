import { expect } from 'chai';

import { fakeRequest } from '../../../helpers/';

export default function() {
  describe('xhr.responseType', () => {
    it('should return type ArrayBuffer', async () => {
      const { xhr } = await fakeRequest({
        preprocess(xhr) {
          xhr.responseType = 'arraybuffer';
        },
        response: new Response(new ArrayBuffer(8)),
      });

      expect(xhr.response).to.be.instanceof(ArrayBuffer);
    });

    it('should return type Blob', async () => {
      const { xhr } = await fakeRequest({
        preprocess(xhr) {
          xhr.responseType = 'blob';
        },
        response: new Response(new Blob()),
      });

      expect(xhr.response).to.be.instanceof(Blob);
    });

    it('should return type Document', async () => {
      const { xhr } = await fakeRequest({
        preprocess(xhr) {
          xhr.responseType = 'document';
        },
        response: new Response('<p>whatever</p>', {
          headers: { 'content-type': 'text/html' },
        }),
      });

      expect(xhr.response).to.be.instanceof(Document);
    });

    it('should return type JSON', async function() {
      const { xhr } = await fakeRequest({
        preprocess(xhr) {
          xhr.responseType = 'json';
        },
        response: new Response(JSON.stringify({}), {
          headers: { 'content-type': 'application/json' },
        }),
      });

      if (!xhr.responseType) {
        return this.skip();
      }

      expect(xhr.response).to.be.an('object');
    });

    it('should return type text', async function() {
      const { xhr } = await fakeRequest({
        preprocess(xhr) {
          xhr.responseType = 'text';
        },
        response: new Response('whatever'),
      });

      expect(xhr.response).to.equal('whatever');
    });

    it('should NOT throw error when parsing failed', async function() {
      let error = null;

      try {
        await fakeRequest({
          preprocess(xhr) {
            xhr.responseType = 'document';
          },
          response: new Response('{}'),
        });
      } catch (e) {
        error = e;
      }

      expect(error).to.be.null;
    });

    it('should return null when parsing failed', async function() {
      const { xhr } = await fakeRequest({
        preprocess(xhr) {
          xhr.responseType = 'document';
        },
        response: new Response('{}'),
      });

      expect(xhr.response).to.be.null;
    });
  });
}
