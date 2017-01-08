import { expect } from 'chai';

import {
  XHRtoPromise,
  XHREventToPromise,
  XHRListenerToPromise,
} from '../helpers/';

const EVENTS_LIST = [
  'readystatechange',
  'loadstart',
  'progress',
  'load',
  'loadend',
];

export function XHRRunner () {
  describe('XHR patch', () => {
    it('should be marked with `mockerPatched`', () => {
      expect(XMLHttpRequest).to.have.property('mockerPatched')
        .and.that.is.true;
    });

    it('should have a reference to native `XMLHttpRequest`', () => {
      expect(XMLHttpRequest).to.have.property('native');
    });
  });

  describe('XHR patch with REAL requests', () => {
    it('on-event should be fired', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/', true);

      const promises = Promise.all(
        EVENTS_LIST.map(type => XHREventToPromise(xhr, type)),
      );

      xhr.send();

      return promises;
    });

    it('addEventListener() should be fired', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/', true);

      const promises = Promise.all(
        EVENTS_LIST.map(type => XHRListenerToPromise(xhr, type)),
      );

      xhr.send();

      return promises;
    });
  });

  describe('XHR patch with MOCK requests', () => {
    it('on-event should be fired', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api', true);

      const promises = Promise.all(
        EVENTS_LIST.map(type => XHREventToPromise(xhr, type)),
      );

      xhr.send();

      return promises;
    });

    it('addEventListener() should be fired', () => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api', true);

      const promises = Promise.all(
        EVENTS_LIST.map(type => XHRListenerToPromise(xhr, type)),
      );

      xhr.send();

      return promises;
    });
  });

  describe('XHR responseType', () => {
    it('should return type Document', async () => {
      const xhr = await XHRtoPromise('/', {
        responseType: 'document',
      });

      expect(xhr.response).to.be.instanceof(Document);
    });
  });
}
