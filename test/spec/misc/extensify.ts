import { expect } from 'chai';
import { extensify } from 'service-mocker/utils';

export default function() {
  describe('extensify', () => {
    it('should be a subclass of the native one', () => {
      const XHR = extensify(XMLHttpRequest);

      expect(new XHR()).to.be.an.instanceof(XMLHttpRequest);
    });

    it('should copy all properties from native', () => {
      const XHR = extensify(XMLHttpRequest);

      const native = new XMLHttpRequest();
      const ext = new XHR();

      for (let prop in native) {
        expect(ext).to.have.property(prop);
      }
    });
  });
}
