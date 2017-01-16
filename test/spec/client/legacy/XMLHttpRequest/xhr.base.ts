import { expect } from 'chai';

export default function() {
  describe('XMLHttpRequest patch', () => {
    describe('Infrastructure', () => {
      it('should be marked with `mockerPatched`', () => {
        expect(XMLHttpRequest).to.have.property('mockerPatched')
          .and.that.is.true;
      });

      it('should have a reference to native `XMLHttpRequest`', () => {
        expect(XMLHttpRequest).to.have.property('native');
      });

      it('should obtain all properties that native XHR have', () => {
        const xhr = new XMLHttpRequest();
        const nativeXHR = new (XMLHttpRequest as any).native();

        for (let prop in nativeXHR) {
          expect(xhr).to.have.property(prop);
        }
      });
    });
  });
}
