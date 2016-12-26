import { expect } from 'chai';
import { client } from './client';

export default () => {
  describe('fetch interception', () => {
    it('request to "/api" should be intercepted', async () => {
      await client.ready;

      const res = await fetch('/api');

      expect(await res.text()).to.be.equal('Hello new world!');
    });
  });
};
