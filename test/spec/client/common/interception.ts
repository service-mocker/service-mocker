import { expect } from 'chai';

import {
  XHRtoPromise,
} from '../helpers/xhr';

export function interceptionRunner() {
  describe('HTTP requests interception', () => {
    it('fetch request to "/api" should be intercepted', async () => {
      const res = await fetch('/api');

      expect(await res.text()).to.be.equal('Hello new world!');
    });

    it('XMLHttpRequest request to "/api" should be intercepted', async () => {
      const xhr = await XHRtoPromise('/api');

      expect(xhr.responseText).to.be.equal('Hello new world!');
    });
  });
}
