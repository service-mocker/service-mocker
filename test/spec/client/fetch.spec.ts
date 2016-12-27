import { expect } from 'chai';

export function fetchRunner() {
  const mode = (fetch as any).mockerPatched ? 'Patched' : 'Native';

  describe(`[${mode}] fetch interception`, () => {
    it('request to "/api" should be intercepted', async () => {
      const res = await fetch('/api');

      expect(await res.text()).to.be.equal('Hello new world!');
    });
  });
};
