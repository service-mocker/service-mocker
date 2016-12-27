import { expect } from 'chai';

export function noopRunner() {
  describe('noop', () => {
    it('1+1=2', () => {
      expect(1 + 1).to.be.equal(2);
    });
  });
}
