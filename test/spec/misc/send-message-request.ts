import { expect } from 'chai';
import { sendMessageRequest } from 'service-mocker/lib/utils';

export default function() {
  describe('sendMessageRequest', () => {
    it('should send message via MessageChannel', async () => {
      const promise = messageToPromise();
      sendMessageRequest(window, {}, Infinity);

      const { ports } = await promise;

      expect(ports).not.to.be.null;
      expect(ports).to.have.lengthOf(1);
    });

    it('should have recieved the message', async () => {
      const obj = { a: 1 };
      const promise = messageToPromise();
      sendMessageRequest(window, obj, Infinity);

      const { data } = await promise;

      expect(data).to.deep.equal(obj);
    });

    it('should be rejected with timeout', async () => {
      let errMsg = '';

      const promise = sendMessageRequest(window, '', 50).catch((e) => {
        errMsg = e.message;
      });

      await promise;

      expect(errMsg).to.contain('timeout');
    });

    it('should be rejected when result has `error` property', async () => {
      let error: any;
      const data = {
        error: 'whatever',
      };

      const promise = sendMessageRequest(window, '').catch(e => {
        error = e;
      });

      const { ports } = await messageToPromise();

      ports[0].postMessage(data);

      await promise;

      expect(error.error).to.equal(data.error);
    });
  });
}

function messageToPromise(): Promise<MessageEvent> {
  return new Promise((resolve) => {
    window.addEventListener('message', (evt) => {
      resolve(evt);
    });
  });
}
