/**
 * Make `XMLHttpRequest` extendable
 *
 * Notes:
 * - Main concepts:
 *   1. Implement another XHR is considered tough and meaningless, FYI:
 *      <https://github.com/nuysoft/Mock/blob/refactoring/src/mock/xhr/xhr.js>
 *   2. The best way to make another XHR is extending native constructor with
 *      overriding some methods. However, extending XMLHttpRequest raises an error
 *      <Failed to construct 'XMLHttpRequest': Please use the 'new' operator,
 *      this DOM object constructor cannot be called as a function.>
 *   3. So we should extend `XMLHttpRequest` in some ways that are not constructing
 *      XHR with `XMLHttpRequest.call(this)`:
 *      3.1. Look back to JavaScript inheritance, no matter which method we choose to
 *           use, we are almost doing the same thing: let the execution context of
 *           `SuperClass.prototype.method` be the instance of `SubClass`.
 *      3.2. Thus if we bind `XMLHttpRequest.prototype.method` with a XHR instance,
 *           we can be free to invoke all methods in prototype! Then attaching these
 *           methods to the `ExtandableXHR.prototype`, the instances of `ExtandableXHR` will act
 *           as if they're real XHR instances!
 *
 * - Implementation of `ExtandableXHR`:
 *   1. Create a normal class with `this.nativeXHR` pointing to a XHR instance,
 *   2. Iterate through the descriptors of `XMLHttpRequest.prototype`:
 *      2.1. If the property is a primitive value, do nothing,
 *      2.2. If the property is an accessor, bind `get` and `set` with `this.nativeXHR`,
 *      2.3. If the property is a function, bind it with `this.nativeXHR`,
 *      2.4. Copy the descriptor to `ExtandableXHR.prototype`
 *   3. Iterate through the descriptors of `XMLHttpRequest`, copy them to `ExtandableXHR` as
 *      static methods.
 */

const NativeXHR = XMLHttpRequest;

export interface ExtandableXHR extends XMLHttpRequest {}

export class ExtandableXHR {
  // init a real XHR instance
  protected _nativeXHR = new NativeXHR();
}

// copy all static properties
// safari 9- will include a "prototype" property
try {
  Object.keys(NativeXHR).forEach(prop => {
    Object.defineProperty(
      ExtandableXHR, prop,
      Object.getOwnPropertyDescriptor(NativeXHR, prop),
    );
  });
} catch (e) {
  // do nothing
}

// delegate all unset properties to `nativeXHR`
(function mapPrototypeMethods(
  source = NativeXHR.prototype,
  target = ExtandableXHR.prototype,
) {
  if (source.constructor === Object) {
    // exit recursion
    return;
  }

  Object.keys(source).forEach(prop => {
    if (target.hasOwnProperty(prop)) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(source, prop);

    if (descriptor.get || descriptor.set) {
      descriptor.get = function getNative() {
        return this._nativeXHR[prop];
      };

      descriptor.set = function setNative(value) {
        this._nativeXHR[prop] = value;
        return value;
      };
    } else if (typeof descriptor.value === 'function') {
      // method
      const nativeFn = descriptor.value;
      descriptor.value = function wrapped(...args) {
        return nativeFn.apply(this._nativeXHR, args);
      };
    }

    Object.defineProperty(target, prop, descriptor);
  });

  // recursively look-up
  mapPrototypeMethods(Object.getPrototypeOf(source), target);
})();

// safari 9- don't have these properties on `XMLHttpRequest.prototype`
[
  'onabort',
  'onerror',
  'onload',
  'onloadend',
  'onloadstart',
  'onprogress',
  'onreadystatechange',
  'ontimeout',
  'readyState',
  'response',
  'responseText',
  'responseType',
  'responseURL',
  'responseXML',
  'status',
  'statusText',
  'timeout',
  'upload',
  'withCredentials',
].forEach((prop) => {
  if (ExtandableXHR.prototype.hasOwnProperty(prop)) {
    return;
  }

  Object.defineProperty(ExtandableXHR.prototype, prop, {
    get() {
      return this._nativeXHR[prop];
    },
    set(value: any) {
      this._nativeXHR[prop] = value;
      return value;
    },
    enumerable: true,
    configurable: true,
  });
});
