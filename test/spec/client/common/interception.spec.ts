import { expect } from 'chai';

import {
  XHRtoPromise,
} from '../helpers/';

const api = require('../../api.json');

export function interceptionRunner() {
  describe('http requests interception', () => {
    it('fetch request to "/api" should be intercepted', async () => {
      const res = await fetch('/api');

      expect(await res.text()).to.be.equal(api['/api']);
    });

    it('XMLHttpRequest request to "/api" should be intercepted', async () => {
      const xhr = await XHRtoPromise('/api');

      expect(xhr.responseText).to.be.equal(api['/api']);
    });
  });
}
