import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import {
  uniquePath,
  sendRequest,
  requestToPromise,
} from '../../helpers/';

export default function() {
  describe('req.params', () => {
    it('should have a `.params` property', async () => {
      const request = await requestToPromise();

      expect(request).to.have.property('params')
        .and.that.is.an('object');
    });

    it('should have a `user` property in `req.params`', async () => {
      const path = uniquePath();
      const { params } = await requestToPromise({
        route: `${path}/:user`,
        requestURL: `${path}/dolphin`,
      });

      expect(params).to.have.property('user')
        .and.that.equals('dolphin');
    });

    it('should decode URI component', async () => {
      const path = uniquePath();
      const trackName = 'なんでもないや';

      const { params } = await requestToPromise({
        route: `${path}/:track`,
        requestURL: `${path}/${encodeURIComponent(trackName)}`,
      });

      expect(params.track).to.equal(trackName);
    });

    it('should throw an error to console', async function () {
      if (/Edge|Trident/.test(navigator.userAgent)) {
        // bad URI can be sent in IE
        return this.skip();
      }

      const { router } = createServer();
      const path = uniquePath();
      const badURI = '%E0%A4%A';

      let error: any;

      const nativeLog = console.error.bind(console);

      console.error = (...msg) => {
        error = msg;
      };

      router.get(`${path}/:id`, (res, req) => {
        req.send(res.params.id);

        console.error = nativeLog;
      });

      const { body } = await sendRequest(`${path}/${badURI}`);

      console.log(error);
      expect(error).not.to.be.undefined;
      expect(body).to.equal(JSON.stringify(null));
    });
  });
}
