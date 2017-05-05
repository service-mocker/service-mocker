import { fakeRequest } from '../../../helpers/';

const EVENTS_LIST = [
  'readystatechange',
  'loadstart',
  'progress',
  'load',
  'loadend',
];

export default function () {
  describe('XMLHttpRequest events', () => {
    describe('with REAL requests', () => {
      it('should fire on-events', () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/', true);

        const promises = Promise.all(
          EVENTS_LIST.map((type) => XHREventToPromise(xhr, type)),
        );

        xhr.send();

        return promises;
      });

      it('should fire event listeners', () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/', true);

        const promises = Promise.all(
          EVENTS_LIST.map((type) => XHRListenerToPromise(xhr, type)),
        );

        xhr.send();

        return promises;
      });
    });

    describe('with MOCK requests', () => {
      it('should fire on-events', async () => {
        let promises;

        await fakeRequest({
          preprocess(xhr) {
            promises = Promise.all(
              EVENTS_LIST.map((type) => XHREventToPromise(xhr, type)),
            );
          },
        });

        return promises;
      });

      it('should fire event listeners', async () => {
        let promises;

        await fakeRequest({
          preprocess(xhr) {
            promises = Promise.all(
              EVENTS_LIST.map((type) => XHRListenerToPromise(xhr, type)),
            );
          },
        });

        return promises;
      });
    });
  });
}

function XHREventToPromise(xhr, type) {
  return new Promise((resolve, reject) => {
    xhr[`on${type}`] = resolve;
    eventTimeout(type, reject);
  });
}

function XHRListenerToPromise(xhr, type) {
  return new Promise((resolve, reject) => {
    xhr.addEventListener(type, resolve);
    eventTimeout(type, reject);
  });
}

function eventTimeout(type, reject) {
  setTimeout(() => {
    reject(new Error(`event "${type}" did't be called within 10s`));
  }, 10 * 1e3);
}
