export function XHRtoPromise(path: string, preprocessor?: (xhr: XMLHttpRequest) => void): Promise<XMLHttpRequest> {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', path, true);

  if (preprocessor) {
    preprocessor(xhr);
  }

  xhr.send();

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      resolve(xhr);
    };

    xhr.onerror = reject;
  });
}

export function XHREventToPromise(xhr: XMLHttpRequest, type: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xhr[`on${type}`] = resolve;
    eventTimeout(type, reject);
  });
}

export function XHRListenerToPromise(xhr: XMLHttpRequest, type: string): Promise<any> {
  return new Promise((resolve, reject) => {
    xhr.addEventListener(type, resolve);
    eventTimeout(type, reject);
  });
}

function eventTimeout(type: string, reject: (reason?: any) => void) {
  setTimeout(() => {
    reject(new Error(`event "${type}" did't be called within 10s`));
  }, 10 * 1e3);
}
