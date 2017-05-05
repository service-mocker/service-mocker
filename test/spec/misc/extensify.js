import { expect } from 'chai';
import { extensify } from 'service-mocker/utils';

export default function () {
  describe('extensify', () => {
    it('should copy all properties from native', () => {
      const RR = extensify(Request);

      const native = new Request(('/'));
      const ext = new RR(('/'));

      for (let prop in native) {
        expect(ext).to.have.property(prop);
      }
    });
  });
}
