import { expect } from 'chai';
import { createServer } from 'service-mocker/server';
import * as mime from 'mime-component';
import * as httpStatus from 'statuses';

import { uniquePath } from './helpers/unique-path';
import { sendRequest } from './helpers/send-request';

export function responseRunner() {
  const { router } = createServer();

  describe('Response', () => {
    describe('.headers', () => {
      it('should has a `headers` property', async () => {
        let response: any;
        const path = uniquePath();

        router.get(path, (_req, res) => {
          response = res;
          res.end();
        });

        await sendRequest(path);

        expect(response).to.have.property('headers')
          .and.that.is.an.instanceof(Headers);
      });

      it('should send a `X-Test` header to client', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.headers.set('X-Test', 'ServiceMocker');
          res.end();
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('X-Test')).to.equal('ServiceMocker');
      });
    });

    describe('.status()', () => {
      it('should send a response with 202 status', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.status(202).end();
        });

        const { status } = await sendRequest(path);

        expect(status).to.equal(202);
      });

      it(`should send a response with "${httpStatus[202]}" statusText`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.status(202).end();
        });

        const { statusText } = await sendRequest(path);

        expect(statusText).to.equal(httpStatus[202]);
      });

      it(`should be able to set unknown status code`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.status(222).end();
        });

        const { status, statusText, body } = await sendRequest(path);

        expect(status).to.equals(222);
        expect(statusText).to.equal('222');
        expect(body).to.be.empty;
      });
    });

    describe('.type()', () => {
      it(`should send a response with contentType "${mime.lookup('json')}"`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.type('json').send({});
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('json'));
      });

      it(`should send a response with contentType "text/plain"`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.type('text/plain').send('ServiceMocker');
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal('text/plain');
      });
    });

    describe('.json()', () => {
      it('should send a response with JSON type', async () => {
        const path = uniquePath();
        const obj = { user: 'Dolphin' };

        router.get(path, (_req, res) => {
          res.json(obj);
        });

        const { headers, body } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('json'));
        expect(JSON.parse(body)).to.deep.equal(obj);
      });
    });

    describe('.sendStatus()', () => {
      it('should send a response with 202 status', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(202);
        });

        const { status, statusText, body } = await sendRequest(path);

        expect(status).to.equal(202);
        expect(statusText).to.equal(httpStatus[202]);
        expect(body).to.equal(httpStatus[202]);
      });

      it(`should send response with text type`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(222);
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equals(mime.lookup('text'));
      });

      it(`should be able to set unknown status code`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.sendStatus(222);
        });

        const { status, statusText, body } = await sendRequest(path);

        expect(status).to.equals(222);
        expect(statusText).to.equal('222');
        expect(body).to.equal('222');
      });
    });

    describe('.send()', () => {
      it('should end up empty response', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.send();
        });

        const { headers, body } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('text'));
        expect(body).to.be.empty;
      });

      it('should be able to do some asynchronous stuffs' , async () => {
        const path = uniquePath();

        router.post(path, async (req, res) => {
          const body = await req.text();
          res.send(body);
        });

        const { body } = await sendRequest(path, {
          method: 'POST',
          body: 'whatever',
        });

        expect(body).to.equal('whatever');
      });

      it(`should send a response with contentType "${mime.lookup('html')}"`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.send('<div>Hello new world</div>');
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('html'));
      });

      it(`should send ArrayBuffer with default contentType "${mime.lookup('bin')}"`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.send(new ArrayBuffer(8));
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('bin'));
      });

      it(`should send Blob with default contentType "${mime.lookup('bin')}"`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.send(new Blob());
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('bin'));
      });

      it(`should send Blob with it's own contentType`, async () => {
        const path = uniquePath();
        const contentType = mime.lookup('png');

        router.get(path, (_req, res) => {
          res.send(new Blob([], { type: contentType }));
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(contentType);
      });

      it('should not override current contentType', async () => {
        const path = uniquePath();
        const contentType = mime.lookup('html');

        router.get(path, (_req, res) => {
          res.type(contentType).send({});
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(contentType);
      });

      it('should convert number to JSON', async () => {
        const path = uniquePath();
        const num = 123;

        router.get(path, (_req, res) => {
          res.send(num);
        });

        const { headers, body } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('json'));
        expect(body).to.equal(JSON.stringify(num));
      });

      it('should convert boolean to JSON', async () => {
        const path = uniquePath();
        const bool = true;

        router.get(path, (_req, res) => {
          res.send(bool);
        });

        const { headers, body } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('json'));
        expect(body).to.equal(JSON.stringify(bool));
      });

      it('should convert object to JSON', async () => {
        const path = uniquePath();
        const obj = { id: 123 };

        router.get(path, (_req, res) => {
          res.send(obj);
        });

        const { headers, body } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('json'));
        expect(JSON.parse(body)).to.deep.equal(obj);
      });
    });

    describe('.end()', () => {
      it('should send an empty response body for HEAD request', async () => {
        const path = uniquePath();

        router.head(path, (_req, res) => {
          res.send('whatever');
        });

        const { body } = await sendRequest(path, {
          method: 'HEAD',
        });

        expect(body).to.be.empty;
      });

      it(`should send a response with default contentType "${mime.lookup('text')}"`, async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.end();
        });

        const { headers } = await sendRequest(path);

        expect(headers.get('content-type')).to.equal(mime.lookup('text'));
      });

      it('should send an empty response body for null body status', async function () {
        if (/Edge/.test(navigator.userAgent)) {
          // set a null status in IE Edge will raise a `TypeMismatchError` Error
          this.skip();
        }

        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.status(204).send('whatever');
        });

        const { body } = await sendRequest(path);

        expect(body).to.be.empty;
      });
    });

    describe('.forward()', () => {
      it('should forward the request with given URL', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.forward('/');
        });

        const { body } = await sendRequest(path);
        const realResponse = await sendRequest('/');

        expect(body).to.equal(realResponse.body);
      });

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

      it('should forward the request with given Request object', async () => {
        const path = uniquePath();

        router.get(path, (_req, res) => {
          res.forward(new Request('/'));
        });

        const { body } = await sendRequest(path);
        const realResponse = await sendRequest('/');

        expect(body).to.equal(realResponse.body);
      });

      it('should forward original MockerRequest', async () => {
        router.get('/', (req, res) => {
          res.forward(req);
        });

        const { body } = await sendRequest('/');

        const realResponse = await sendRequest('/');

        expect(body).to.equal(realResponse.body);
      });

      it('should forward a remote address', async () => {
        const baseURL = 'https://api.spotify.com';
        const requsetInfo = `${baseURL}/albums/3oTKl46yD2fsb1dtUYq6Nn`;

        router.base(baseURL).get('/albums/:id', (req, res) => {
          res.forward(`${req.baseURL}/v1${req.path}`);
        });

        const { body } = await sendRequest(requsetInfo);

        const realResponse = await sendRequest(requsetInfo);

        expect(body).to.equal(realResponse.body);
      });

      it('should forward a request with blob body', async () => {
        let newRequest: any;

        const contentType = mime.lookup('png');
        const path = uniquePath();
        const init = {
          method: 'OPTIONS',
          body: new Blob([], {
            type: contentType,
          }),
        };

        router.options(path, async (_req, res) => {
          const global: any = self;
          const nativeFetch = self.fetch;

          global.fetch = (input, init) => {
            newRequest = new Request(input, init);
            res.end();
          };

          await res.forward('/');

          global.fetch = nativeFetch;
        });

        await sendRequest(path, init);

        const blob = await newRequest.blob();

        expect(blob.type).to.equal(contentType);
      });

      it('should forward a request with text body', async () => {
        let newRequest: any;

        const body = 'ServiceMocker';
        const path = uniquePath();
        const init = {
          body,
          method: 'OPTIONS',
        };

        router.options(path, async (_req, res) => {
          const global: any = self;
          const nativeFetch = self.fetch;

          global.fetch = (input, init) => {
            newRequest = new Request(input, init);
            res.end();
          };

          await res.forward('/');

          global.fetch = nativeFetch;
        });

        await sendRequest(path, init);

        expect(await newRequest.text()).to.equal(body);
      });
    });
  });
}
