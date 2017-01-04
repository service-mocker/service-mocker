import { expect } from 'chai';

const EVENTS_LIST = [
  'readystatechange',
  'loadstart',
  'progress',
  'load',
  'loadend',
];

export function xhrRunner () {
  const mode = (XMLHttpRequest as any).mockerPatched ? 'Patched' : 'Native';

  function desc(title: string, cb: () => void) {
    describe(`[${mode}] ${title}`, function () {
      this.timeout(10 * 1e3);
      cb.call(this);
    });
  }

  desc(`XHR interception`, () => {
    it('request to "/api" should be intercepted', async () => {
      const xhr = await XHRtoPromise('/api');

      expect(xhr.responseText).to.be.equal('Hello new world!');
    });
  });

  desc(`XHR patch with REAL requests`, () => {
    it('on-event should be fired', async () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/', true);

      const promises = Promise.all(
        EVENTS_LIST.map(type => XHREventToPromise(xhr, type)),
      );

      xhr.send();

      return promises;
    });

    it('addEventListener() should be fired', async () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/', true);

      const promises = Promise.all(
        EVENTS_LIST.map(type => XHRListenerToPromise(xhr, type)),
      );

      xhr.send();

      return promises;
    });
  });

  desc(`XHR patch with MOCK requests`, () => {
    it('on-event should be fired', async () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api', true);

      const promises = Promise.all(
        EVENTS_LIST.map(type => XHREventToPromise(xhr, type)),
      );

      xhr.send();

      return promises;
    });

    it('addEventListener() should be fired', async () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api', true);

      const promises = Promise.all(
        EVENTS_LIST.map(type => XHRListenerToPromise(xhr, type)),
      );

      xhr.send();

      return promises;
    });
  });

  desc(`XHR responseType`, () => {
    it('should return type Document', async () => {
      const xhr = await XHRtoPromise('/', {
        responseType: 'document',
      });

      expect(xhr.response).to.be.instanceof(Document);
    });
  });
}

function eventTimeout(type: string, reject: (reason?: any) => void) {
  setTimeout(() => {
    reject(new Error(`event "${type}" did't be called within 10s`));
  }, 10 * 1e3);
}

function XHRtoPromise(path: string, options?: any): Promise<XMLHttpRequest> {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', path, true);

  if (options) {
    Object.keys(options).forEach(prop => {
      xhr[prop] = options[prop];
    });
  }

  xhr.send();

  return new Promise((resolve) => {
    xhr.onload = () => {
      resolve(xhr);
    };
  });
}

function XHREventToPromise(xhr: XMLHttpRequest, type: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xhr[`on${type}`] = resolve;
    eventTimeout(type, reject);
  });
}

function XHRListenerToPromise(xhr: XMLHttpRequest, type: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xhr.addEventListener(type, resolve);
    eventTimeout(type, reject);
  });
}
