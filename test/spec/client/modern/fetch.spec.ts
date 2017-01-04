import { expect } from 'chai';

export function fetchRunner() {
  describe('fetch interception', () => {
    it('request to "/api" should be intercepted', async () => {
      const res = await fetch('/api');

      expect(await res.text()).to.be.equal('Hello new world!');
    });
  });
};
