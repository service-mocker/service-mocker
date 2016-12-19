import 'es6-promise/auto';
import 'whatwg-fetch';

import { LegacyClient } from '../../src/client/legacy/client';
import { PrefixedConsole } from '../../src/utils/';

const debug = new PrefixedConsole('legacy');
const client = new LegacyClient('sw.js');
(window as any).client = client;

const EVENTS_LIST = [
  'readystatechange',
  'loadstart',
  'progress',
  'load',
  'loadend',
];

const assertLog = new PrefixedConsole('assert');

function assert(isEqual: boolean, msg) {
  if (isEqual) {
    assertLog.scope('passed').color('green').log(msg);
  } else {
    assertLog.scope('failed').error(msg);
  }
}

function xhrEventToPromise(xhr: XMLHttpRequest, type: string): Promise<any> {
  return new Promise((resolve) => {
    xhr[`on${type}`] = resolve;
    setTimeout(resolve, 1000);
  });
}

function xhrListenerToPromise(xhr: XMLHttpRequest, type: string): Promise<any> {
  return new Promise((resolve) => {
    xhr.addEventListener(type, resolve);
    setTimeout(resolve, 1000);
  });
}

try {
  navigator.serviceWorker.getRegistration().then((res) => {
    if (res) {
      res.unregister();
      location.reload();
    }
  }).catch(() => {
    // remove chrome warning
  });
} catch (e) {
  // do nothing
}

client.ready.then((reg) => {
  debug.info(reg);
  assert(client.controller === window, 'Legacy controller should be window');
  assert(reg.active === client.controller, 'Active worker should be equal to client controller');

  // fetch
  fetch('api').then(res => res.text()).then(res => {
    debug.scope('fetch').info('api/', res);
    assert(res.trim() === 'Hello new world!', 'Fetch to "api/" should be intercepted');
  });

  fetch('jsondata').then(res => res.json()).then((res: any) => {
    debug.scope('fetch').info('jsondata/', res);
    assert(res.legacy, 'Fetch to "jsondata/" should be proxied');
  });

  // xhr
  assert((XMLHttpRequest as any).mockerPatched, 'Native XHR should be patched');

  // native request
  {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'index.html', true);
    xhr.responseType = 'document';
    xhr.send();

    EVENTS_LIST.forEach(type => {
      const assertion = handlerType => evt => assert(
        evt && evt.type === type,
        `${type} event should be fired in REAL request with ${handlerType}`,
      );

      xhrEventToPromise(xhr, type).then(assertion('on-event'));
      xhrListenerToPromise(xhr, type).then(assertion('addEventListener'));
    });

    xhr.addEventListener('load', () => {
      debug.scope('XHR').info('index.html', xhr.response);
      assert(xhr.response instanceof Document, 'XHR get "index.html" should return Document');
    });
  }

  // mock request
  {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'api', true);
    xhr.send();

    EVENTS_LIST.forEach(type => {
      const assertion = handlerType => evt => assert(
        evt && evt.type === type,
        `${type} event should be fired in MOCK request with ${handlerType}`,
      );

      xhrEventToPromise(xhr, type).then(assertion('on-event'));
      xhrListenerToPromise(xhr, type).then(assertion('addEventListener'));
    });

    xhr.addEventListener('load', () => {
      debug.scope('XHR').info('api/', xhr.response);
      assert(xhr.responseText.trim() === 'Hello new world!', 'XHR request to "api/" should be intercepted');
    });
  }

  // mock json request
  {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'jsondata', true);
    xhr.responseType = 'json';
    xhr.send();

    xhr.addEventListener('load', () => {
      // fuck IE
      const res = typeof xhr.response === 'string' ? JSON.parse(xhr.response) : xhr.response;

      debug.scope('XHR').info('jsondata/', res);

      assert(
        res.message.trim() === 'Hello new legacy world!',
        'XHR request to "jsondata/" should be proxied',
      );
    });
  }

});
