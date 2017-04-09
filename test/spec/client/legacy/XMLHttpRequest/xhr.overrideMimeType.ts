import { expect } from 'chai';

import { fakeRequest } from '../../../helpers/';

export default function() {
  describe('xhr.overrideMimeType()', () => {
    it('should get contentType "text/plain"', async function() {
      // overrideMimeType is only supported on IE11+
      if (!(XMLHttpRequest as any).native.prototype.overrideMimeType) {
        this.skip();
        return;
      }

      const { xhr } = await fakeRequest({
        preprocess(xhr) {
          xhr.overrideMimeType('text/plain');
        },
        response: new Response(JSON.stringify({}), {
          headers: { 'content-type': 'application/json' },
        }),
      });

      const contentType = xhr.getResponseHeader('content-type');

      expect(contentType).to.equal('text/plain');
    });
  });
}
