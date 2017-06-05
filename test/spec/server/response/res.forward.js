import { expect } from 'chai';
import { createServer } from 'service-mocker/server';

import mime from 'mime-component';

import {
  uniquePath,
  sendRequest,
} from '../../helpers/';

export default function () {
  const { router } = createServer();

  describe('res.forward(url)', () => {
    it('should forward the request with given URL', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.forward('/');
      });

      const { body } = await sendRequest(path);
      const realResponse = await sendRequest('/');

      expect(body).to.equal(realResponse.body);
    });

    it('should forward a remote address', async () => {
      const baseURL = 'https://api.github.com';
      const requsetInfo = `${baseURL}/organizations/service-mocker`;

      const { router } = createServer(baseURL);

      router.get('/organizations/:org', (req, res) => {
        res.forward(`${req.baseURL}/orgs/${req.params.org}`);
      });

      const { body } = await sendRequest(requsetInfo);

      const realResponse = await sendRequest(requsetInfo);

      expect(body).to.equal(realResponse.body);
    });

    describe('when original request contains body', () => {
      it('should forward a request with blob body', async () => {
        const contentType = mime.lookup('png');
        const path = uniquePath();
        const init = {
          method: 'OPTIONS',
          body: new Blob([], {
            type: contentType,
          }),
        };

        let capture;

        router.options(path, (_req, res) => {
          capture = captureFetch();
          res.forward('/');
        });

        await sendRequest(path, init);

        const blob = await capture.request.blob();

        expect(blob.type).to.equal(contentType);
      });

      it('should forward a request with text body', async () => {
        const body = 'ServiceMocker';
        const path = uniquePath();
        const init = {
          body,
          method: 'OPTIONS',
        };

        let capture;

        router.options(path, (_req, res) => {
          capture = captureFetch();
          res.forward('/');
        });

        await sendRequest(path, init);

        expect(await capture.request.text()).to.equal(body);
      });
    });
  });

  describe('res.forward(Request)', () => {
    it('should forward the request with the given native Request object', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.forward(new Request('/'));
      });

      const { body } = await sendRequest(path);
      const realResponse = await sendRequest('/');

      expect(body).to.equal(realResponse.body);
    });
  });

  describe('res.forward(MockerRequest)', () => {
    it('should forward original MockerRequest', async () => {
      router.get('/', (req, res) => {
        res.forward(req);
      });

      const { body } = await sendRequest('/');

      const realResponse = await sendRequest('/');

      expect(body).to.equal(realResponse.body);
    });
  });

  describe('res.forward(url, init)', () => {
    it('should forward the request with given RequestInit', async () => {
      const path = uniquePath();

      router.get(path, (_req, res) => {
        res.forward('/', {
          method: 'HEAD',
        });
      });

      const { body } = await sendRequest(path);

      expect(body).to.be.empty;
    });

    it('should forward the request with given body', async () => {
      const contentType = mime.lookup('png');
      const path = uniquePath();
      const init = {
        method: 'POST',
        body: new Blob([], {
          type: contentType,
        }),
      };

      let capture;

      router.get(path, (_req, res) => {
        capture = captureFetch();
        res.forward('/', init);
      });

      await sendRequest(path);

      const blob = await capture.request.blob();

      expect(blob.type).to.equal(contentType);
    });
  });
}

/**
 * Patch global fetch to make it capturable
 */
function captureFetch() {
  let request;

  const realFetch = self.fetch.real || self.fetch;

  const fakeFetch = (input, init) => {
    request = new Request(input, init);

    return Promise.resolve(new Response('fake fetch'));
  };
  fakeFetch.real = realFetch;

  self.fetch = fakeFetch;

  return {
    get request() {
      self.fetch = realFetch;
      return request;
    },
  };
};
